package com.orbitguard.visualization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the visualization data of a single orbital object.
 *
 * <p>
 * This DTO is intentionally lightweight and contains only the data
 * required by the frontend 3D Earth visualization.
 * </p>
 *
 * <p>
 * The Cartesian coordinates returned by this DTO are Earth-fixed
 * coordinates produced by the backend coordinate-conversion layer.
 * They must not be interpreted as raw TEME coordinates.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualizationObjectResponse {

    /**
     * NORAD catalog identifier of the orbital object.
     *
     * <p>
     * This value is used as the primary frontend identifier for
     * satellites and debris.
     * </p>
     */
    private Long noradId;

    /**
     * Actual display name of the orbital object.
     *
     * <p>
     * For satellites this should come from the satellite database
     * record, and for debris it should come from the debris database
     * record.
     * </p>
     */
    private String name;

    /**
     * Object type.
     *
     * <p>
     * Expected values are:
     * <ul>
     *     <li>SATELLITE</li>
     *     <li>DEBRIS</li>
     * </ul>
     * </p>
     */
    private String objectType;

    /**
     * Geodetic latitude in degrees.
     *
     * <p>
     * Valid range: -90 to +90 degrees.
     * </p>
     */
    private Double latitude;

    /**
     * Geodetic longitude in degrees.
     *
     * <p>
     * Expected range: -180 to +180 degrees.
     * </p>
     */
    private Double longitude;

    /**
     * Geodetic altitude above the WGS84 reference ellipsoid
     * in kilometres.
     */
    private Double altitudeKm;

    /**
     * Earth-fixed Cartesian X coordinate in kilometres.
     *
     * <p>
     * This coordinate will be produced from the propagated TEME
     * position after conversion to the Earth-fixed ITRF frame.
     * </p>
     */
    private Double xKm;

    /**
     * Earth-fixed Cartesian Y coordinate in kilometres.
     *
     * <p>
     * This coordinate will be produced from the propagated TEME
     * position after conversion to the Earth-fixed ITRF frame.
     * </p>
     */
    private Double yKm;

    /**
     * Earth-fixed Cartesian Z coordinate in kilometres.
     *
     * <p>
     * This coordinate will be produced from the propagated TEME
     * position after conversion to the Earth-fixed ITRF frame.
     * </p>
     */
    private Double zKm;

    /**
     * Reference frame of the Cartesian coordinates.
     *
     * <p>
     * For the 3D Earth visualization this should be:
     * {@code ITRF}.
     * </p>
     */
    private String frame;

    /**
     * Timestamp for which the orbital position was propagated.
     *
     * <p>
     * The timestamp represents the UTC propagation time.
     * </p>
     */
    private String timestamp;
}