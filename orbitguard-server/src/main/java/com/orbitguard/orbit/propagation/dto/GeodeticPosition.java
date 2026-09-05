package com.orbitguard.orbit.propagation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeodeticPosition {

    /**
     * Geodetic latitude in degrees.
     */
    private Double latitude;

    /**
     * Geodetic longitude in degrees.
     */
    private Double longitude;

    /**
     * Altitude above the Earth reference ellipsoid in kilometers.
     */
    private Double altitude;
}