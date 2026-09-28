package com.orbitguard.orbit.propagation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Normalized input required for SGP/SGP4 orbital propagation.
 *
 * <p>This DTO acts as the internal contract between the
 * satellite/debris orbital-data mappers and the Orekit
 * propagation service.</p>
 *
 * <p>External CelesTrak DTOs must not be passed directly
 * into the propagation layer.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrbitalPropagationInput {

    /**
     * NORAD catalog identification number.
     *
     * <p>Long is used here because OrbitGuard supports both
     * satellite and debris integrations, whose upstream
     * identifiers may use different numeric types.</p>
     */
    private Long noradCatalogId;

    /**
     * Object classification from the TLE.
     *
     * <p>Typical CelesTrak value:
     * U = Unclassified.</p>
     */
    private String classificationType;

    /**
     * Epoch of the orbital element set.
     *
     * <p>The current OrbitGuard integration treats this
     * LocalDateTime as UTC when creating the Orekit
     * AbsoluteDate.</p>
     */
    private LocalDateTime epoch;

    /**
     * International designator assigned to the object.
     *
     * <p>Example:
     * 1998-067A</p>
     */
    private String objectId;

    /**
     * TLE ephemeris type.
     */
    private Integer ephemerisType;

    /**
     * Mean motion in revolutions per day.
     */
    private Double meanMotion;

    /**
     * First derivative of mean motion.
     *
     * <p>CelesTrak provides this in revolutions/day².</p>
     */
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     *
     * <p>CelesTrak provides this in revolutions/day³.</p>
     */
    private Double meanMotionDdot;

    /**
     * Orbital eccentricity.
     */
    private Double eccentricity;

    /**
     * Orbital inclination in degrees.
     */
    private Double inclination;

    /**
     * Right ascension of the ascending node in degrees.
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

    /**
     * TLE element set number.
     */
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     *
     * <p>Long is retained at the DTO boundary so the
     * propagation contract remains compatible with the
     * debris integration.</p>
     */
    private Long revolutionAtEpoch;

    /**
     * Target time at which the orbital state should be
     * propagated.
     */
    private LocalDateTime targetTime;
}