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
     *
     * <p>
     * The propagated state is produced by the existing
     * SGP4/Orekit propagation engine and is represented
     * in the TEME reference frame.
     * </p>
     */
    private PropagatedOrbitalState orbitalState;

    /**
     * Geodetic position derived from the propagated state.
     *
     * <p>
     * Contains latitude, longitude and altitude values
     * suitable for geographic positioning.
     * </p>
     */
    private GeodeticPosition geodeticPosition;

    /**
     * Earth-fixed Cartesian position derived from the
     * propagated TEME state.
     *
     * <p>
     * The coordinates are expressed in the ITRF Earth-fixed
     * reference frame and are represented in kilometres.
     * These coordinates are suitable for placing objects
     * correctly around the rotating 3D Earth.
     * </p>
     */
    private EarthFixedPosition earthFixedPosition;
}