package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

public interface CoordinateConversionService {

    GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState
    );
}