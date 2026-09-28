package com.orbitguard.debris.integration.celestrak.mapper;

import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

/**
 * Maps CelesTrak debris GP data into the
 * OrbitGuard SpaceDebris persistence model.
 *
 * <p>
 * Responsibilities:
 *
 * CelesTrak response
 *        ↓
 * SpaceDebris MongoDB entity
 *
 * This mapper:
 * - maps CelesTrak identity fields
 * - maps CelesTrak orbital/TLE fields
 * - converts CelesTrak epoch into UTC LocalDateTime
 * - supports creation of new debris entities
 * - supports updating existing debris entities
 *
 * This mapper does NOT:
 * - calculate altitude
 * - calculate velocity
 * - perform SGP4 propagation
 * - perform coordinate conversion
 * - call external APIs
 * - persist entities
 */
@Component
public class CelesTrakDebrisSyncMapper {

    /**
     * Converts a CelesTrak GP response into a new
     * SpaceDebris entity.
     *
     * @param response CelesTrak debris GP response
     * @return mapped SpaceDebris entity, or null when response is null
     */
    public SpaceDebris toEntity(
            CelesTrakDebrisResponse response) {

        if (response == null) {
            return null;
        }

        SpaceDebris debris = new SpaceDebris();

        mapCelesTrakFields(
                debris,
                response
        );

        return debris;
    }

    /**
     * Updates an existing SpaceDebris entity using
     * the latest CelesTrak GP response.
     *
     * <p>
     * Only CelesTrak-owned fields are modified here.
     * Application-managed fields are preserved.
     *
     * @param debris existing SpaceDebris entity
     * @param response latest CelesTrak GP response
     */
    public void updateEntity(
            SpaceDebris debris,
            CelesTrakDebrisResponse response) {

        if (debris == null || response == null) {
            return;
        }

        mapCelesTrakFields(
                debris,
                response
        );
    }

    /**
     * Maps all CelesTrak-owned fields.
     *
     * <p>
     * This method is shared between insert and update
     * operations so both synchronization paths remain
     * consistent.
     * </p>
     */
    private void mapCelesTrakFields(
            SpaceDebris debris,
            CelesTrakDebrisResponse response) {

        /*
         * --------------------------------------------------
         * Identity
         * --------------------------------------------------
         */

        debris.setDebrisName(
                response.getObjectName()
        );

        debris.setNoradId(
                response.getNoradCatalogId()
        );


        /*
         * --------------------------------------------------
         * CelesTrak object identity
         * --------------------------------------------------
         *
         * objectId should be stored in SpaceDebris.
         *
         * This requires:
         *
         * private String objectId;
         *
         * in SpaceDebris.
         */

        debris.setObjectId(
                response.getObjectId()
        );


        /*
         * --------------------------------------------------
         * TLE / GP orbital data
         * --------------------------------------------------
         */

        debris.setEpoch(
                parseEpoch(
                        response.getEpoch()
                )
        );

        debris.setClassificationType(
                response.getClassificationType()
        );

        debris.setEphemerisType(
                response.getEphemerisType()
        );

        debris.setElementSetNumber(
                response.getElementSetNumber()
        );

        debris.setRevolutionAtEpoch(
                response.getRevolutionAtEpoch()
        );


        /*
         * --------------------------------------------------
         * Orbital elements
         * --------------------------------------------------
         */

        debris.setMeanMotion(
                response.getMeanMotion()
        );

        debris.setMeanMotionDot(
                response.getMeanMotionDot()
        );

        debris.setMeanMotionDdot(
                response.getMeanMotionDdot()
        );

        debris.setEccentricity(
                response.getEccentricity()
        );

        debris.setInclination(
                response.getInclination()
        );

        debris.setRightAscensionOfAscendingNode(
                response.getRightAscensionOfAscendingNode()
        );

        debris.setArgumentOfPericenter(
                response.getArgumentOfPericenter()
        );

        debris.setMeanAnomaly(
                response.getMeanAnomaly()
        );

        debris.setBstar(
                response.getBstar()
        );
    }

    /**
     * Converts the CelesTrak epoch into the
     * LocalDateTime UTC representation used
     * by OrbitGuard.
     *
     * <p>
     * Supported formats include:
     *
     * <ul>
     *     <li>2026-09-25T12:30:00</li>
     *     <li>2026-09-25T12:30:00Z</li>
     *     <li>2026-09-25T12:30:00+00:00</li>
     * </ul>
     *
     * @param epoch CelesTrak epoch
     * @return UTC LocalDateTime
     */
    private LocalDateTime parseEpoch(
            String epoch) {

        if (epoch == null || epoch.isBlank()) {
            return null;
        }

        String normalizedEpoch =
                epoch.trim();

        try {

            /*
             * Timestamp containing Z or an offset.
             *
             * Normalize explicitly to UTC before
             * removing the offset.
             */
            return OffsetDateTime.parse(
                            normalizedEpoch
                    )
                    .withOffsetSameInstant(
                            ZoneOffset.UTC
                    )
                    .toLocalDateTime();

        } catch (DateTimeParseException ignored) {

            /*
             * Timestamp without an offset.
             *
             * OrbitGuard treats the CelesTrak epoch
             * as UTC in the current data contract.
             */
            try {

                return LocalDateTime.parse(
                        normalizedEpoch
                );

            } catch (DateTimeParseException exception) {

                throw new IllegalArgumentException(
                        "Invalid CelesTrak epoch format: "
                                + epoch,
                        exception
                );
            }
        }
    }
}