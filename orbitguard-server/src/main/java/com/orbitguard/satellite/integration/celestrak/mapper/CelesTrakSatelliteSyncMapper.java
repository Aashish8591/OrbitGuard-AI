package com.orbitguard.satellite.integration.celestrak.mapper;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.function.Consumer;

/**
 * Maps CelesTrak GP data into the OrbitGuard
 * Satellite persistence model.
 *
 * <p>
 * Mapping flow:
 *
 * <pre>
 * CelesTrak GP Response
 *          ↓
 * CelesTrakSatelliteResponse
 *          ↓
 * CelesTrakSatelliteSyncMapper
 *          ↓
 * Satellite
 *          ↓
 * MongoDB
 * </pre>
 *
 * <p>
 * Responsibilities:
 * <ul>
 *     <li>Map CelesTrak-owned fields</li>
 *     <li>Validate required CelesTrak identity fields</li>
 *     <li>Convert CelesTrak epoch into UTC LocalDateTime</li>
 *     <li>Create new Satellite entities</li>
 *     <li>Update existing Satellite entities</li>
 *     <li>Protect existing values from null CelesTrak fields</li>
 * </ul>
 *
 * <p>
 * This mapper does NOT:
 * <ul>
 *     <li>perform orbital propagation</li>
 *     <li>calculate altitude</li>
 *     <li>calculate velocity</li>
 *     <li>perform coordinate conversion</li>
 *     <li>call external APIs</li>
 *     <li>persist entities</li>
 * </ul>
 */
@Component
public class CelesTrakSatelliteSyncMapper {

    /**
     * Converts a CelesTrak GP response into a new
     * Satellite persistence entity.
     *
     * @param response CelesTrak GP response
     * @return new Satellite entity
     */
    public Satellite toSatellite(
            CelesTrakSatelliteResponse response) {

        validateResponse(response);

        Satellite satellite = new Satellite();

        mapCelesTrakFields(
                satellite,
                response
        );

        return satellite;
    }

    /**
     * Updates an existing Satellite entity using
     * the latest CelesTrak GP response.
     *
     * <p>
     * Only CelesTrak-owned fields are updated.
     * Application-managed fields remain untouched.
     *
     * <p>
     * Null or blank values from CelesTrak do not
     * overwrite existing MongoDB values.
     *
     * @param satellite existing Satellite entity
     * @param response latest CelesTrak response
     */
    public void updateSatellite(
            Satellite satellite,
            CelesTrakSatelliteResponse response) {

        if (satellite == null) {
            throw new IllegalArgumentException(
                    "Satellite must not be null."
            );
        }

        validateResponse(response);

        mapCelesTrakFields(
                satellite,
                response
        );
    }

    /**
     * Maps all CelesTrak-owned fields.
     *
     * <p>
     * This method is shared by both insert and update
     * operations so that both paths remain consistent.
     *
     * <p>
     * Important:
     *
     * <ul>
     *     <li>Valid non-null values are mapped.</li>
     *     <li>Blank String values are ignored.</li>
     *     <li>Null numeric values are ignored.</li>
     *     <li>Existing application-managed fields are never touched.</li>
     * </ul>
     */
    private void mapCelesTrakFields(
            Satellite satellite,
            CelesTrakSatelliteResponse response) {

        /*
         * ==================================================
         * OBJECT IDENTITY
         * ==================================================
         */

        setIfNotBlank(
                response.getObjectName(),
                satellite::setSatelliteName
        );

        /*
         * OBJECT_ID is currently used as the
         * application satelliteCode.
         */
        setIfNotBlank(
                response.getObjectId(),
                satellite::setSatelliteCode
        );

        /*
         * NORAD catalog ID is the primary external
         * synchronization identity.
         */
        if (response.getNoradCatalogId() != null
                && response.getNoradCatalogId() > 0) {

            satellite.setNoradCatalogId(
                    response.getNoradCatalogId()
            );
        }

        /*
         * Preserve OBJECT_ID separately as well.
         */
        setIfNotBlank(
                response.getObjectId(),
                satellite::setObjectId
        );


        /*
         * ==================================================
         * EPOCH
         * ==================================================
         */

        LocalDateTime parsedEpoch =
                parseEpoch(
                        response.getEpoch()
                );

        if (parsedEpoch != null) {

            satellite.setEpoch(
                    parsedEpoch
            );
        }


        /*
         * ==================================================
         * TLE / SGP4 METADATA
         * ==================================================
         */

        setIfNotBlank(
                response.getClassificationType(),
                satellite::setClassificationType
        );

        setIfPresent(
                response.getEphemerisType(),
                satellite::setEphemerisType
        );

        setIfPresent(
                response.getElementSetNumber(),
                satellite::setElementSetNumber
        );

        setIfPresent(
                response.getRevolutionAtEpoch(),
                satellite::setRevolutionAtEpoch
        );


        /*
         * ==================================================
         * ORBITAL PARAMETERS
         * ==================================================
         */

        setIfPresent(
                response.getMeanMotion(),
                satellite::setMeanMotion
        );

        setIfPresent(
                response.getMeanMotionDot(),
                satellite::setMeanMotionDot
        );

        setIfPresent(
                response.getMeanMotionDdot(),
                satellite::setMeanMotionDdot
        );

        setIfPresent(
                response.getEccentricity(),
                satellite::setEccentricity
        );

        setIfPresent(
                response.getInclination(),
                satellite::setInclination
        );

        setIfPresent(
                response.getRightAscensionOfAscendingNode(),
                satellite::setRightAscensionOfAscendingNode
        );

        setIfPresent(
                response.getArgumentOfPericenter(),
                satellite::setArgumentOfPericenter
        );

        setIfPresent(
                response.getMeanAnomaly(),
                satellite::setMeanAnomaly
        );

        setIfPresent(
                response.getBstar(),
                satellite::setBstar
        );
    }


