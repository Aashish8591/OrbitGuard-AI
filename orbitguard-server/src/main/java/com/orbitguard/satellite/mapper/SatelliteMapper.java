package com.orbitguard.satellite.mapper;

import com.orbitguard.satellite.dto.request.CreateSatelliteRequest;
import com.orbitguard.satellite.dto.request.UpdateSatelliteRequest;
import com.orbitguard.satellite.dto.response.SatelliteResponse;
import com.orbitguard.satellite.entity.Satellite;

import org.springframework.stereotype.Component;

@Component
public class SatelliteMapper {

    /**
     * Convert Create Request DTO -> Entity.
     *
     * <p>
     * This method is responsible only for application-managed
     * satellite metadata.
     * </p>
     *
     * <p>
     * CelesTrak orbital/TLE fields are intentionally not
     * populated here. Those fields are owned by the
     * synchronization layer.
     * </p>
     *
     * @param request create satellite request
     * @return Satellite entity
     */
    public Satellite toEntity(
            CreateSatelliteRequest request) {

        if (request == null) {
            return null;
        }

        return Satellite.builder()

                /*
                 * ------------------------------------------
                 * Application-managed identity
                 * ------------------------------------------
                 */

                .satelliteName(
                        request.getSatelliteName()
                )

                .satelliteCode(
                        request.getSatelliteCode()
                )

                .noradCatalogId(
                        request.getNoradCatalogId()
                )


                /*
                 * ------------------------------------------
                 * Application-managed information
                 * ------------------------------------------
                 */

                .operator(
                        request.getOperator()
                )

                .orbitType(
                        request.getOrbitType()
                )

                .altitude(
                        request.getAltitude()
                )

                .velocity(
                        request.getVelocity()
                )

                .launchDate(
                        request.getLaunchDate()
                )

                .country(
                        request.getCountry()
                )

                .purpose(
                        request.getPurpose()
                )

                .description(
                        request.getDescription()
                )

                .build();
    }


    /**
     * Convert Satellite Entity -> Response DTO.
     *
     * <p>
     * This mapper exposes the complete satellite record,
     * including synchronized CelesTrak/TLE data.
     * </p>
     *
     * <pre>
     * MongoDB
     *    ↓
     * Satellite
     *    ↓
     * SatelliteMapper
     *    ↓
     * SatelliteResponse
     *    ↓
     * REST API / Swagger / Frontend
     * </pre>
     *
     * @param satellite Satellite entity
     * @return Satellite response DTO
     */
    public SatelliteResponse toResponse(
            Satellite satellite) {

        if (satellite == null) {
            return null;
        }

        return SatelliteResponse.builder()

                /*
                 * ------------------------------------------
                 * Identity
                 * ------------------------------------------
                 */

                .id(
                        satellite.getId()
                )

                .satelliteName(
                        satellite.getSatelliteName()
                )

                .satelliteCode(
                        satellite.getSatelliteCode()
                )

                .noradCatalogId(
                        satellite.getNoradCatalogId()
                )

                .objectId(
                        satellite.getObjectId()
                )


                /*
                 * ------------------------------------------
                 * CelesTrak / TLE orbital data
                 * ------------------------------------------
                 */

                .epoch(
                        satellite.getEpoch()
                )

                .classificationType(
                        satellite.getClassificationType()
                )

                .ephemerisType(
                        satellite.getEphemerisType()
                )

                .elementSetNumber(
                        satellite.getElementSetNumber()
                )

                .revolutionAtEpoch(
                        satellite.getRevolutionAtEpoch()
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


                /*
                 * ------------------------------------------
                 * Application-managed / derived data
                 * ------------------------------------------
                 */


                .altitude(
                        satellite.getAltitude()
                )

                .velocity(
                        satellite.getVelocity()
                )

                .missionStatus(
                        satellite.getMissionStatus()
                )





                /*
                 * ------------------------------------------
                 * State / timestamps
                 * ------------------------------------------
                 */

                .active(
                        satellite.getActive()
                )

                .createdAt(
                        satellite.getCreatedAt()
                )

                .updatedAt(
                        satellite.getUpdatedAt()
                )

                .build();
    }


    /**
     * Update existing Satellite entity from the
     * application Update Request DTO.
     *
     * <p>
     * This method intentionally does NOT modify:
     * </p>
     *
     * <ul>
     *     <li>objectId</li>
     *     <li>epoch</li>
     *     <li>classificationType</li>
     *     <li>ephemerisType</li>
     *     <li>elementSetNumber</li>
     *     <li>revolutionAtEpoch</li>
     *     <li>meanMotion</li>
     *     <li>meanMotionDot</li>
     *     <li>meanMotionDdot</li>
     *     <li>eccentricity</li>
     *     <li>inclination</li>
     *     <li>RAAN</li>
     *     <li>argumentOfPericenter</li>
     *     <li>meanAnomaly</li>
     *     <li>bstar</li>
     * </ul>
     *
     * <p>
     * Those fields are controlled by the CelesTrak
     * synchronization flow.
     * </p>
     */
    public void updateEntity(
            UpdateSatelliteRequest request,
            Satellite satellite) {

        if (request == null || satellite == null) {
            return;
        }

        /*
         * ------------------------------------------
         * Application-managed fields
         * ------------------------------------------
         */

        satellite.setSatelliteName(
                request.getSatelliteName()
        );

        satellite.setOperator(
                request.getOperator()
        );

        satellite.setOrbitType(
                request.getOrbitType()
        );

        satellite.setAltitude(
                request.getAltitude()
        );

        satellite.setVelocity(
                request.getVelocity()
        );

        satellite.setMissionStatus(
                request.getMissionStatus()
        );
    }
}