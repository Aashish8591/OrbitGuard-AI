package com.orbitguard.orbit.propagation.service;

import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.mapper.DebrisOrbitalPropagationMapper;
import com.orbitguard.orbit.propagation.mapper.SatelliteOrbitalPropagationMapper;
import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import com.orbitguard.satellite.repository.SatelliteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrbitalPropagationFacadeImpl
        implements OrbitalPropagationFacade {

    private final CelesTrakService celesTrakService;

    private final CelesTrakDebrisService celesTrakDebrisService;

    private final SatelliteOrbitalPropagationMapper
            satelliteOrbitalPropagationMapper;

    private final DebrisOrbitalPropagationMapper
            debrisOrbitalPropagationMapper;

    private final OrbitalPropagationService
            orbitalPropagationService;

    private final CoordinateConversionService
            coordinateConversionService;

    private final SatelliteRepository satelliteRepository;

    private final DebrisRepository debrisRepository;

    /**
     * ================================================================
     * SINGLE SATELLITE PROPAGATION
     * ================================================================
     *
     * Existing single-object flow is intentionally preserved.
     *
     * Flow:
     *
     * Satellite NORAD ID
     *        ↓
     * CelesTrakService
     *        ↓
     * CelesTrakOrbitalData
     *        ↓
     * SatelliteOrbitalPropagationMapper
     *        ↓
     * OrbitalPropagationInput
     *        ↓
     * OrbitalPropagationService
     *        ↓
     * PropagatedOrbitalState
     */
    @Override
    public PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {

        validateSatelliteNoradId(noradCatalogId);
        validateTargetTime(targetTime);

        List<
                com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData
                > orbitalDataList =
                celesTrakService.fetchSatelliteOrbitalData(
                        noradCatalogId
                );

        if (orbitalDataList == null || orbitalDataList.isEmpty()) {
            throw new IllegalArgumentException(
                    "No orbital data found for satellite NORAD ID: "
                            + noradCatalogId
            );
        }

        com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData
                orbitalData = orbitalDataList.get(0);

        if (orbitalData == null) {
            throw new IllegalArgumentException(
                    "Satellite orbital data is null for NORAD ID: "
                            + noradCatalogId
            );
        }

        OrbitalPropagationInput input =
                satelliteOrbitalPropagationMapper.toPropagationInput(
                        orbitalData,
                        targetTime
                );

        if (input == null) {
            throw new IllegalStateException(
                    "Failed to create orbital propagation input "
                            + "for satellite NORAD ID: "
                            + noradCatalogId
            );
        }

        return orbitalPropagationService.propagate(input);
    }

    /**
     * ================================================================
     * SINGLE DEBRIS PROPAGATION
     * ================================================================
     *
     * Existing single-object flow is intentionally preserved.
     */
    @Override
    public PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime
    ) {

        validateDebrisNoradId(noradId);
        validateTargetTime(targetTime);

        CelesTrakOrbitalData orbitalData =
                celesTrakDebrisService.fetchOrbitalData(noradId);

        if (orbitalData == null) {
            throw new IllegalArgumentException(
                    "No orbital data found for debris NORAD ID: "
                            + noradId
            );
        }

        OrbitalPropagationInput input =
                debrisOrbitalPropagationMapper.toPropagationInput(
                        orbitalData,
                        targetTime
                );

        if (input == null) {
            throw new IllegalStateException(
                    "Failed to create orbital propagation input "
                            + "for debris NORAD ID: "
                            + noradId
            );
        }

        return orbitalPropagationService.propagate(input);
    }

    /**
     * ================================================================
     * SINGLE SATELLITE WITH POSITION
     * ================================================================
     */
    @Override
    public PropagatedOrbitalData propagateSatelliteWithPosition(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {

        PropagatedOrbitalState orbitalState =
                propagateSatellite(
                        noradCatalogId,
                        targetTime
                );

        return buildPropagatedOrbitalData(orbitalState);
    }

    /**
     * ================================================================
     * SINGLE DEBRIS WITH POSITION
     * ================================================================
     */
    @Override
    public PropagatedOrbitalData propagateDebrisWithPosition(
            Long noradId,
            LocalDateTime targetTime
    ) {

        PropagatedOrbitalState orbitalState =
                propagateDebris(
                        noradId,
                        targetTime
                );

        return buildPropagatedOrbitalData(orbitalState);
    }

    /**
     * ================================================================
     * BULK PROPAGATION FOR 3D VISUALIZATION
     * ================================================================
     *
     * IMPORTANT:
     *
     * This method does NOT call CelesTrak.
     *
     * All required orbital elements have already been synchronized
     * and stored in MongoDB.
     *
     * Flow:
     *
     * MongoDB
     *   ├── active satellites
     *   └── active debris
     *          ↓
     * OrbitalPropagationInput
     *          ↓
     * Existing SGP4/Orekit engine
     *          ↓
     * PropagatedOrbitalState
     *          ↓
     * TEME → coordinate conversion
     *          ↓
     * PropagatedOrbitalData
     */
    @Override
    public List<PropagatedOrbitalData> propagateAllWithPosition(
            LocalDateTime targetTime
    ) {

        validateTargetTime(targetTime);

        List<PropagatedOrbitalData> results =
                new ArrayList<>();

        /*
         * ------------------------------------------------------------
         * SATELLITES
         * ------------------------------------------------------------
         */
        List<Satellite> satellites =
                satelliteRepository.findByActiveTrue();

        if (satellites != null && !satellites.isEmpty()) {

            for (Satellite satellite : satellites) {

                if (!hasRequiredSatellitePropagationData(satellite)) {
                    continue;
                }

                try {

                    OrbitalPropagationInput input =
                            buildSatellitePropagationInput(
                                    satellite,
                                    targetTime
                            );

                    PropagatedOrbitalState orbitalState =
                            orbitalPropagationService.propagate(
                                    input
                            );

                    if (orbitalState == null) {
                        continue;
                    }

                    results.add(
                            buildPropagatedOrbitalData(
                                    orbitalState
                            )
                    );

                } catch (RuntimeException exception) {

                    /*
                     * One invalid satellite must not prevent the
                     * remaining orbital objects from appearing
                     * in the 3D visualization.
                     */
                    continue;
                }
            }
        }

        /*
         * ------------------------------------------------------------
         * DEBRIS
         * ------------------------------------------------------------
         *
         * IMPORTANT:
         * The repository exposes findByIsActiveTrue().
         * Do not use findAllByIsActiveTrue().
         */
        List<SpaceDebris> debrisObjects =
                debrisRepository.findByIsActiveTrue();

        if (debrisObjects != null && !debrisObjects.isEmpty()) {

            for (SpaceDebris debris : debrisObjects) {

                if (!hasRequiredDebrisPropagationData(debris)) {
                    continue;
                }

                try {

                    OrbitalPropagationInput input =
                            buildDebrisPropagationInput(
                                    debris,
                                    targetTime
                            );

                    PropagatedOrbitalState orbitalState =
                            orbitalPropagationService.propagate(
                                    input
                            );

                    if (orbitalState == null) {
                        continue;
                    }

                    results.add(
                            buildPropagatedOrbitalData(
                                    orbitalState
                            )
                    );

                } catch (RuntimeException exception) {

                    /*
                     * One invalid debris record must not stop the
                     * complete visualization dataset.
                     */
                    continue;
                }
            }
        }

        return results;
    }

    /**
     * ================================================================
     * SATELLITE -> PROPAGATION INPUT
     * ================================================================
     *
     * Builds the normalized propagation input directly from the
     * MongoDB satellite entity.
     *
     * This avoids an unnecessary CelesTrak request during bulk
     * visualization.
     */
    private OrbitalPropagationInput buildSatellitePropagationInput(
            Satellite satellite,
            LocalDateTime targetTime
    ) {

        return OrbitalPropagationInput.builder()
                .noradCatalogId(
                        satellite.getNoradCatalogId() != null
                                ? satellite.getNoradCatalogId().longValue()
                                : null
                )
                .classificationType(
                        satellite.getClassificationType()
                )
                .epoch(
                        satellite.getEpoch()
                )
                .objectId(
                        satellite.getObjectId()
                )
                .ephemerisType(
                        satellite.getEphemerisType()
                )
                .meanMotion(
                        satellite.getMeanMotion()
                )
                .meanMotionDot(
                        satellite.getMeanMotionDot()
                )
                .meanMotionDdot(
                        satellite.getMeanMotionDdot()
                )
                .eccentricity(
                        satellite.getEccentricity()
                )
                .inclination(
                        satellite.getInclination()
                )
                .rightAscensionOfAscendingNode(
                        satellite.getRightAscensionOfAscendingNode()
                )
                .argumentOfPericenter(
                        satellite.getArgumentOfPericenter()
                )
                .meanAnomaly(
                        satellite.getMeanAnomaly()
                )
                .bstar(
                        satellite.getBstar()
                )
                .elementSetNumber(
                        satellite.getElementSetNumber()
                )
                .revolutionAtEpoch(
                        satellite.getRevolutionAtEpoch() != null
                                ? satellite.getRevolutionAtEpoch().longValue()
                                : null
                )
                .targetTime(targetTime)
                .build();
    }

    /**
     * ================================================================
     * DEBRIS -> PROPAGATION INPUT
     * ================================================================
     */
    private OrbitalPropagationInput buildDebrisPropagationInput(
            SpaceDebris debris,
            LocalDateTime targetTime
    ) {

        return OrbitalPropagationInput.builder()
                .noradCatalogId(
                        debris.getNoradId()
                )
                .classificationType(
                        debris.getClassificationType()
                )
                .epoch(
                        debris.getEpoch()
                )
                .objectId(
                        debris.getObjectId()
                )
                .ephemerisType(
                        debris.getEphemerisType()
                )
                .meanMotion(
                        debris.getMeanMotion()
                )
                .meanMotionDot(
                        debris.getMeanMotionDot()
                )
                .meanMotionDdot(
                        debris.getMeanMotionDdot()
                )
                .eccentricity(
                        debris.getEccentricity()
                )
                .inclination(
                        debris.getInclination()
                )
                .rightAscensionOfAscendingNode(
                        debris.getRightAscensionOfAscendingNode()
                )
                .argumentOfPericenter(
                        debris.getArgumentOfPericenter()
                )
                .meanAnomaly(
                        debris.getMeanAnomaly()
                )
                .bstar(
                        debris.getBstar()
                )
                .elementSetNumber(
                        debris.getElementSetNumber()
                )
                .revolutionAtEpoch(
                        debris.getRevolutionAtEpoch()
                )
                .targetTime(targetTime)
                .build();
    }

    /**
     * ================================================================
     * SATELLITE PROPAGATION DATA VALIDATION
     * ================================================================
     */
    private boolean hasRequiredSatellitePropagationData(
            Satellite satellite
    ) {

        if (satellite == null) {
            return false;
        }

        return satellite.getNoradCatalogId() != null
                && satellite.getNoradCatalogId() > 0
                && satellite.getEpoch() != null
                && satellite.getMeanMotion() != null
                && satellite.getEccentricity() != null
                && satellite.getInclination() != null
                && satellite.getRightAscensionOfAscendingNode() != null
                && satellite.getArgumentOfPericenter() != null
                && satellite.getMeanAnomaly() != null;
    }

    /**
     * ================================================================
     * DEBRIS PROPAGATION DATA VALIDATION
     * ================================================================
     */
    private boolean hasRequiredDebrisPropagationData(
            SpaceDebris debris
    ) {

        if (debris == null) {
            return false;
        }

        return debris.getNoradId() != null
                && debris.getNoradId() > 0
                && debris.getEpoch() != null
                && debris.getMeanMotion() != null
                && debris.getEccentricity() != null
                && debris.getInclination() != null
                && debris.getRightAscensionOfAscendingNode() != null
                && debris.getArgumentOfPericenter() != null
                && debris.getMeanAnomaly() != null;
    }

    /**
     * ================================================================
     * BUILD PROPAGATED DATA
     * ================================================================
     *
     * Converts the propagated orbital state into the combined
     * propagation data object.
     *
     * CoordinateConversionService is responsible for converting
     * the propagated TEME position into:
     *
     * - ITRF Earth-fixed Cartesian coordinates
     * - WGS84 geodetic coordinates
     */
    private PropagatedOrbitalData buildPropagatedOrbitalData(
            PropagatedOrbitalState orbitalState
    ) {

        if (orbitalState == null) {
            throw new IllegalStateException(
                    "Propagated orbital state must not be null."
            );
        }

        return PropagatedOrbitalData.builder()
                .orbitalState(orbitalState)
                .geodeticPosition(
                        coordinateConversionService
                                .toGeodeticPosition(orbitalState)
                )
                .earthFixedPosition(
                        coordinateConversionService
                                .toEarthFixedPosition(orbitalState)
                )
                .build();
    }

    /**
     * ================================================================
     * VALIDATION
     * ================================================================
     */
    private void validateSatelliteNoradId(
            Integer noradCatalogId
    ) {

        if (noradCatalogId == null || noradCatalogId <= 0) {
            throw new IllegalArgumentException(
                    "Satellite NORAD catalog ID must be greater than zero."
            );
        }
    }

    private void validateDebrisNoradId(
            Long noradId
    ) {

        if (noradId == null || noradId <= 0) {
            throw new IllegalArgumentException(
                    "Debris NORAD ID must be greater than zero."
            );
        }
    }

    private void validateTargetTime(
            LocalDateTime targetTime
    ) {

        if (targetTime == null) {
            throw new IllegalArgumentException(
                    "Target propagation time must not be null."
            );
        }
    }
}