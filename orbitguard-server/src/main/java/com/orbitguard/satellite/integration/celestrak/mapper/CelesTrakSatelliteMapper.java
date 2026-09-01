package com.orbitguard.satellite.integration.celestrak.mapper;

import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CelesTrakSatelliteMapper {

    /**
     * Converts the external CelesTrak response
     * into OrbitGuard's internal orbital-data DTO.
     *
     * External API model must not leak into
     * the application's business layer.
     */
    public CelesTrakOrbitalData toOrbitalData(
            CelesTrakSatelliteResponse response) {

        if (response == null) {
            return null;
        }

        return CelesTrakOrbitalData.builder()
                .satelliteName(response.getObjectName())
                .objectId(response.getObjectId())
                .noradCatalogId(response.getNoradCatalogId())
                .epoch(parseEpoch(response.getEpoch()))
                .meanMotion(response.getMeanMotion())
                .eccentricity(response.getEccentricity())
                .inclination(response.getInclination())
                .rightAscensionOfAscendingNode(
                        response.getRightAscensionOfAscendingNode()
                )
                .argumentOfPericenter(
                        response.getArgumentOfPericenter()
                )
                .meanAnomaly(response.getMeanAnomaly())
                .bstar(response.getBstar())
                .meanMotionDot(response.getMeanMotionDot())
                .meanMotionDdot(response.getMeanMotionDdot())
                .elementSetNumber(response.getElementSetNumber())
                .revolutionAtEpoch(response.getRevolutionAtEpoch())
                .classificationType(response.getClassificationType())
                .ephemerisType(response.getEphemerisType())
                .build();
    }

    private LocalDateTime parseEpoch(String epoch) {

        if (epoch == null || epoch.isBlank()) {
            return null;
        }

        return LocalDateTime.parse(epoch);
    }
}