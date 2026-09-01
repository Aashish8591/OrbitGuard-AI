package com.orbitguard.satellite.integration.celestrak.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CelesTrakOrbitalData {

    /**
     * Satellite name from CelesTrak.
     */
    private String satelliteName;

    /**
     * International designator.
     */
    private String objectId;

    /**
     * NORAD catalog ID.
     */
    private Integer noradCatalogId;

    /**
     * Epoch of the orbital element set.
     */
    private LocalDateTime epoch;

    /**
     * Mean motion in revolutions per day.
     */
    private Double meanMotion;

    /**
     * Orbital eccentricity.
     */
    private Double eccentricity;

    /**
     * Orbital inclination in degrees.
     */
    private Double inclination;

    /**
     * Right ascension of ascending node in degrees.
     */
    private Double rightAscensionOfAscendingNode;

    /**
     * Argument of pericenter in degrees.
     */
    private Double argumentOfPericenter;

    /**
     * Mean anomaly in degrees.
     */
    private Double meanAnomaly;

    /**
     * BSTAR drag term.
     */
    private Double bstar;

    /**
     * First derivative of mean motion.
     */
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     */
    private Double meanMotionDdot;

    /**
     * Element set number.
     */
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     */
    private Integer revolutionAtEpoch;

    /**
     * Classification type.
     */
    private String classificationType;

    /**
     * Ephemeris type.
     */
    private Integer ephemerisType;
}