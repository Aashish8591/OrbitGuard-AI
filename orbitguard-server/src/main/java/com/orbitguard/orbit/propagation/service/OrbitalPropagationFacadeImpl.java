package com.orbitguard.orbit.propagation.service;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.mapper.DebrisOrbitalPropagationMapper;
import com.orbitguard.orbit.propagation.mapper.SatelliteOrbitalPropagationMapper;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrbitalPropagationFacadeImpl
        implements OrbitalPropagationFacade {

    private final CelesTrakService celesTrakService;

    private final CelesTrakDebrisService celesTrakDebrisService;

    private final SatelliteOrbitalPropagationMapper
            satelliteOrbitalPropagationMapper;

    private final DebrisOrbitalPropagationMapper
            debrisOrbitalPropagationMapper;

    private final OrbitalPropagationService
            orbitalPropagationService;

    private final CoordinateConversionService
            coordinateConversionService;

    @Override
    public PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime) {

        List<com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData>
                orbitalDataList =
                celesTrakService.fetchSatelliteOrbitalData(
                        noradCatalogId
                );

        if (orbitalDataList == null || orbitalDataList.isEmpty()) {
            throw new IllegalArgumentException(
                    "No orbital data found for satellite NORAD ID: "
                            + noradCatalogId
            );
        }

        com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData
                orbitalData = orbitalDataList.get(0);

        OrbitalPropagationInput input =
                satelliteOrbitalPropagationMapper.toPropagationInput(
                        orbitalData,
                        targetTime
                );

        return orbitalPropagationService.propagate(input);
    }

    @Override
    public PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime) {

        CelesTrakOrbitalData orbitalData =
                celesTrakDebrisService.fetchOrbitalData(noradId);

        if (orbitalData == null) {
            throw new IllegalArgumentException(
                    "No orbital data found for debris NORAD ID: "
                            + noradId
            );
        }

        OrbitalPropagationInput input =
                debrisOrbitalPropagationMapper.toPropagationInput(
                        orbitalData,
                        targetTime
                );

        return orbitalPropagationService.propagate(input);
    }

    @Override
    public PropagatedOrbitalData propagateSatelliteWithPosition(
            Integer noradCatalogId,
            LocalDateTime targetTime) {

        PropagatedOrbitalState orbitalState =
                propagateSatellite(
                        noradCatalogId,
                        targetTime
                );

        return buildPropagatedOrbitalData(orbitalState);
    }

    @Override
    public PropagatedOrbitalData propagateDebrisWithPosition(
            Long noradId,
            LocalDateTime targetTime) {

        PropagatedOrbitalState orbitalState =
                propagateDebris(
                        noradId,
                        targetTime
                );

        return buildPropagatedOrbitalData(orbitalState);
    }

    private PropagatedOrbitalData buildPropagatedOrbitalData(
            PropagatedOrbitalState orbitalState) {

        return PropagatedOrbitalData.builder()
                .orbitalState(orbitalState)
                .geodeticPosition(
                        coordinateConversionService
                                .toGeodeticPosition(orbitalState)
                )
                .build();
    }
}