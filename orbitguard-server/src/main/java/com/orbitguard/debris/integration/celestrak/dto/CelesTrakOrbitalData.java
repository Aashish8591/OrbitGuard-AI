package com.orbitguard.debris.integration.celestrak.dto;

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

    /*
     * --------------------------------------------------
     * Identity
     * --------------------------------------------------
     */

    private String objectName;

    private String objectId;

    private Long noradCatalogId;


    /*
     * --------------------------------------------------
     * TLE / orbital data
     * --------------------------------------------------
     */

    /**
     * TLE epoch in UTC.
     */
    private LocalDateTime epoch;

    private String classificationType;

    private Integer ephemerisType;

    private Integer elementSetNumber;

    private Long revolutionAtEpoch;


    /*
     * --------------------------------------------------
     * Orbital elements
     * --------------------------------------------------
     */

    /**
     * Mean motion in revolutions per day.
     */
    private Double meanMotion;

    /**
     * First derivative of mean motion.
     */
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     */
    private Double meanMotionDdot;

    /**
     * Orbital eccentricity.
     */
    private Double eccentricity;

    /**
     * Inclination in degrees.
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
     * BSTAR atmospheric drag term.
     */
    private Double bstar;
}