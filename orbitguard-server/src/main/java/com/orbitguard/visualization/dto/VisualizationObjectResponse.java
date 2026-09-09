package com.orbitguard.visualization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the visualization data of a single orbital object.
 *
 * <p>The response contains the object's identity, type, propagated
 * position, and propagation timestamp required by the frontend
 * 3D visualization.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualizationObjectResponse {

    /**
     * Unique identifier of the orbital object.
     */
    private Long noradId;

    /**
     * Display name of the orbital object.
     */
    private String name;

    /**
     * Object type: SATELLITE or DEBRIS.
     */
    private String objectType;

    /**
     * Latitude in degrees.
     */
    private Double latitude;

    /**
     * Longitude in degrees.
     */
    private Double longitude;

    /**
     * Altitude above Earth's surface in kilometres.
     */
    private Double altitudeKm;

    /**
     * Timestamp for which the orbital position was propagated.
     */
    private String timestamp;
}