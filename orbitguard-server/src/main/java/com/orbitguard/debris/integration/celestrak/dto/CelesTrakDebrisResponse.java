package com.orbitguard.debris.integration.celestrak.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CelesTrakDebrisResponse {

    /*
     * --------------------------------------------------
     * CelesTrak object identity
     * --------------------------------------------------
     */

    @JsonProperty("OBJECT_NAME")
    private String objectName;

    @JsonProperty("OBJECT_ID")
    private String objectId;

    @JsonProperty("NORAD_CAT_ID")
    private Long noradCatalogId;


    /*
     * --------------------------------------------------
     * TLE / orbital data
     * --------------------------------------------------
     */

    @JsonProperty("EPOCH")
    private String epoch;

    @JsonProperty("CLASSIFICATION_TYPE")
    private String classificationType;

    @JsonProperty("EPHEMERIS_TYPE")
    private Integer ephemerisType;

    @JsonProperty("ELEMENT_SET_NO")
    private Integer elementSetNumber;

    @JsonProperty("REV_AT_EPOCH")
    private Long revolutionAtEpoch;


    /*
     * --------------------------------------------------
     * Orbital elements
     * --------------------------------------------------
     */

    @JsonProperty("MEAN_MOTION")
    private Double meanMotion;

    @JsonProperty("MEAN_MOTION_DOT")
    private Double meanMotionDot;

    @JsonProperty("MEAN_MOTION_DDOT")
    private Double meanMotionDdot;

    @JsonProperty("ECCENTRICITY")
    private Double eccentricity;

    @JsonProperty("INCLINATION")
    private Double inclination;

    @JsonProperty("RA_OF_ASC_NODE")
    private Double rightAscensionOfAscendingNode;

    @JsonProperty("ARG_OF_PERICENTER")
    private Double argumentOfPericenter;

    @JsonProperty("MEAN_ANOMALY")
    private Double meanAnomaly;

    @JsonProperty("BSTAR")
    private Double bstar;
}