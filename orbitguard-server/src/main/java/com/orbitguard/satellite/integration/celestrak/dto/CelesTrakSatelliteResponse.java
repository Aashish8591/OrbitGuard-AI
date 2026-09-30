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
 * <p>
 * Represents the orbital/GP data returned directly
 * by the CelesTrak GP API.
 * </p>
 *
 * <p>
 * This DTO belongs strictly to the CelesTrak integration layer.
 * It is intentionally independent of MongoDB persistence.
 * </p>
 *
 * <p>
 * Responsibilities:
 * <ul>
 *     <li>Deserialize CelesTrak GP JSON</li>
 *     <li>Expose CelesTrak identity fields</li>
 *     <li>Expose TLE/SGP4 orbital parameters</li>
 *     <li>Expose TLE metadata</li>
 * </ul>
 * </p>
 *
 * <p>
 * This DTO does NOT:
 * <ul>
 *     <li>perform business logic</li>
 *     <li>perform orbital propagation</li>
 *     <li>calculate altitude</li>
 *     <li>calculate velocity</li>
 *     <li>persist MongoDB data</li>
 * </ul>
 * </p>
 *
 * <p>
 * Unknown fields returned by CelesTrak are ignored intentionally.
 * This prevents the integration from breaking when CelesTrak
 * introduces additional response fields.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CelesTrakSatelliteResponse {

    /*
     * =========================================================
     * OBJECT IDENTITY
     * =========================================================
     */

    /**
     * CelesTrak object/satellite name.
     *
     * Example:
     * ISS (ZARYA)
     */
    @JsonProperty("OBJECT_NAME")
    private String objectName;

    /**
     * International designator / object ID.
     *
     * Example:
     * 1998-067A
     */
    @JsonProperty("OBJECT_ID")
    private String objectId;

    /**
     * NORAD catalog identification number.
     *
     * Example:
     * 25544
     *
     * This is the external identity used by
     * OrbitGuard synchronization.
     */
    @JsonProperty("NORAD_CAT_ID")
    private Integer noradCatalogId;


    /*
     * =========================================================
     * ORBITAL EPOCH
     * =========================================================
     */

    /**
     * Epoch of the current GP/TLE orbital element set.
     *
     * CelesTrak returns this as a timestamp string.
     *
     * The synchronization mapper converts it into
     * LocalDateTime before persistence.
     */
    @JsonProperty("EPOCH")
    private String epoch;


    /*
     * =========================================================
     * SGP4 / TLE ORBITAL PARAMETERS
     * =========================================================
     */

    /**
     * Mean motion.
     *
     * Unit:
     * revolutions per day.
     */
    @JsonProperty("MEAN_MOTION")
    private Double meanMotion;

    /**
     * First derivative of mean motion.
     *
     * Unit:
     * revolutions per day squared.
     */
    @JsonProperty("MEAN_MOTION_DOT")
    private Double meanMotionDot;

    /**
     * Second derivative of mean motion.
     *
     * Unit:
     * revolutions per day cubed.
     */
    @JsonProperty("MEAN_MOTION_DDOT")
    private Double meanMotionDdot;

    /**
     * Orbital eccentricity.
     */
    @JsonProperty("ECCENTRICITY")
    private Double eccentricity;

    /**
     * Orbital inclination.
     *
     * Unit:
     * degrees.
     */
    @JsonProperty("INCLINATION")
    private Double inclination;

    /**
     * Right ascension of ascending node.
     *
     * Unit:
     * degrees.
     */
    @JsonProperty("RA_OF_ASC_NODE")
    private Double rightAscensionOfAscendingNode;

    /**
     * Argument of pericenter.
     *
     * Unit:
     * degrees.
     */
    @JsonProperty("ARG_OF_PERICENTER")
    private Double argumentOfPericenter;

    /**
     * Mean anomaly.
     *
     * Unit:
     * degrees.
     */
    @JsonProperty("MEAN_ANOMALY")
    private Double meanAnomaly;


    /*
     * =========================================================
     * TLE METADATA
     * =========================================================
     */

    /**
     * Ephemeris type.
     */
    @JsonProperty("EPHEMERIS_TYPE")
    private Integer ephemerisType;

    /**
     * Object classification.
     *
     * Typical value:
     * U = Unclassified
     */
    @JsonProperty("CLASSIFICATION_TYPE")
    private String classificationType;

    /**
     * TLE element set number.
     */
    @JsonProperty("ELEMENT_SET_NO")
    private Integer elementSetNumber;

    /**
     * Revolution number at epoch.
     */
    @JsonProperty("REV_AT_EPOCH")
    private Integer revolutionAtEpoch;

    /**
     * BSTAR atmospheric drag coefficient.
     */
    @JsonProperty("BSTAR")
    private Double bstar;
}