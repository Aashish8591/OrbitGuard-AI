package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationService;
import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteSyncMapper;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import com.orbitguard.satellite.integration.celestrak.service.SatelliteSynchronizationService;
import com.orbitguard.satellite.repository.SatelliteRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SatelliteSynchronizationServiceImpl
        implements SatelliteSynchronizationService {

    /**
     * Mean Earth radius used for deriving geocentric
     * altitude from the propagated Earth-centered
     * position.
     *
     * Unit: kilometers.
     */
    private static final double EARTH_RADIUS_KM = 6371.0088;

    private final CelesTrakService celesTrakService;

    private final SatelliteRepository satelliteRepository;

    private final CelesTrakSatelliteSyncMapper syncMapper;

    private final OrbitalPropagationService orbitalPropagationService;

    /**
     * Synchronizes satellite records from a CelesTrak group
     * into the local MongoDB satellite collection.
     *
     * <p>
     * NORAD catalog ID is used as the external identity
     * of a satellite.
     * </p>
     *
     * <pre>
     * CelesTrak
     *      ↓
     * CelesTrakService
     *      ↓
     * CelesTrakSatelliteResponse
     *      ↓
     * Validate NORAD ID
     *      ↓
     * Find by NORAD ID
     *      ↓
     * ┌─────────────────────┐
     * │ Existing satellite? │
     * └──────────┬──────────┘
     *            │
     *       ┌────┴────┐
     *       │         │
     *      YES        NO
     *       │         │
     *       ↓         ↓
     *    Update     Insert
     *       │         │
     *       └────┬────┘
     *            ↓
     *    SGP4 / Orekit propagation
     *            ↓
     *    Position + velocity
     *            ↓
     *    Calculate altitude + velocity
     *            ↓
     *    Save Satellite
     * </pre>
     *
     * <p>
     * CelesTrak is the source of truth for all orbital/TLE
     * fields supplied by the GP response.
     * </p>
     *
     * <p>
     * Application-managed fields such as operator, mission
     * status, country, purpose and description are preserved.
     * Altitude and velocity are derived from orbital propagation.
     *
     * @param group CelesTrak group name
     */
    @Override
    public void synchronizeSatellites(String group) {

        validateGroup(group);

        String normalizedGroup =
                group.trim().toUpperCase();

        List<CelesTrakSatelliteResponse> responses =
                celesTrakService.fetchSatellitesByGroup(
                        normalizedGroup
                );

        if (responses == null || responses.isEmpty()) {
            return;
        }

        for (CelesTrakSatelliteResponse response : responses) {

            if (response == null) {
                continue;
            }

            Integer noradCatalogId =
                    response.getNoradCatalogId();

            /*
             * NORAD catalog ID is the external identity
             * used to synchronize satellite records.
             *
             * Records without a valid NORAD ID cannot be
             * safely synchronized.
             */
            if (noradCatalogId == null
                    || noradCatalogId <= 0) {
                continue;
            }

            satelliteRepository
                    .findByNoradCatalogId(noradCatalogId)
                    .ifPresentOrElse(

                            existingSatellite ->
                                    updateExistingSatellite(
                                            existingSatellite,
                                            response
                                    ),

                            () ->
                                    insertNewSatellite(response)
                    );
        }
    }

    /**
     * Updates an existing satellite.
     *
     * <p>
     * CelesTrak-owned orbital/TLE fields are updated first.
     * The latest propagated altitude and velocity are then
     * calculated using the SGP4/Orekit propagation service.
     * </p>
     */
    private void updateExistingSatellite(
            Satellite existingSatellite,
            CelesTrakSatelliteResponse response) {

        if (existingSatellite == null
                || response == null) {
            return;
        }

        /*
         * --------------------------------------------------
         * Update CelesTrak-owned orbital/TLE fields
         * --------------------------------------------------
         */
        syncMapper.updateSatellite(
                existingSatellite,
                response
        );

        /*
         * --------------------------------------------------
         * Calculate current derived orbital values
         * --------------------------------------------------
         *
         * Altitude and velocity are not provided directly
         * by the CelesTrak GP synchronization response.
         *
         * They are calculated from SGP4 propagation.
         */
        propagateAndSetDerivedValues(
                existingSatellite
        );

        /*
         * The satellite appeared in the latest
         * synchronization result.
         */
        existingSatellite.setActive(true);

        /*
         * Preserve createdAt.
         * Only update modification timestamp.
         */
        existingSatellite.setUpdatedAt(
                LocalDateTime.now()
        );

        satelliteRepository.save(
                existingSatellite
        );
    }

    /**
     * Inserts a new satellite received from CelesTrak.
     */
    private void insertNewSatellite(
            CelesTrakSatelliteResponse response) {

        if (response == null) {
            return;
        }

        /*
         * Mapper creates the Satellite entity and maps
         * all CelesTrak-owned fields.
         */
        Satellite satellite =
                syncMapper.toSatellite(response);

        if (satellite == null) {
            return;
        }

        Integer noradCatalogId =
                satellite.getNoradCatalogId();

        /*
         * A synchronized satellite must always have
         * a valid NORAD catalog ID.
         */
        if (noradCatalogId == null
                || noradCatalogId <= 0) {
            return;
        }

        /*
         * --------------------------------------------------
         * Calculate current derived orbital values
         * --------------------------------------------------
         */
        propagateAndSetDerivedValues(
                satellite
        );

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * New synchronized records are active.
         */
        satellite.setActive(true);

        /*
         * Explicitly initialize timestamps.
         */
        satellite.setCreatedAt(now);
        satellite.setUpdatedAt(now);

        satelliteRepository.save(
                satellite
        );
    }

    /**
     * Propagates the satellite's current orbital state
     * using the latest synchronized TLE/orbital data.
     *
     * <p>
     * The propagation target is the current UTC time.
     * </p>
     *
     * <p>
     * The returned propagated state contains:
     * </p>
     *
     * <ul>
     *     <li>Position X/Y/Z in kilometers</li>
     *     <li>Velocity X/Y/Z in kilometers/second</li>
     * </ul>
     *
     * <p>
     * From these values this method derives:
     * </p>
     *
     * <ul>
     *     <li>Altitude in kilometers</li>
     *     <li>Velocity magnitude in kilometers/second</li>
     * </ul>
     *
     * <p>
     * If propagation fails for an individual satellite,
     * synchronization is not stopped. Existing derived values
     * are preserved.
     * </p>
     */
    private void propagateAndSetDerivedValues(
            Satellite satellite) {

        if (satellite == null) {
            return;
        }

        try {

            /*
             * --------------------------------------------------
             * Build normalized propagation input
             * --------------------------------------------------
             */
            OrbitalPropagationInput input =
                    buildPropagationInput(
                            satellite
                    );

            /*
             * --------------------------------------------------
             * Propagate using SGP4 / Orekit
             * --------------------------------------------------
             */
            PropagatedOrbitalState state =
                    orbitalPropagationService.propagate(
                            input
                    );

            if (state == null) {
                log.warn(
                        "Propagation returned null for NORAD {}",
                        satellite.getNoradCatalogId()
                );
                return;
            }

            /*
             * --------------------------------------------------
             * Calculate velocity magnitude
             * --------------------------------------------------
             *
             * Velocity vector:
             *
             * V = (Vx, Vy, Vz)
             *
             * Magnitude:
             *
             * |V| = sqrt(Vx² + Vy² + Vz²)
             *
             * Unit: km/s
             */
            Double velocity =
                    calculateVelocityMagnitude(
                            state
                    );

            /*
             * --------------------------------------------------
             * Calculate geocentric altitude
             * --------------------------------------------------
             *
             * Position vector:
             *
             * R = (X, Y, Z)
             *
             * Distance from Earth's center:
             *
             * |R| = sqrt(X² + Y² + Z²)
             *
             * Altitude:
             *
             * altitude = |R| - Earth radius
             *
             * Unit: km
             */
            Double altitude =
                    calculateAltitude(
                            state
                    );

            /*
             * Store calculated values in Satellite entity.
             */
            satellite.setVelocity(
                    velocity
            );

            satellite.setAltitude(
                    altitude
            );

            log.debug(
                    "Propagation successful for NORAD {}: altitude={} km, velocity={} km/s",
                    satellite.getNoradCatalogId(),
                    altitude,
                    velocity
            );

        } catch (Exception exception) {

            /*
             * Do not stop the complete synchronization because
             * one satellite has invalid/incomplete propagation
             * data.
             *
             * Existing altitude/velocity values are preserved.
             */
            log.warn(
                    "Could not propagate satellite NORAD {}. "
                            + "Derived altitude/velocity were not updated.",
                    satellite.getNoradCatalogId(),
                    exception
            );
        }
    }

    /**
     * Builds the normalized orbital propagation input
     * from the synchronized Satellite entity.
     */
    private OrbitalPropagationInput buildPropagationInput(
            Satellite satellite) {

        /*
         * Propagation target is current UTC time.
         *
         * The existing OrbitGuard propagation contract
         * treats LocalDateTime values as UTC.
         */
        LocalDateTime targetTime =
                LocalDateTime.now(ZoneOffset.UTC);

        return OrbitalPropagationInput.builder()

                .noradCatalogId(
                        satellite.getNoradCatalogId()
                                != null
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
                        satellite.getRevolutionAtEpoch()
                                != null
                                ? satellite.getRevolutionAtEpoch().longValue()
                                : null
                )

                .targetTime(
                        targetTime
                )

                .build();
    }

    /**
     * Calculates velocity magnitude from the propagated
     * velocity vector.
     *
     * @param state propagated orbital state
     * @return velocity magnitude in km/s
     */
    private Double calculateVelocityMagnitude(
            PropagatedOrbitalState state) {

        if (state == null
                || state.getVelocityX() == null
                || state.getVelocityY() == null
                || state.getVelocityZ() == null) {

            return null;
        }

        double velocityX =
                state.getVelocityX();

        double velocityY =
                state.getVelocityY();

        double velocityZ =
                state.getVelocityZ();

        double velocity =
                Math.sqrt(
                        velocityX * velocityX
                                + velocityY * velocityY
                                + velocityZ * velocityZ
                );

        if (!Double.isFinite(velocity)) {
            return null;
        }

        return velocity;
    }

    /**
     * Calculates geocentric altitude from the propagated
     * Earth-centered position.
     *
     * @param state propagated orbital state
     * @return altitude in kilometers
     */
    private Double calculateAltitude(
            PropagatedOrbitalState state) {

        if (state == null
                || state.getPositionX() == null
                || state.getPositionY() == null
                || state.getPositionZ() == null) {

            return null;
        }

        double positionX =
                state.getPositionX();

        double positionY =
                state.getPositionY();

        double positionZ =
                state.getPositionZ();

        double distanceFromEarthCenter =
                Math.sqrt(
                        positionX * positionX
                                + positionY * positionY
                                + positionZ * positionZ
                );

        double altitude =
                distanceFromEarthCenter
                        - EARTH_RADIUS_KM;

        if (!Double.isFinite(altitude)) {
            return null;
        }

        return altitude;
    }

    /**
     * Validates the CelesTrak group before contacting
     * the external service.
     */
    private void validateGroup(String group) {

        if (group == null || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }
    }
}