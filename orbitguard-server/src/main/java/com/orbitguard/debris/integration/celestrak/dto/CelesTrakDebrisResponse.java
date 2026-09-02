package com.orbitguard.debris.integration.celestrak.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CelesTrakDebrisResponse {

    @JsonProperty("OBJECT_NAME")
    private String objectName;

    @JsonProperty("OBJECT_ID")
    private String objectId;

    @JsonProperty("EPOCH")
    private String epoch;

    @JsonProperty("MEAN_MOTION")
    private Double meanMotion;

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

    @JsonProperty("EPHEMERIS_TYPE")
    private Integer ephemerisType;

    @JsonProperty("CLASSIFICATION_TYPE")
    private String classificationType;

    @JsonProperty("NORAD_CAT_ID")
    private Long noradCatalogId;

    @JsonProperty("ELEMENT_SET_NO")
    private Integer elementSetNumber;

    @JsonProperty("REV_AT_EPOCH")
    private Long revolutionAtEpoch;

    @JsonProperty("BSTAR")
    private Double bstar;

    @JsonProperty("MEAN_MOTION_DOT")
    private Double meanMotionDot;

    @JsonProperty("MEAN_MOTION_DDOT")
    private Double meanMotionDdot;
}