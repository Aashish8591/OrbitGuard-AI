package com.orbitguard.satellite.integration.celestrak.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * External CelesTrak GP response model.
 *
 * This DTO represents orbital data returned directly
 * by the CelesTrak GP API.
 *
 * This class belongs strictly to the integration layer.
 *
 * It must not:
 * - contain business logic
 * - contain MongoDB persistence logic
 * - perform orbital propagation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CelesTrakSatelliteResponse {

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
    private Integer noradCatalogId;

    @JsonProperty("ELEMENT_SET_NO")
    private Integer elementSetNumber;

    @JsonProperty("REV_AT_EPOCH")
    private Integer revolutionAtEpoch;

    @JsonProperty("BSTAR")
    private Double bstar;

    @JsonProperty("MEAN_MOTION_DOT")
    private Double meanMotionDot;

    @JsonProperty("MEAN_MOTION_DDOT")
    private Double meanMotionDdot;
}