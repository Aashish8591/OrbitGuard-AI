package com.orbitguard.satellite.dto.response;

import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SatelliteResponse {

    /*
     * --------------------------------------------------
     * Identity
     * --------------------------------------------------
     */

    private String id;

    private String satelliteName;

    private String satelliteCode;

    private Integer noradCatalogId;

    /**
     * International designator / COSPAR ID.
     *
     * Example:
     * 1998-067A
     */
    private String objectId;


    /*
     * --------------------------------------------------
     * CelesTrak / TLE orbital data
     * --------------------------------------------------
     */

    /**
     * CelesTrak TLE epoch in UTC.
     */
    private LocalDateTime epoch;

    /**
     * Object classification.
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
    private Integer revolutionAtEpoch;

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


    /**
     * Height above Earth in kilometers.
     *
     * May be populated by the propagation/risk
     * calculation layer.
     */
    private Double altitude;

    /**
     * Orbital velocity in kilometers per second.
     *
     * May be populated by the propagation layer.
     */
    private Double velocity;

    private MissionStatus missionStatus;




    /*
     * --------------------------------------------------
     * Record state / timestamps
     * --------------------------------------------------
     */

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}