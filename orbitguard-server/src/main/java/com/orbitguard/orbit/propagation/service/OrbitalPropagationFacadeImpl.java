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

    /**
     * Propagate a satellite using its NORAD catalog ID.
     *
     * Flow:
     *
     * Satellite NORAD ID
     *        ↓
     * CelesTrakService
     *        ↓
     * CelesTrakOrbitalData
     *        ↓
     * SatelliteOrbitalPropagationMapper
     *        ↓
     * OrbitalPropagationInput
     *        ↓
     * OrbitalPropagationService
     *        ↓
     * PropagatedOrbitalState
     *
     * The satellite integration layer currently uses Integer
     * for NORAD catalog IDs. The propagation layer is responsible
     * for its own Long-based orbital propagation contract.
     */
    @Override
    public PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime) {

        validateSatelliteNoradId(noradCatalogId);
        validateTargetTime(targetTime);

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

        if (orbitalData == null) {
            throw new IllegalArgumentException(
                    "Satellite orbital data is null for NORAD ID: "
                            + noradCatalogId
            );
        }

        OrbitalPropagationInput input =
                satelliteOrbitalPropagationMapper.toPropagationInput(
                        orbitalData,
                        targetTime
                );

        if (input == null) {
            throw new IllegalStateException(
                    "Failed to create orbital propagation input "
                            + "for satellite NORAD ID: "
                            + noradCatalogId
            );
        }

        return orbitalPropagationService.propagate(input);
    }

    /**
     * Propagate a debris object using its NORAD ID.
     *
     * The debris integration layer currently uses Long for
     * the NORAD identifier, so that type is intentionally
     * preserved here.
     */
    @Override
    public PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime) {

        validateDebrisNoradId(noradId);
        validateTargetTime(targetTime);

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

        if (input == null) {
            throw new IllegalStateException(
                    "Failed to create orbital propagation input "
                            + "for debris NORAD ID: "
                            + noradId
            );
        }

        return orbitalPropagationService.propagate(input);
    }

    /**
     * Propagate a satellite and additionally calculate
     * its geodetic position.
     */
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

    /**
     * Propagate a debris object and additionally calculate
     * its geodetic position.
     */
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

    /**
     * Build the combined propagation response.
     *
     * The orbital state is produced by Orekit propagation,
     * while geodetic position is calculated by the coordinate
     * conversion layer.
     */
    private PropagatedOrbitalData buildPropagatedOrbitalData(
            PropagatedOrbitalState orbitalState) {

        if (orbitalState == null) {
            throw new IllegalStateException(
                    "Propagated orbital state must not be null."
            );
        }

        return PropagatedOrbitalData.builder()
                .orbitalState(orbitalState)
                .geodeticPosition(
                        coordinateConversionService
                                .toGeodeticPosition(orbitalState)
                )
                .build();
    }

    /**
     * Validate satellite NORAD catalog ID.
     *
     * Satellite integration currently uses Integer.
     */
    private void validateSatelliteNoradId(
            Integer noradCatalogId) {

        if (noradCatalogId == null || noradCatalogId <= 0) {
            throw new IllegalArgumentException(
                    "Satellite NORAD catalog ID must be greater than zero."
            );
        }
    }

    /**
     * Validate debris NORAD ID.
     *
     * Debris integration currently uses Long.
     */
    private void validateDebrisNoradId(
            Long noradId) {

        if (noradId == null || noradId <= 0) {
            throw new IllegalArgumentException(
                    "Debris NORAD ID must be greater than zero."
            );
        }
    }

    /**
     * Target propagation time is required by both
     * satellite and debris propagation.
     */
    private void validateTargetTime(
            LocalDateTime targetTime) {

        if (targetTime == null) {
            throw new IllegalArgumentException(
                    "Target propagation time must not be null."
            );
        }
    }
}