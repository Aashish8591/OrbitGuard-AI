package com.orbitguard.satellite.entity;

import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "satellites")
public class Satellite {

    @Id
    private String id;

    /**
     * Satellite/object name.
     *
     * Example:
     * ISS (ZARYA)
     */
    private String satelliteName;

    /**
     * Application-level satellite code.
     *
     * For CelesTrak synchronized satellites,
     * the international designator is currently used.
     *
     * Example:
     * 1998-067A
     */
    private String satelliteCode;

    /**
     * NORAD catalog identification number.
     *
     * Example:
     * 25544 = ISS
     */
    private Integer noradCatalogId;

    /**
     * International designator assigned to the object.
     *
     * Example:
     * 1998-067A
     *
     * Kept separately from satelliteCode because objectId
     * is an orbital-data/provider identifier.
     */
    private String objectId;

    /**
     * CelesTrak TLE epoch.
     */
    private LocalDateTime epoch;

    /**
     * Object classification.
     *
     * Typical value:
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
     *
     * CelesTrak unit:
     * revolutions/day²
     */
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     *
     * CelesTrak unit:
     * revolutions/day³
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
     * Example:
     * NASA
     * ISRO
     * SpaceX
     *
     * Application-managed field.
     */
    private String operator;

    /**
     * LEO
     * MEO
     * GEO
     *
     * Application-derived/application-managed field.
     */
    private OrbitType orbitType;

    /**
     * Height from Earth in KM.
     *
     * This is not populated directly from CelesTrak GP
     * synchronization.
     *
     * It may be populated later from propagation.
     */
    private Double altitude;

    /**
     * Velocity in KM/s.
     *
     * This is not populated directly from CelesTrak GP
     * synchronization.
     *
     * It may be populated later from propagation.
     */
    private Double velocity;

    /**
     * Launch date.
     *
     * Application-managed / derived metadata.
     */
    private LocalDate launchDate;

    /**
     * ACTIVE
     * INACTIVE
     * DECOMMISSIONED
     */
    @Builder.Default
    private MissionStatus missionStatus = MissionStatus.ACTIVE;

    @Builder.Default
    private Boolean active = true;

    /**
     * Example:
     * India
     * USA
     * Japan
     */
    private String country;

    /**
     * Communication
     * Navigation
     * Weather
     * Military
     */
    private String purpose;

    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}