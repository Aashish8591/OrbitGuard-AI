package com.orbitguard.visualization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned by the 3D visualization APIs.
 *
 * <p>This class wraps the visualization data of a single orbital
 * object along with the requested propagation timestamp.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualizationResponse {

    /**
     * Visualization data of the orbital object.
     */
    private VisualizationObjectResponse object;

    /**
     * Timestamp for which the orbital position was calculated.
     */
    private String propagatedAt;
}