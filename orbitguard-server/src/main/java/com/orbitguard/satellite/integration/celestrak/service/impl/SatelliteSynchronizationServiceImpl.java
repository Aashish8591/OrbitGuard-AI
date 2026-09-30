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
     * Mean Earth radius in kilometers.
     *
     * Used for deriving approximate geocentric altitude
     * from the propagated Earth-centered position vector.
     */
    private static final double EARTH_RADIUS_KM = 6371.0088;

    private final CelesTrakService celesTrakService;

    private final SatelliteRepository satelliteRepository;

    private final CelesTrakSatelliteSyncMapper syncMapper;

    private final OrbitalPropagationService orbitalPropagationService;

    /**
     * Synchronizes satellite GP data from CelesTrak.
     *
     * Synchronization identity:
     *
     * NORAD catalog ID
     *
     * Flow:
     *
     * CelesTrak
     *      ↓
     * CelesTrakSatelliteResponse
     *      ↓
     * Validate NORAD ID
     *      ↓
     * Find existing satellite
     *      ↓
     * ┌─────────────────────────┐
     * │ Existing satellite?     │
     * └────────────┬────────────┘
     *              │
     *        ┌─────┴─────┐
     *        │           │
     *       YES          NO
     *        │           │
     *        ↓           ↓
     *     Update       Insert
     *        │           │
     *        └─────┬─────┘
     *              ↓
     *      SGP4 / Orekit propagation
     *              ↓
     *      Calculate altitude
     *      Calculate velocity
     *              ↓
     *           Save
     *
     * CelesTrak-owned fields are updated through the mapper.
     *
     * Application-managed fields such as:
     *
     * - operator
     * - orbitType
     * - launchDate
     * - missionStatus
     * - country
     * - purpose
     * - description
     *
     * are preserved.
     *
     * @param group CelesTrak group
     */
    @Override
    public void synchronizeSatellites(String group) {

        validateGroup(group);

        String normalizedGroup =
                group.trim().toUpperCase();

        log.info(
                "Starting satellite synchronization for CelesTrak group: {}",
                normalizedGroup
        );

        List<CelesTrakSatelliteResponse> responses =
                celesTrakService.fetchSatellitesByGroup(
                        normalizedGroup
                );

        if (responses == null || responses.isEmpty()) {

            log.warn(
                    "No satellite data returned from CelesTrak for group: {}",
                    normalizedGroup
            );

            return;
        }

        int processed = 0;
        int inserted = 0;
        int updated = 0;
        int skipped = 0;

        for (CelesTrakSatelliteResponse response : responses) {

            if (response == null) {

                skipped++;

                log.warn(
                        "Skipping null CelesTrak satellite response."
                );

                continue;
            }

            Integer noradCatalogId =
                    response.getNoradCatalogId();

            /*
             * NORAD ID is the synchronization identity.
             */
            if (noradCatalogId == null
                    || noradCatalogId <= 0) {

                skipped++;

                log.warn(
                        "Skipping CelesTrak satellite because "
                                + "NORAD catalog ID is missing or invalid."
                );

                continue;
            }

            try {

                Satellite existingSatellite =
                        satelliteRepository
                                .findByNoradCatalogId(
                                        noradCatalogId
                                )
                                .orElse(null);

                if (existingSatellite != null) {

                    updateExistingSatellite(
                            existingSatellite,
                            response
                    );

                    updated++;

                } else {

                    Satellite satellite =
                            insertNewSatellite(
                                    response
                            );

                    if (satellite != null) {
                        inserted++;
                    } else {
                        skipped++;
                    }
                }

                processed++;

            } catch (Exception exception) {

                /*
                 * One bad satellite must not stop the complete
                 * synchronization operation.
                 */
                skipped++;

                log.error(
                        "Failed to synchronize satellite NORAD {}.",
                        noradCatalogId,
                        exception
                );
            }
        }

        log.info(
                "Satellite synchronization completed for group {}. "
                        + "Processed={}, Inserted={}, Updated={}, Skipped={}",
                normalizedGroup,
                processed,
                inserted,
                updated,
                skipped
        );
    }

    /**
     * Updates an existing satellite.
     *
     * CelesTrak fields are updated through the mapper.
     *
     * Existing application-managed metadata is preserved.
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
         * 1. Update CelesTrak-owned fields
         * --------------------------------------------------
         *
         * The mapper intentionally does not overwrite
         * existing values with null values.
         */
        syncMapper.updateSatellite(
                existingSatellite,
                response
        );

        /*
         * --------------------------------------------------
         * 2. Propagate current orbital state
         * --------------------------------------------------
         *
         * Only valid calculated values will replace
         * existing altitude and velocity.
         */
        propagateAndSetDerivedValues(
                existingSatellite
        );

        /*
         * --------------------------------------------------
         * 3. Synchronization metadata
         * --------------------------------------------------
         */
        existingSatellite.setActive(true);

        existingSatellite.setUpdatedAt(
                LocalDateTime.now(ZoneOffset.UTC)
        );

        /*
         * --------------------------------------------------
         * 4. Preserve application-managed fields
         * --------------------------------------------------
         *
         * We intentionally do NOT modify:
         *
         * operator
         * orbitType
         * launchDate
         * missionStatus
         * country
         * purpose
         * description
         * createdAt
         */

        satelliteRepository.save(
                existingSatellite
        );

        log.debug(
                "Updated satellite NORAD {}.",
                existingSatellite.getNoradCatalogId()
        );
    }

    /**
     * Inserts a new satellite.
     *
     * @return saved Satellite or null when insertion is skipped
     */
    private Satellite insertNewSatellite(
            CelesTrakSatelliteResponse response) {

        if (response == null) {
            return null;
        }

        /*
         * --------------------------------------------------
         * 1. Map CelesTrak data
         * --------------------------------------------------
         */
        Satellite satellite =
                syncMapper.toSatellite(
                        response
                );

        if (satellite == null) {
            return null;
        }

        Integer noradCatalogId =
                satellite.getNoradCatalogId();

        /*
         * --------------------------------------------------
         * 2. Validate synchronization identity
         * --------------------------------------------------
         */
        if (noradCatalogId == null
                || noradCatalogId <= 0) {

            log.warn(
                    "Skipping new satellite because NORAD ID is invalid."
            );

            return null;
        }

        /*
         * --------------------------------------------------
         * 3. Propagate current orbital state
         * --------------------------------------------------
         */
        propagateAndSetDerivedValues(
                satellite
        );

        /*
         * --------------------------------------------------
         * 4. Initialize synchronization metadata
         * --------------------------------------------------
         */
        LocalDateTime now =
                LocalDateTime.now(ZoneOffset.UTC);

        satellite.setActive(true);

        satellite.setCreatedAt(now);

        satellite.setUpdatedAt(now);

        /*
         * --------------------------------------------------
         * 5. Save
         * --------------------------------------------------
         */
        Satellite savedSatellite =
                satelliteRepository.save(
                        satellite
                );

        log.debug(
                "Inserted new satellite NORAD {}.",
                noradCatalogId
        );

        return savedSatellite;
    }

    /**
     * Propagates the satellite's current orbital state
     * using SGP4/Orekit.
     *
     * Important:
     *
     * Existing altitude and velocity are preserved when
     * propagation cannot produce valid values.
     */
    private void propagateAndSetDerivedValues(
            Satellite satellite) {

        if (satellite == null) {
            return;
        }

        Integer noradCatalogId =
                satellite.getNoradCatalogId();

        try {

            /*
             * --------------------------------------------------
             * Validate propagation input
             * --------------------------------------------------
             */
            if (!hasRequiredPropagationData(satellite)) {

                log.warn(
                        "Skipping propagation for NORAD {} because "
                                + "required orbital data is incomplete.",
                        noradCatalogId
                );

                return;
            }

            /*
             * --------------------------------------------------
             * Build propagation input
             * --------------------------------------------------
             */
            OrbitalPropagationInput input =
                    buildPropagationInput(
                            satellite
                    );

            if (input == null) {

                log.warn(
                        "Could not build propagation input for NORAD {}.",
                        noradCatalogId
                );

                return;
            }

            /*
             * --------------------------------------------------
             * Propagate
             * --------------------------------------------------
             */
            PropagatedOrbitalState state =
                    orbitalPropagationService.propagate(
                            input
                    );

            if (state == null) {

                log.warn(
                        "Propagation returned null for NORAD {}. "
                                + "Existing altitude and velocity preserved.",
                        noradCatalogId
                );

                return;
            }

            /*
             * --------------------------------------------------
             * Calculate derived values
             * --------------------------------------------------
             */
            Double velocity =
                    calculateVelocityMagnitude(
                            state
                    );

            Double altitude =
                    calculateAltitude(
                            state
                    );

            /*
             * --------------------------------------------------
             * IMPORTANT:
             *
             * Do not blindly write null.
             *
             * If only altitude is valid, update altitude.
             * If only velocity is valid, update velocity.
             * Existing values are preserved otherwise.
             * --------------------------------------------------
             */
            if (velocity != null) {

                satellite.setVelocity(
                        velocity
                );
            }

            if (altitude != null) {

                satellite.setAltitude(
                        altitude
                );
            }

            log.debug(
                    "Propagation completed for NORAD {}: "
                            + "altitude={} km, velocity={} km/s",
                    noradCatalogId,
                    altitude,
                    velocity
            );

        } catch (Exception exception) {

            /*
             * Propagation failure must not destroy an otherwise
             * valid synchronized satellite record.
             */
            log.warn(
                    "Propagation failed for NORAD {}. "
                            + "Existing altitude/velocity preserved.",
                    noradCatalogId,
                    exception
            );
        }
    }

    /**
     * Checks whether the minimum orbital information
     * required by the current propagation contract exists.
     *
     * The propagation implementation may require more fields;
     * this check prevents obviously incomplete records from
     * being sent unnecessarily.
     */
    private boolean hasRequiredPropagationData(
            Satellite satellite) {

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
     * Builds the propagation input from the Satellite entity.
     */
    private OrbitalPropagationInput buildPropagationInput(
            Satellite satellite) {

        if (satellite == null) {
            return null;
        }

        /*
         * The OrbitGuard propagation contract currently
         * treats LocalDateTime as UTC.
         */
        LocalDateTime targetTime =
                LocalDateTime.now(ZoneOffset.UTC);

        return OrbitalPropagationInput.builder()

                .noradCatalogId(
                        satellite.getNoradCatalogId()
                                != null
                                ? satellite.getNoradCatalogId()
                                .longValue()
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
                                ? satellite.getRevolutionAtEpoch()
                                .longValue()
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
     * Unit: km/s
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

        if (!Double.isFinite(velocity)
                || velocity <= 0.0) {

            return null;
        }

        return velocity;
    }

    /**
     * Calculates geocentric altitude from the propagated
     * Earth-centered position.
     *
     * Unit: km.
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

        if (!Double.isFinite(distanceFromEarthCenter)
                || distanceFromEarthCenter <= 0.0) {

            return null;
        }

        double altitude =
                distanceFromEarthCenter
                        - EARTH_RADIUS_KM;

        if (!Double.isFinite(altitude)) {
            return null;
        }

        return altitude;
    }

    /**
     * Validates the CelesTrak group.
     */
    private void validateGroup(
            String group) {

        if (group == null
                || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }
    }
}