package com.orbitguard.debris.integration.celestrak.mapper;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CelesTrakDebrisMapper {

    public CelesTrakOrbitalData toOrbitalData(
            CelesTrakDebrisResponse response) {

        if (response == null) {
            return null;
        }

        return CelesTrakOrbitalData.builder()
                .objectName(response.getObjectName())
                .objectId(response.getObjectId())
                .noradCatalogId(response.getNoradCatalogId())
                .epoch(parseEpoch(response.getEpoch()))
                .meanMotion(response.getMeanMotion())
                .eccentricity(response.getEccentricity())
                .inclination(response.getInclination())
                .rightAscensionOfAscendingNode(
                        response.getRightAscensionOfAscendingNode())
                .argumentOfPericenter(
                        response.getArgumentOfPericenter())
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