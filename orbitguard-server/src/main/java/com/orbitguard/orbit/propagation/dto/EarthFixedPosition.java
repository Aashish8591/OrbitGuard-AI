package com.orbitguard.orbit.propagation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an Earth-fixed Cartesian position.
 *
 * <p>
 * Coordinates are expressed in kilometres and use the ITRF
 * reference frame.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarthFixedPosition {

    /**
     * Earth-fixed X coordinate in kilometres.
     */
    private Double xKm;

    /**
     * Earth-fixed Y coordinate in kilometres.
     */
    private Double yKm;

    /**
     * Earth-fixed Z coordinate in kilometres.
     */
    private Double zKm;

    /**
     * Reference frame of the coordinates.
     *
     * <p>
     * Expected value: ITRF.
     * </p>
     */
    private String frame;
}