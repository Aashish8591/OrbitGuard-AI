package com.orbitguard.debris.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.mapper.CelesTrakDebrisSyncMapper;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.debris.integration.celestrak.service.DebrisSynchronizationService;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Service responsible for synchronizing space debris
 * records from CelesTrak into MongoDB.
 *
 * <p>
 * CelesTrak is the source of truth for synchronized
 * GP/TLE orbital data.
 * </p>
 *
 * <p>
 * CelesTrak may return incomplete orbital information for
 * some objects. Such records must still be stored in
 * MongoDB. Orbital propagation is therefore treated as
 * optional derived-data processing.
 * </p>
 *
 * <p>
 * Altitude and velocity are derived using the common
 * SGP4/Orekit propagation service whenever sufficient
 * orbital data is available.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DebrisSynchronizationServiceImpl
        implements DebrisSynchronizationService {

    private static final String DEBRIS_SEQUENCE =
            "debris_sequence";

    private static final String DEBRIS_CODE_PREFIX =
            "DEB";

    private final CelesTrakDebrisService celesTrakService;

    private final DebrisRepository debrisRepository;

    private final CelesTrakDebrisSyncMapper syncMapper;

    private final SequenceGeneratorService sequenceGeneratorService;

    private final BusinessCodeGenerator businessCodeGenerator;

    private final OrbitalPropagationService orbitalPropagationService;


    /**
     * Synchronizes debris records from a CelesTrak group.
     *
     * <p>
     * Every valid CelesTrak record is processed independently.
     * Therefore, an incomplete or invalid record will not stop
     * the synchronization of the remaining records.
     * </p>
     *
     * <p>
     * CelesTrak synchronization and orbital propagation are
     * intentionally separated:
     *
     * <pre>
     * CelesTrak
     *      ↓
     * CelesTrakDebrisResponse
     *      ↓
     * Validate NORAD ID
     *      ↓
     * Find existing debris
     *      ↓
     * ┌─────────────────────────┐
     * │ Existing?               │
     * └────────────┬────────────┘
     *              │
     *        ┌─────┴─────┐
     *        │           │
     *       YES          NO
     *        │           │
     *     Update       Insert
     *        │           │
     *        └─────┬─────┘
     *              ↓
     *     Save synchronized
     *     CelesTrak data
     *              ↓
     *       Try propagation
     *              ↓
     *    Altitude + velocity
     *        if possible
     *              ↓
     *        Save again
     * </pre>
     * </p>
     *
     * @param group CelesTrak debris group
     */
    @Override
    public void synchronizeDebris(String group) {

        validateGroup(group);

        String normalizedGroup =
                group.trim().toUpperCase();

        List<CelesTrakDebrisResponse> responses =
                celesTrakService.fetchDebrisByGroup(
                        normalizedGroup
                );

        if (responses == null || responses.isEmpty()) {

            log.info(
                    "No debris records returned from CelesTrak for group {}",
                    normalizedGroup
            );

            return;
        }

        log.info(
                "Starting debris synchronization for group {}. Records received: {}",
                normalizedGroup,
                responses.size()
        );

        int processedCount = 0;
        int skippedCount = 0;

        for (CelesTrakDebrisResponse response : responses) {

            if (response == null) {

                skippedCount++;

                continue;
            }

            try {

                Long noradId =
                        response.getNoradCatalogId();

                /*
                 * NORAD catalog ID is required because it is
                 * the external identity used to find/update
                 * debris records.
                 */
                if (noradId == null || noradId <= 0) {

                    log.warn(
                            "Skipping CelesTrak debris record because NORAD ID is missing or invalid."
                    );

                    skippedCount++;

                    continue;
                }

                /*
                 * Each record is processed independently.
                 *
                 * This is important because one incomplete
                 * CelesTrak object must not terminate the
                 * complete synchronization.
                 */
                debrisRepository
                        .findByNoradId(noradId)
                        .ifPresentOrElse(

                                existingDebris ->
                                        updateExistingDebris(
                                                existingDebris,
                                                response
                                        ),

                                () ->
                                        insertNewDebris(
                                                response
                                        )
                        );

                processedCount++;

            } catch (Exception exception) {

                /*
                 * Do not terminate the complete synchronization
                 * because one CelesTrak record failed.
                 */
                log.error(
                        "Failed to synchronize debris record from CelesTrak. NORAD ID: {}",
                        response.getNoradCatalogId(),
                        exception
                );

                skippedCount++;
            }
        }

        log.info(
                "Debris synchronization completed for group {}. "
                        + "Processed: {}, Skipped: {}",
                normalizedGroup,
                processedCount,
                skippedCount
        );
    }


    /**
     * Updates an existing debris record.
     *
     * <p>
     * The latest CelesTrak fields are synchronized first.
     * The record is then saved regardless of whether orbital
     * propagation is possible.
     * </p>
     */
    private void updateExistingDebris(
            SpaceDebris existingDebris,
            CelesTrakDebrisResponse response) {

        if (existingDebris == null || response == null) {
            return;
        }

        /*
         * --------------------------------------------------
         * Synchronize CelesTrak-owned fields
         * --------------------------------------------------
         *
         * This must happen before propagation.
         *
         * Even if some orbital fields are null/incomplete,
         * the available CelesTrak information is still
         * synchronized into the entity.
         */
        syncMapper.updateEntity(
                existingDebris,
                response
        );

        /*
         * --------------------------------------------------
         * Mark the object as active in the latest sync
         * --------------------------------------------------
         */
        existingDebris.setIsActive(true);

        /*
         * --------------------------------------------------
         * Try to calculate derived orbital values.
         * --------------------------------------------------
         *
         * Propagation failure must NOT prevent the
         * synchronized CelesTrak data from being stored.
         */
        propagateAndSetDerivedValues(
                existingDebris
        );

        existingDebris.setUpdatedAt(
                LocalDateTime.now()
        );

        /*
         * --------------------------------------------------
         * Always save the synchronized record.
         * --------------------------------------------------
         */
        debrisRepository.save(
                existingDebris
        );
    }


    /**
     * Inserts a new debris record received from CelesTrak.
     *
     * <p>
     * A record is inserted even if some optional CelesTrak
     * fields are incomplete.
     * </p>
     */
    private void insertNewDebris(
            CelesTrakDebrisResponse response) {

        if (response == null) {
            return;
        }

        /*
         * --------------------------------------------------
         * Convert CelesTrak response into SpaceDebris entity
         * --------------------------------------------------
         */
        SpaceDebris debris =
                syncMapper.toEntity(response);

        if (debris == null) {

            log.warn(
                    "CelesTrak mapper returned null for NORAD ID {}",
                    response.getNoradCatalogId()
            );

            return;
        }

        Long noradId =
                debris.getNoradId();

        if (noradId == null || noradId <= 0) {

            log.warn(
                    "Mapped debris has invalid NORAD ID. "
                            + "CelesTrak NORAD ID: {}",
                    response.getNoradCatalogId()
            );

            return;
        }

        /*
         * --------------------------------------------------
         * Generate OrbitGuard business code
         * --------------------------------------------------
         */
        long sequence =
                sequenceGeneratorService.getNextSequence(
                        DEBRIS_SEQUENCE
                );

        String debrisCode =
                businessCodeGenerator.generate(
                        DEBRIS_CODE_PREFIX,
                        sequence
                );

        debris.setDebrisCode(
                debrisCode
        );

        /*
         * --------------------------------------------------
         * New synchronized object
         * --------------------------------------------------
         */
        debris.setIsActive(true);

        debris.setStatus(
                DebrisStatus.ACTIVE
        );

        LocalDateTime now =
                LocalDateTime.now();

        debris.setCreatedAt(now);
        debris.setUpdatedAt(now);

        /*
         * --------------------------------------------------
         * Try orbital propagation.
         * --------------------------------------------------
         *
         * Propagation is optional. The debris record must
         * still be saved when propagation cannot be performed.
         */
        propagateAndSetDerivedValues(
                debris
        );

        /*
         * --------------------------------------------------
         * ALWAYS save the synchronized CelesTrak record.
         * --------------------------------------------------
         */
        debrisRepository.save(
                debris
        );
    }


    /**
     * Attempts to calculate derived orbital values using
     * the common SGP4/Orekit propagation service.
     *
     * <p>
     * Propagation is intentionally optional because CelesTrak
     * may provide incomplete orbital data.
     * </p>
     *
     * <p>
     * If the required orbital data is unavailable, this method
     * simply returns without modifying existing altitude or
     * velocity values.
     * </p>
     */
    private void propagateAndSetDerivedValues(
            SpaceDebris debris) {

        if (debris == null) {
            return;
        }

        /*
         * --------------------------------------------------
         * Check whether enough orbital information exists
         * --------------------------------------------------
         */
        if (!hasRequiredPropagationData(debris)) {

            log.debug(
                    "Skipping propagation for debris NORAD {} "
                            + "because required orbital data is incomplete.",
                    debris.getNoradId()
            );

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
                            debris
                    );

            /*
             * --------------------------------------------------
             * Propagate using common SGP4/Orekit service
             * --------------------------------------------------
             */
            PropagatedOrbitalState state =
                    orbitalPropagationService.propagate(
                            input
                    );

            if (state == null) {

                log.warn(
                        "Propagation returned null for debris NORAD {}. "
                                + "CelesTrak data will still be saved.",
                        debris.getNoradId()
                );

                return;
            }

            /*
             * --------------------------------------------------
             * Calculate velocity magnitude
             * --------------------------------------------------
             */
            Double velocity =
                    calculateVelocityMagnitude(
                            state
                    );

            /*
             * --------------------------------------------------
             * Calculate altitude
             * --------------------------------------------------
             */
            Double altitude =
                    calculateAltitude(
                            state
                    );

            /*
             * Only replace existing derived values when a
             * valid calculated value is actually available.
             */
            if (velocity != null) {

                debris.setVelocity(
                        velocity
                );
            }

            if (altitude != null) {

                debris.setAltitude(
                        altitude
                );
            }

            log.debug(
                    "Debris propagation completed for NORAD {}: "
                            + "altitude={} km, velocity={} km/s",
                    debris.getNoradId(),
                    altitude,
                    velocity
            );

        } catch (Exception exception) {

            /*
             * IMPORTANT:
             *
             * Do not throw this exception.
             *
             * The CelesTrak record is still valid even when
             * derived orbital calculations cannot be performed.
             */
            log.warn(
                    "Could not propagate debris NORAD {}. "
                            + "CelesTrak synchronized data will still be saved.",
                    debris.getNoradId(),
                    exception
            );
        }
    }


    /**
     * Determines whether the debris contains enough orbital
     * information to attempt SGP4/Orekit propagation.
     *
     * <p>
     * This prevents incomplete CelesTrak records from being
     * unnecessarily passed into the propagation layer.
     * </p>
     */
    private boolean hasRequiredPropagationData(
            SpaceDebris debris) {

        if (debris == null) {
            return false;
        }

        /*
         * These values are fundamental for constructing the
         * orbital propagation input.
         */
        return debris.getNoradId() != null
                && debris.getEpoch() != null
                && debris.getMeanMotion() != null
                && debris.getEccentricity() != null
                && debris.getInclination() != null
                && debris.getRightAscensionOfAscendingNode() != null
                && debris.getArgumentOfPericenter() != null
                && debris.getMeanAnomaly() != null;
    }


    /**
     * Builds normalized propagation input from the
     * synchronized SpaceDebris entity.
     */
    private OrbitalPropagationInput buildPropagationInput(
            SpaceDebris debris) {

        /*
         * Propagation target is the current UTC time.
         */
        LocalDateTime targetTime =
                LocalDateTime.now(
                        ZoneOffset.UTC
                );

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

        /*
         * Mean Earth radius in kilometers.
         */
        final double earthRadiusKm =
                6371.0088;

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
                        - earthRadiusKm;

        if (!Double.isFinite(altitude)) {
            return null;
        }

        return altitude;
    }


    /**
     * Validates the CelesTrak group before contacting
     * the external service.
     */
    private void validateGroup(
            String group) {

        if (group == null || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }
    }
}