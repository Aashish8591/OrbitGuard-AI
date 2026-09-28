package com.orbitguard.debris.entity;

import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.enums.ObjectType;
import com.orbitguard.debris.enums.OrbitType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MongoDB document representing a tracked space debris object.
 *
 * <p>
 * The entity stores:
 * <ul>
 *     <li>Debris identity</li>
 *     <li>CelesTrak GP/TLE orbital data</li>
 *     <li>Application-managed metadata</li>
 *     <li>Propagation-derived orbital state</li>
 *     <li>Record state and timestamps</li>
 * </ul>
 *
 * <p>
 * CelesTrak synchronization is the source of truth for
 * GP/TLE orbital fields.
 *
 * <p>
 * Altitude and velocity are derived values produced by
 * the orbital propagation layer. They must not be populated
 * directly from the CelesTrak synchronization response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "space_debris")
public class SpaceDebris {

    /*
     * --------------------------------------------------
     * Identity
     * --------------------------------------------------
     */

    @Id
    private String id;

    /**
     * OrbitGuard business identifier.
     *
     * Example:
     * DEB-000001
     */
    @Indexed(unique = true)
    private String debrisCode;

    /**
     * Official object name from CelesTrak.
     */
    @Indexed
    private String debrisName;

    /**
     * NORAD Catalog ID.
     *
     * This is the external identity used by both
     * synchronization and orbital propagation.
     */
    @Indexed(unique = true)
    private Long noradId;

    /**
     * CelesTrak international designator.
     *
     * Example:
     * 2026-113A
     */
    private String objectId;


    /*
     * --------------------------------------------------
     * CelesTrak / GP / TLE orbital data
     * --------------------------------------------------
     */

    /**
     * CelesTrak orbital epoch in UTC.
     */
    private LocalDateTime epoch;

    /**
     * CelesTrak classification type.
     *
     * Example:
     * U = Unclassified
     */
    private String classificationType;

    /**
     * TLE ephemeris type.
     */
    private Integer ephemerisType;

    /**
     * TLE element set number.
     */
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     */
    private Long revolutionAtEpoch;

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
     * BSTAR atmospheric drag term.
     */
    private Double bstar;


    /*
     * --------------------------------------------------
     * Application-managed metadata
     * --------------------------------------------------
     */

    /**
     * Application-defined debris category.
     *
     * This should not be overwritten by CelesTrak
     * synchronization unless a trusted mapping is available.
     */
    private ObjectType objectType;

    /**
     * Orbital region/category.
     *
     * Example:
     * LEO, MEO, GEO
     */
    private OrbitType orbitType;

    /**
     * Country responsible for launch.
     */
    private String country;

    /**
     * Approximate physical size in meters.
     */
    private Double size;

    /**
     * Approximate mass in kilograms.
     */
    private Double mass;

    /**
     * Original launch date.
     */
    private LocalDate launchDate;

    /**
     * Additional description.
     */
    private String description;


    /*
     * --------------------------------------------------
     * Propagation-derived state
     * --------------------------------------------------
     */

    /**
     * Current propagated orbital velocity in km/s.
     *
     * <p>
     * This value is calculated from the propagated
     * position/velocity state by the orbital propagation
     * service.
     *
     * <p>
     * It must not be populated directly from CelesTrak GP data.
     */
    private Double velocity;

    /**
     * Current propagated altitude above Earth in km.
     *
     * <p>
     * This value is calculated by the orbital propagation
     * service from the propagated position.
     *
     * <p>
     * It must not be populated directly from CelesTrak GP data.
     */
    private Double altitude;


    /*
     * --------------------------------------------------
     * Record state
     * --------------------------------------------------
     */

    /**
     * Current debris tracking status.
     */
    private DebrisStatus status;

    /**
     * Indicates whether the debris record is active.
     */
    @Builder.Default
    private Boolean isActive = true;


    /*
     * --------------------------------------------------
     * Timestamps
     * --------------------------------------------------
     */

    /**
     * Record creation timestamp.
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Last modification timestamp.
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;
}