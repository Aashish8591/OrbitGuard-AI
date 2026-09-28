package com.orbitguard.satellite.integration.celestrak.mapper;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

/**
 * Maps CelesTrak satellite GP data into the
 * OrbitGuard Satellite persistence model.
 *
 * Responsibilities:
 *
 * CelesTrak response
 *        ↓
 * Satellite MongoDB entity
 *
 * This mapper:
 * - maps CelesTrak-owned fields
 * - converts CelesTrak epoch into UTC LocalDateTime
 * - supports creation of new Satellite entities
 * - supports updating existing Satellite entities
 *
 * This mapper does not:
 * - perform propagation
 * - calculate altitude
 * - calculate velocity
 * - perform coordinate conversion
 * - call external APIs
 * - persist entities
 */
@Component
public class CelesTrakSatelliteSyncMapper {

    /**
     * Converts a CelesTrak GP response into a new
     * Satellite persistence entity.
     *
     * <p>
     * All CelesTrak-provided identity and orbital/TLE
     * fields are persisted.
     * </p>
     *
     * <p>
     * Application-managed fields are intentionally left
     * to Satellite defaults or application logic.
     * </p>
     *
     * @param response CelesTrak GP response
     * @return new Satellite entity, or null when response is null
     */
    public Satellite toSatellite(
            CelesTrakSatelliteResponse response) {

        if (response == null) {
            return null;
        }

        Satellite satellite = new Satellite();

        mapCelesTrakFields(
                satellite,
                response
        );

        return satellite;
    }

    /**
     * Updates an existing Satellite entity using the
     * latest CelesTrak GP response.
     *
     * <p>
     * Only fields owned by the CelesTrak synchronization
     * flow are modified.
     * </p>
     *
     * <p>
     * The following application-managed fields are NOT
     * changed here:
     * </p>
     *
     * <ul>
     *     <li>id</li>
     *     <li>operator</li>
     *     <li>orbitType</li>
     *     <li>altitude</li>
     *     <li>velocity</li>
     *     <li>launchDate</li>
     *     <li>missionStatus</li>
     *     <li>active</li>
     *     <li>country</li>
     *     <li>purpose</li>
     *     <li>description</li>
     *     <li>createdAt</li>
     *     <li>updatedAt</li>
     * </ul>
     *
     * <p>
     * The synchronization service is responsible for
     * active/updatedAt handling.
     * </p>
     *
     * @param satellite existing Satellite entity
     * @param response latest CelesTrak GP response
     */
    public void updateSatellite(
            Satellite satellite,
            CelesTrakSatelliteResponse response) {

        if (satellite == null || response == null) {
            return;
        }

        mapCelesTrakFields(
                satellite,
                response
        );
    }

    /**
     * Maps all fields that are owned by the
     * CelesTrak synchronization flow.
     *
     * <p>
     * This method is deliberately shared by both:
     * </p>
     *
     * <pre>
     * New satellite
     *      ↓
     * toSatellite()
     *      ↓
     * mapCelesTrakFields()
     *
     * Existing satellite
     *      ↓
     * updateSatellite()
     *      ↓
     * mapCelesTrakFields()
     * </pre>
     *
     * <p>
     * This prevents the insert and update paths from
     * becoming inconsistent.
     * </p>
     */
    private void mapCelesTrakFields(
            Satellite satellite,
            CelesTrakSatelliteResponse response) {

        /*
         * --------------------------------------------------
         * Identity / provider information
         * --------------------------------------------------
         */

        satellite.setSatelliteName(
                response.getObjectName()
        );

        satellite.setSatelliteCode(
                response.getObjectId()
        );

        satellite.setNoradCatalogId(
                response.getNoradCatalogId()
        );

        satellite.setObjectId(
                response.getObjectId()
        );

        /*
         * --------------------------------------------------
         * TLE / orbital data
         * --------------------------------------------------
         */

        satellite.setEpoch(
                parseEpoch(response.getEpoch())
        );

        satellite.setClassificationType(
                response.getClassificationType()
        );

        satellite.setEphemerisType(
                response.getEphemerisType()
        );

        satellite.setElementSetNumber(
                response.getElementSetNumber()
        );

        satellite.setRevolutionAtEpoch(
                response.getRevolutionAtEpoch()
        );

        satellite.setMeanMotion(
                response.getMeanMotion()
        );

        satellite.setMeanMotionDot(
                response.getMeanMotionDot()
        );

        satellite.setMeanMotionDdot(
                response.getMeanMotionDdot()
        );

        satellite.setEccentricity(
                response.getEccentricity()
        );

        satellite.setInclination(
                response.getInclination()
        );

        satellite.setRightAscensionOfAscendingNode(
                response.getRightAscensionOfAscendingNode()
        );

        satellite.setArgumentOfPericenter(
                response.getArgumentOfPericenter()
        );

        satellite.setMeanAnomaly(
                response.getMeanAnomaly()
        );

        satellite.setBstar(
                response.getBstar()
        );
    }

    /**
     * Converts the CelesTrak epoch into the
     * LocalDateTime UTC representation used
     * throughout the current OrbitGuard
     * propagation flow.
     *
     * <p>
     * Supported formats:
     * </p>
     *
     * <ul>
     *     <li>2026-09-25T12:30:00</li>
     *     <li>2026-09-25T12:30:00Z</li>
     *     <li>2026-09-25T12:30:00+00:00</li>
     * </ul>
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
             * Offset/Z timestamp:
             *
             * Convert it explicitly to UTC before
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
             * Plain LocalDateTime without offset.
             *
             * CelesTrak epoch is treated as UTC by
             * OrbitGuard's current data contract.
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