    /**
     * Validates the minimum identity information
     * required for synchronization.
     *
     * <p>
     * NORAD catalog ID is the primary external identity.
     * OBJECT_ID is also required because it is currently
     * used as the Satellite satelliteCode/objectId.
     */
    private void validateResponse(
            CelesTrakSatelliteResponse response) {

        if (response == null) {

            throw new IllegalArgumentException(
                    "CelesTrak satellite response must not be null."
            );
        }

        if (response.getNoradCatalogId() == null
                || response.getNoradCatalogId() <= 0) {

            throw new IllegalArgumentException(
                    "CelesTrak satellite response must contain "
                            + "a valid NORAD catalog ID."
            );
        }

        if (isBlank(response.getObjectId())) {

            throw new IllegalArgumentException(
                    "CelesTrak satellite response must contain "
                            + "a valid OBJECT_ID."
            );
        }
    }


    /**
     * Converts the CelesTrak epoch into the
     * UTC LocalDateTime representation used
     * by OrbitGuard.
     *
     * <p>
     * Supported examples:
     *
     * <ul>
     *     <li>2026-09-25T12:30:00</li>
     *     <li>2026-09-25T12:30:00Z</li>
     *     <li>2026-09-25T12:30:00+00:00</li>
     * </ul>
     */
    private LocalDateTime parseEpoch(
            String epoch) {

        if (isBlank(epoch)) {
            return null;
        }

        String normalizedEpoch =
                epoch.trim();

        /*
         * --------------------------------------------------
         * Try offset-aware timestamp first.
         * --------------------------------------------------
         */
        try {

            return OffsetDateTime.parse(
                            normalizedEpoch
                    )
                    .withOffsetSameInstant(
                            ZoneOffset.UTC
                    )
                    .toLocalDateTime();

        } catch (DateTimeParseException ignored) {

            /*
             * Continue with plain LocalDateTime.
             */
        }

        /*
         * --------------------------------------------------
         * Try timestamp without an offset.
         *
         * OrbitGuard treats CelesTrak timestamps without
         * an explicit offset as UTC.
         * --------------------------------------------------
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


    /**
     * Sets a String value only when it contains
     * meaningful content.
     */
    private void setIfNotBlank(
            String value,
            Consumer<String> setter) {

        if (!isBlank(value)) {

            setter.accept(
                    value.trim()
            );
        }
    }


    /**
     * Sets a value only when it is not null.
     *
     * <p>
     * This is used for numeric CelesTrak fields.
     * Null values from a partial response therefore
     * cannot erase an existing database value.
     */
    private <T> void setIfPresent(
            T value,
            Consumer<T> setter) {

        if (value != null) {

            setter.accept(value);
        }
    }


    /**
     * Checks whether a String is null or blank.
     */
    private boolean isBlank(
            String value) {

        return value == null
                || value.isBlank();
    }
}