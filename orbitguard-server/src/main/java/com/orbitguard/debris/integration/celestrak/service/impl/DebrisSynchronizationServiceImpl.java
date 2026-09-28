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
 * CelesTrak is the source of truth for GP/TLE orbital data.
 * </p>
 *
 * <p>
 * Altitude and velocity are derived by the common
 * SGP4/Orekit propagation service.
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

    /*
     * Common orbital propagation service.
     *
     * This is the missing dependency in the old
     * debris synchronization implementation.
     */
    private final OrbitalPropagationService orbitalPropagationService;


    /**
     * Synchronizes debris records from a CelesTrak group.
     *
     * <pre>
     * CelesTrak
     *      ↓
     * CelesTrakDebrisService
     *      ↓
     * CelesTrakDebrisResponse
     *      ↓
     * Validate NORAD ID
     *      ↓
     * Find by NORAD ID
     *      ↓
     * ┌──────────────────────┐
     * │ Existing debris?     │
     * └──────────┬───────────┘
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
     *    Build propagation input
     *            ↓
     *       SGP4 / Orekit
     *            ↓
     *   Position + velocity
     *            ↓
     *   Calculate altitude + velocity
     *            ↓
     *        Save debris
     * </pre>
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
            return;
        }

        for (CelesTrakDebrisResponse response : responses) {

            if (response == null) {
                continue;
            }

            Long noradId =
                    response.getNoradCatalogId();

            /*
             * NORAD catalog ID is the external identity.
             */
            if (noradId == null || noradId <= 0) {
                continue;
            }

            debrisRepository
                    .findByNoradId(noradId)
                    .ifPresentOrElse(

                            existingDebris ->
                                    updateExistingDebris(
                                            existingDebris,
                                            response
                                    ),

                            () ->
                                    insertNewDebris(response)
                    );
        }
    }


    /**
     * Updates an existing debris record.
     *
     * <p>
     * First synchronize the latest CelesTrak GP/TLE data.
     * Then propagate that latest orbital state and update
     * altitude and velocity.
     * </p>
     */
    private void updateExistingDebris(
            SpaceDebris existingDebris,
            CelesTrakDebrisResponse response) {

        if (existingDebris == null
                || response == null) {
            return;
        }

        /*
         * --------------------------------------------------
         * Update CelesTrak-owned orbital fields
         * --------------------------------------------------
         */
        syncMapper.updateEntity(
                existingDebris,
                response
        );

        /*
         * --------------------------------------------------
         * Calculate current derived orbital state
         * --------------------------------------------------
         *
         * This is the important part that was missing
         * from the previous debris synchronization flow.
         */
        propagateAndSetDerivedValues(
                existingDebris
        );

        /*
         * Object appeared in latest synchronization.
         */
        existingDebris.setIsActive(true);

        existingDebris.setUpdatedAt(
                LocalDateTime.now()
        );

        debrisRepository.save(
                existingDebris
        );
    }


    /**
     * Inserts a new debris record received from CelesTrak.
     */
    private void insertNewDebris(
            CelesTrakDebrisResponse response) {

        if (response == null) {
            return;
        }

        /*
         * Create entity from synchronized CelesTrak data.
         */
        SpaceDebris debris =
                syncMapper.toEntity(response);

        if (debris == null) {
            return;
        }

        Long noradId =
                debris.getNoradId();

        if (noradId == null || noradId <= 0) {
            return;
        }

        /*
         * --------------------------------------------------
         * Generate OrbitGuard debris business code
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
         * Calculate derived orbital values
         * --------------------------------------------------
         */
        propagateAndSetDerivedValues(
                debris
        );

        /*
         * New synchronized debris is active.
         */
        debris.setIsActive(true);

        debris.setStatus(
                DebrisStatus.ACTIVE
        );

        LocalDateTime now =
                LocalDateTime.now();

        debris.setCreatedAt(now);
        debris.setUpdatedAt(now);

        debrisRepository.save(
                debris
        );
    }


    /**
     * Propagates the debris orbital state using the
     * common SGP4/Orekit propagation service.
     *
     * <p>
     * The propagation target is the current UTC time.
     * </p>
     *
     * <p>
     * The propagated position is used to calculate
     * altitude and the propagated velocity vector is
     * used to calculate velocity magnitude.
     * </p>
     */
    private void propagateAndSetDerivedValues(
            SpaceDebris debris) {

        if (debris == null) {
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
                        "Propagation returned null for debris NORAD {}",
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
             * --------------------------------------------------
             * Store derived values
             * --------------------------------------------------
             */
            debris.setVelocity(
                    velocity
            );

            debris.setAltitude(
                    altitude
            );

            log.debug(
                    "Debris propagation successful for NORAD {}: altitude={} km, velocity={} km/s",
                    debris.getNoradId(),
                    altitude,
                    velocity
            );

        } catch (Exception exception) {

            /*
             * Do not stop the entire synchronization
             * because one debris object failed propagation.
             *
             * Existing values are preserved.
             */
            log.warn(
                    "Could not propagate debris NORAD {}. "
                            + "Derived altitude/velocity were not updated.",
                    debris.getNoradId(),
                    exception
            );
        }
    }


    /**
     * Builds normalized propagation input from the
     * synchronized SpaceDebris entity.
     */
    private OrbitalPropagationInput buildPropagationInput(
            SpaceDebris debris) {

        /*
         * Propagation target is current UTC time.
         */
        LocalDateTime targetTime =
                LocalDateTime.now(ZoneOffset.UTC);

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
     * <p>
     * The common propagation service already calculates
     * altitude, but we calculate it here from the returned
     * position to keep the synchronization layer explicit
     * and consistent with the satellite synchronization flow.
     * </p>
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
         * Use the same Earth radius convention as the
         * satellite synchronization service.
         *
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