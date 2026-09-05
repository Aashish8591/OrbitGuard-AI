package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

import java.time.LocalDateTime;

public interface OrbitalPropagationFacade {

    PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime
    );

    PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime
    );

    PropagatedOrbitalData propagateSatelliteWithPosition(
            Integer noradCatalogId,
            LocalDateTime targetTime
    );

    PropagatedOrbitalData propagateDebrisWithPosition(
            Long noradId,
            LocalDateTime targetTime
    );
}