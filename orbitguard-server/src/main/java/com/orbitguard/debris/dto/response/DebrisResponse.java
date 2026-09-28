package com.orbitguard.debris.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.enums.ObjectType;
import com.orbitguard.debris.enums.OrbitType;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO representing a tracked space debris object.
 *
 * <p>
 * The response exposes:
 *
 * <ul>
 *     <li>Debris identity</li>
 *     <li>CelesTrak orbital / GP data</li>
 *     <li>Application-managed metadata</li>
 *     <li>Propagation-derived altitude and velocity</li>
 *     <li>Record state and timestamps</li>
 * </ul>
 *
 * <p>
 * Null fields are excluded from the JSON response so that
 * API consumers receive only values that are currently
 * available.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response object representing a tracked space debris object")
public class DebrisResponse {

    /*
     * --------------------------------------------------
     * Identity
     * --------------------------------------------------
     */

    @Schema(
            description = "MongoDB document ID",
            example = "6888e7b49af3d13dbac91a21"
    )
    private String id;

    @Schema(
            description = "Unique OrbitGuard business identifier",
            example = "DEB-000133"
    )
    private String debrisCode;

    @Schema(
            description = "Official object name provided by CelesTrak",
            example = "SHENZHOU-23 (SZ-23)"
    )
    private String debrisName;

    @Schema(
            description = "NORAD Catalog ID",
            example = "69180"
    )
    private Long noradId;

    /**
     * International Designator / Object ID.
     *
     * Example:
     * 2026-113A
     */
    @Schema(
            description = "International Designator / CelesTrak object ID",
            example = "2026-113A"
    )
    private String objectId;


    /*
     * --------------------------------------------------
     * CelesTrak / GP orbital data
     * --------------------------------------------------
     */

    /**
     * CelesTrak GP epoch in UTC.
     */
    @Schema(
            description = "CelesTrak orbital epoch in UTC",
            example = "2026-09-27T20:41:32.781"
    )
    private LocalDateTime epoch;

    /**
     * Object classification.
     *
     * U = Unclassified.
     */
    @Schema(
            description = "Object classification type",
            example = "U"
    )
    private String classificationType;

    /**
     * TLE ephemeris type.
     */
    @Schema(
            description = "TLE ephemeris type",
            example = "0"
    )
    private Integer ephemerisType;

    /**
     * TLE element set number.
     */
    @Schema(
            description = "TLE element set number",
            example = "999"
    )
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     */
    @Schema(
            description = "Revolution number at epoch",
            example = "30817"
    )
    private Long revolutionAtEpoch;

    /**
     * Mean motion in revolutions per day.
     */
    @Schema(
            description = "Mean motion in revolutions per day",
            example = "15.60347058"
    )
    private Double meanMotion;

    /**
     * First derivative of mean motion.
     */
    @Schema(
            description = "First derivative of mean motion",
            example = "0.00013776"
    )
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     */
    @Schema(
            description = "Second derivative of mean motion",
            example = "0.0"
    )
    private Double meanMotionDdot;

    /**
     * Orbital eccentricity.
     */
    @Schema(
            description = "Orbital eccentricity",
            example = "0.00018932"
    )
    private Double eccentricity;

    /**
     * Orbital inclination in degrees.
     */
    @Schema(
            description = "Orbital inclination in degrees",
            example = "41.4689"
    )
    private Double inclination;

    /**
     * Right ascension of ascending node in degrees.
     */
    @Schema(
            description = "Right ascension of ascending node in degrees",
            example = "57.1199"
    )
    private Double rightAscensionOfAscendingNode;

    /**
     * Argument of pericenter in degrees.
     */
    @Schema(
            description = "Argument of pericenter in degrees",
            example = "319.8423"
    )
    private Double argumentOfPericenter;

    /**
     * Mean anomaly in degrees.
     */
    @Schema(
            description = "Mean anomaly in degrees",
            example = "40.2275"
    )
    private Double meanAnomaly;

    /**
     * BSTAR atmospheric drag term.
     */
    @Schema(
            description = "BSTAR atmospheric drag term",
            example = "0.00016716226"
    )
    private Double bstar;


    /*
     * --------------------------------------------------
     * Application-managed information
     * --------------------------------------------------
     */

    @Schema(
            description = "Debris object category",
            example = "FRAGMENT"
    )
    private ObjectType objectType;

    @Schema(
            description = "Orbital region classification",
            example = "LEO"
    )
    private OrbitType orbitType;

    @Schema(
            description = "Country responsible for launch",
            example = "Russia"
    )
    private String country;

    @Schema(
            description = "Approximate physical size in meters",
            example = "1.45"
    )
    private Double size;

    @Schema(
            description = "Approximate mass in kilograms",
            example = "15.20"
    )
    private Double mass;

    @Schema(
            description = "Original launch date",
            example = "2009-02-10"
    )
    private LocalDate launchDate;

    @Schema(
            description = "Additional debris information",
            example = "Tracked debris object."
    )
    private String description;


    /*
     * --------------------------------------------------
     * Propagation-derived information
     * --------------------------------------------------
     */

    /**
     * Current propagated orbital velocity in km/s.
     *
     * <p>
     * This value is calculated by the orbital propagation
     * layer and is not directly supplied by CelesTrak GP data.
     * </p>
     */
    @Schema(
            description = "Current propagated orbital velocity in km/s",
            example = "7.6815"
    )
    private Double velocity;

    /**
     * Current propagated altitude above Earth in km.
     *
     * <p>
     * This value is calculated by the orbital propagation
     * layer.
     * </p>
     */
    @Schema(
            description = "Current propagated altitude above Earth in km",
            example = "388.35"
    )
    private Double altitude;


    /*
     * --------------------------------------------------
     * Record state
     * --------------------------------------------------
     */

    @Schema(
            description = "Current debris tracking status",
            example = "ACTIVE"
    )
    private DebrisStatus status;

    @Schema(
            description = "Whether the debris record is active",
            example = "true"
    )
    private Boolean isActive;

    @Schema(
            description = "Record creation timestamp",
            example = "2026-09-28T12:29:18.194"
    )
    private LocalDateTime createdAt;

    @Schema(
            description = "Last record modification timestamp",
            example = "2026-09-28T12:29:18.194"
    )
    private LocalDateTime updatedAt;
}