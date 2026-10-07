package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.CoordinateConversionResult;
import com.orbitguard.orbit.propagation.dto.EarthFixedPosition;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

/**
 * ================================================================
 * OrbitGuard AI - Coordinate Conversion Service
 * ================================================================
 *
 * Service responsible for converting propagated orbital coordinates
 * between orbital and Earth-referenced coordinate systems.
 *
 * The orbital propagation engine produces Cartesian coordinates in
 * the TEME reference frame.
 *
 * This service converts those coordinates into:
 *
 * 1. Earth-fixed ITRF Cartesian coordinates.
 * 2. WGS84 geodetic coordinates.
 *
 * IMPORTANT PERFORMANCE DESIGN:
 *
 * The bulk visualization pipeline needs BOTH representations.
 *
 * Therefore the primary conversion method is:
 *
 *     convert(...)
 *
 * It performs the TEME -> ITRF transformation exactly once and
 * returns both results.
 */
public interface CoordinateConversionService {

    /**
     * ================================================================
     * COMBINED COORDINATE CONVERSION
     * ================================================================
     *
     * Performs one complete TEME -> ITRF conversion and derives:
     *
     * - WGS84 geodetic position
     * - Earth-fixed ITRF Cartesian position
     *
     * Both results originate from the same Earth-fixed Cartesian
     * transformation.
     *
     * This method is the preferred method for the bulk visualization
     * pipeline.
     *
     * @param propagatedState propagated orbital state in TEME
     * @return combined coordinate conversion result
     */
    CoordinateConversionResult convert(
            PropagatedOrbitalState propagatedState
    );

    /**
     * ================================================================
     * GEODETIC CONVERSION
     * ================================================================
     *
     * Compatibility method for existing callers that only need
     * geodetic coordinates.
     *
     * @param propagatedState propagated orbital state in TEME
     * @return WGS84 geodetic position
     */
    GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState
    );

    /**
     * ================================================================
     * EARTH-FIXED CONVERSION
     * ================================================================
     *
     * Compatibility method for existing callers that only need
     * Earth-fixed Cartesian coordinates.
     *
     * @param propagatedState propagated orbital state in TEME
     * @return Earth-fixed ITRF Cartesian position
     */
    EarthFixedPosition toEarthFixedPosition(
            PropagatedOrbitalState propagatedState
    );
}