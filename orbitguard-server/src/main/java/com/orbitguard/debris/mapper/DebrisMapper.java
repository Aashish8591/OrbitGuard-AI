package com.orbitguard.debris.mapper;

import com.orbitguard.debris.dto.request.CreateDebrisRequest;
import com.orbitguard.debris.dto.request.UpdateDebrisRequest;
import com.orbitguard.debris.dto.response.DebrisResponse;
import com.orbitguard.debris.entity.SpaceDebris;

import org.springframework.stereotype.Component;

/**
 * Mapper responsible for converting between
 * Debris DTOs and the SpaceDebris entity.
 *
 * <p>
 * This mapper performs explicit field mapping.
 * It does not perform synchronization, propagation,
 * calculations, external API calls, or persistence.
 * </p>
 *
 * <p>
 * Ownership:
 *
 * <ul>
 *     <li>CelesTrak orbital fields → synchronization layer</li>
 *     <li>Altitude / velocity → propagation layer</li>
 *     <li>Application metadata → normal CRUD layer</li>
 *     <li>Entity → API response → this mapper</li>
 * </ul>
 * </p>
 */
@Component
public class DebrisMapper {

    /**
     * Converts CreateDebrisRequest into a SpaceDebris entity.
     *
     * <p>
     * This method handles application-created debris metadata.
     * CelesTrak orbital fields are not accepted from the normal
     * create request.
     * </p>
     */
    public SpaceDebris toEntity(
            CreateDebrisRequest request) {

        if (request == null) {
            return null;
        }

        return SpaceDebris.builder()

                /*
                 * ------------------------------------------
                 * Application-managed information
                 * ------------------------------------------
                 */

                .debrisName(
                        request.getDebrisName()
                )

                .noradId(
                        request.getNoradId()
                )

                .objectType(
                        request.getObjectType()
                )

                .orbitType(
                        request.getOrbitType()
                )

                .country(
                        request.getCountry()
                )

                .size(
                        request.getSize()
                )

                .mass(
                        request.getMass()
                )

                .launchDate(
                        request.getLaunchDate()
                )

                .description(
                        request.getDescription()
                )

                .build();
    }


    /**
     * Converts SpaceDebris entity into DebrisResponse DTO.
     *
     * <p>
     * This method exposes the complete synchronized
     * CelesTrak data together with application-managed
     * and propagation-derived information.
     * </p>
     *
     * <pre>
     * MongoDB
     *     ↓
     * SpaceDebris
     *     ↓
     * DebrisMapper
     *     ↓
     * DebrisResponse
     *     ↓
     * REST / Swagger
     * </pre>
     */
    public DebrisResponse toResponse(
            SpaceDebris debris) {

        if (debris == null) {
            return null;
        }

        return DebrisResponse.builder()

                /*
                 * ------------------------------------------
                 * Identity
                 * ------------------------------------------
                 */

                .id(
                        debris.getId()
                )

                .debrisCode(
                        debris.getDebrisCode()
                )

                .debrisName(
                        debris.getDebrisName()
                )

                .noradId(
                        debris.getNoradId()
                )

                .objectId(
                        debris.getObjectId()
                )


                /*
                 * ------------------------------------------
                 * CelesTrak / GP orbital data
                 * ------------------------------------------
                 */

                .epoch(
                        debris.getEpoch()
                )

                .classificationType(
                        debris.getClassificationType()
                )

                .ephemerisType(
                        debris.getEphemerisType()
                )

                .elementSetNumber(
                        debris.getElementSetNumber()
                )

                .revolutionAtEpoch(
                        debris.getRevolutionAtEpoch()
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


                /*
                 * ------------------------------------------
                 * Application-managed information
                 * ------------------------------------------
                 */

                .objectType(
                        debris.getObjectType()
                )

                .orbitType(
                        debris.getOrbitType()
                )

                .country(
                        debris.getCountry()
                )

                .size(
                        debris.getSize()
                )

                .mass(
                        debris.getMass()
                )

                .launchDate(
                        debris.getLaunchDate()
                )

                .description(
                        debris.getDescription()
                )


                /*
                 * ------------------------------------------
                 * Propagation-derived information
                 * ------------------------------------------
                 */

                .velocity(
                        debris.getVelocity()
                )

                .altitude(
                        debris.getAltitude()
                )


                /*
                 * ------------------------------------------
                 * Record state
                 * ------------------------------------------
                 */

                .status(
                        debris.getStatus()
                )

                .isActive(
                        debris.getIsActive()
                )

                .createdAt(
                        debris.getCreatedAt()
                )

                .updatedAt(
                        debris.getUpdatedAt()
                )

                .build();
    }


    /**
     * Updates an existing SpaceDebris entity from
     * UpdateDebrisRequest.
     *
     * <p>
     * CelesTrak-owned orbital fields are intentionally
     * excluded. They must only be modified by the
     * synchronization flow.
     * </p>
     *
     * <p>
     * NORAD ID and business code are also preserved because
     * they are used as synchronization identity.
     * </p>
     */
    public void updateEntity(
            UpdateDebrisRequest request,
            SpaceDebris debris) {

        if (request == null || debris == null) {
            return;
        }

        /*
         * ------------------------------------------
         * Application-managed fields
         * ------------------------------------------
         */

        debris.setDebrisName(
                request.getDebrisName()
        );

        debris.setObjectType(
                request.getObjectType()
        );

        debris.setOrbitType(
                request.getOrbitType()
        );

        debris.setCountry(
                request.getCountry()
        );

        debris.setSize(
                request.getSize()
        );

        debris.setMass(
                request.getMass()
        );

        /*
         * Velocity and altitude are propagation-derived.
         *
         * Therefore they should NOT be overwritten by
         * normal CRUD updates unless the application
         * explicitly intends to support manual overrides.
         */

        debris.setDescription(
                request.getDescription()
        );

        debris.setStatus(
                request.getStatus()
        );

        /*
         * Intentionally NOT modified:
         *
         * id
         * debrisCode
         * noradId
         * objectId
         * epoch
         * classificationType
         * ephemerisType
         * elementSetNumber
         * revolutionAtEpoch
         * meanMotion
         * meanMotionDot
         * meanMotionDdot
         * eccentricity
         * inclination
         * rightAscensionOfAscendingNode
         * argumentOfPericenter
         * meanAnomaly
         * bstar
         * velocity
         * altitude
         * launchDate
         * createdAt
         * isActive
         * updatedAt
         */
    }
}