package com.orbitguard.orbit.propagation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropagatedOrbitalData {

    /**
     * Propagated position and velocity state.
     */
    private PropagatedOrbitalState orbitalState;

    /**
     * Geodetic position derived from the propagated state.
     */
    private GeodeticPosition geodeticPosition;
}