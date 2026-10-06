package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.EarthFixedPosition;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

/**
 * Service responsible for converting propagated orbital coordinates
 * into Earth-referenced coordinate systems.
 *
 * <p>
 * The orbital propagation engine produces position coordinates in
 * the TEME reference frame. This service is responsible for converting
 * those coordinates into Earth-fixed and geodetic representations
 * required by the application and 3D visualization layer.
 * </p>
 */
public interface CoordinateConversionService {

    /**
     * Converts a propagated TEME orbital position into geodetic
     * coordinates using the WGS84 Earth model.
     *
     * <p>
     * The returned position contains:
     * </p>
     *
     * <ul>
     *     <li>Latitude in degrees</li>
     *     <li>Longitude in degrees</li>
     *     <li>Altitude in kilometres</li>
     * </ul>
     *
     * @param propagatedState propagated orbital state in TEME
     * @return geodetic position
     */
    GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState
    );

    /**
     * Converts a propagated TEME position into an Earth-fixed
     * Cartesian position.
     *
     * <p>
     * The returned coordinates are expressed in the ITRF frame and
     * are suitable for placing orbital objects around a rotating
     * Earth in the 3D visualization.
     * </p>
     *
     * <p>
     * Coordinates returned by this method are expressed in kilometres.
     * </p>
     *
     * @param propagatedState propagated orbital state in TEME
     * @return Earth-fixed Cartesian position in ITRF coordinates
     */
    EarthFixedPosition toEarthFixedPosition(
            PropagatedOrbitalState propagatedState
    );
}