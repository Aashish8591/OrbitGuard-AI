package com.orbitguard.orbit.propagation.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * ================================================================
 * OrbitGuard AI - Coordinate Conversion Result
 * ================================================================
 *
 * Contains all coordinate representations produced from a single
 * TEME -> ITRF coordinate transformation.
 *
 * IMPORTANT:
 *
 * The Earth-fixed transformation is intentionally performed only
 * once. Both the geodetic position and Earth-fixed Cartesian
 * position are derived from the same transformed coordinates.
 */
@Getter
@Builder
public class CoordinateConversionResult {

    /**
     * WGS84 geodetic representation.
     *
     * Latitude  -> degrees
     * Longitude -> degrees
     * Altitude  -> kilometres
     */
    private final GeodeticPosition geodeticPosition;

    /**
     * Earth-fixed Cartesian representation.
     *
     * Frame -> ITRF
     * X/Y/Z -> kilometres
     */
    private final EarthFixedPosition earthFixedPosition;
}