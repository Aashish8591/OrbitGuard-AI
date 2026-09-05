package com.orbitguard.orbit.propagation.mapper;

import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SatelliteOrbitalPropagationMapper {

    public OrbitalPropagationInput toPropagationInput(
            CelesTrakOrbitalData orbitalData,
            LocalDateTime targetTime) {

        if (orbitalData == null) {
            throw new IllegalArgumentException("Satellite orbital data must not be null");
        }

        if (targetTime == null) {
            throw new IllegalArgumentException("Target propagation time must not be null");
        }

        return OrbitalPropagationInput.builder()
                .noradCatalogId(orbitalData.getNoradCatalogId().longValue())
                .classificationType(orbitalData.getClassificationType())
                .epoch(orbitalData.getEpoch())
                .objectId(orbitalData.getObjectId())
                .ephemerisType(orbitalData.getEphemerisType())
                .meanMotion(orbitalData.getMeanMotion())
                .meanMotionDot(orbitalData.getMeanMotionDot())
                .meanMotionDdot(orbitalData.getMeanMotionDdot())
                .eccentricity(orbitalData.getEccentricity())
                .inclination(orbitalData.getInclination())
                .rightAscensionOfAscendingNode(
                        orbitalData.getRightAscensionOfAscendingNode())
                .argumentOfPericenter(orbitalData.getArgumentOfPericenter())
                .meanAnomaly(orbitalData.getMeanAnomaly())
                .bstar(orbitalData.getBstar())
                .elementSetNumber(orbitalData.getElementSetNumber())
                .revolutionAtEpoch(
                        orbitalData.getRevolutionAtEpoch().longValue())
                .targetTime(targetTime)
                .build();
    }
}