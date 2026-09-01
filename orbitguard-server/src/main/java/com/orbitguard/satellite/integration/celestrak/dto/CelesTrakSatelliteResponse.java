package com.orbitguard.satellite.integration.celestrak.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CelesTrakSatelliteResponse {

    /**
     * Satellite/object name provided by CelesTrak.
     * Example: ISS (ZARYA)
     */
    @JsonProperty("OBJECT_NAME")
    private String objectName;

    /**
     * International designator.
     * Example: 1998-067A
     */
    @JsonProperty("OBJECT_ID")
    private String objectId;

    /**
     * Epoch of the orbital element set.
     */
    @JsonProperty("EPOCH")
    private String epoch;

    /**
     * Mean motion in revolutions per day.
     */
    @JsonProperty("MEAN_MOTION")
    private Double meanMotion;

    /**
     * Orbital eccentricity.
     */
    @JsonProperty("ECCENTRICITY")
    private Double eccentricity;

    /**
     * Orbital inclination in degrees.
     */
    @JsonProperty("INCLINATION")
    private Double inclination;

    /**
     * Right ascension of the ascending node in degrees.
     */
    @JsonProperty("RA_OF_ASC_NODE")
    private Double rightAscensionOfAscendingNode;

    /**
     * Argument of pericenter in degrees.
     */
    @JsonProperty("ARG_OF_PERICENTER")
    private Double argumentOfPericenter;

    /**
     * Mean anomaly in degrees.
     */
    @JsonProperty("MEAN_ANOMALY")
    private Double meanAnomaly;

    /**
     * Ephemeris type used for the orbital data.
     */
    @JsonProperty("EPHEMERIS_TYPE")
    private Integer ephemerisType;

    /**
     * Object classification.
     * Example: U = Unclassified
     */
    @JsonProperty("CLASSIFICATION_TYPE")
    private String classificationType;

    /**
     * NORAD catalog identification number.
     * Example: 25544 for ISS.
     */
    @JsonProperty("NORAD_CAT_ID")
    private Integer noradCatalogId;

    /**
     * Element set number.
     */
    @JsonProperty("ELEMENT_SET_NO")
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     */
    @JsonProperty("REV_AT_EPOCH")
    private Integer revolutionAtEpoch;

    /**
     * BSTAR drag term used in orbital propagation.
     */
    @JsonProperty("BSTAR")
    private Double bstar;

    /**
     * First time derivative of mean motion.
     */
    @JsonProperty("MEAN_MOTION_DOT")
    private Double meanMotionDot;

    /**
     * Second time derivative of mean motion.
     */
    @JsonProperty("MEAN_MOTION_DDOT")
    private Double meanMotionDdot;
}