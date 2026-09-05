package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

public interface OrbitalPropagationService {

    PropagatedOrbitalState propagate(OrbitalPropagationInput input);
}