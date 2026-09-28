package com.orbitguard.satellite.integration.celestrak.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Internal normalized representation of orbital data
 * obtained from CelesTrak.
 *
 * This DTO is the integration-layer contract used by
 * the satellite synchronization and propagation flows.
 *
 * Responsibilities:
 * - Represent normalized CelesTrak orbital element data.
 * - Provide a stable internal model between the CelesTrak
 *   integration layer and application services.
 *
 * This class must not:
 * - Contain MongoDB persistence logic.
 * - Calculate altitude or velocity.
 * - Perform SGP4 propagation.
 * - Contain HTTP/API communication logic.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CelesTrakOrbitalData {

    /**
     * Satellite/object name from CelesTrak.
     *
     * Example:
     * ISS (ZARYA)
     */
    private String satelliteName;

    /**
     * International designator assigned to the object.
     *
     * Example:
     * 1998-067A
     */
    private String objectId;

    /**
     * NORAD catalog identification number.
     *
     * Example:
     * 25544 = ISS (ZARYA)
     */
    private Integer noradCatalogId;

    /**
     * Epoch of the orbital element set.
     *
     * OrbitGuard treats this value as UTC.
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
     * Right ascension of ascending node
     * in degrees.
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
     * First derivative of mean motion.
     *
     * Unit:
     * revolutions / day²
     */
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     *
     * Unit:
     * revolutions / day³
     */
    private Double meanMotionDdot;

    /**
     * TLE element set number.
     */
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     *
     * Long is used by OrbitGuard's normalized
     * orbital-data contract.
     */
    private Long revolutionAtEpoch;

    /**
     * Object classification.
     *
     * Typical value:
     * U = Unclassified.
     */
    private String classificationType;

    /**
     * Ephemeris type used by the orbital element set.
     */
    private Integer ephemerisType;
}