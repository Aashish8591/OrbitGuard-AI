package com.orbitguard.visualization.service;

import com.orbitguard.visualization.dto.VisualizationResponse;

import java.time.LocalDateTime;

/**
 * Service contract for 3D orbital visualization.
 *
 * <p>This service provides propagated visualization data for
 * satellites and space debris using the existing orbital
 * propagation infrastructure.</p>
 */
public interface VisualizationService {

    /**
     * Retrieves the propagated visualization position of a satellite.
     *
     * @param noradCatalogId NORAD catalog ID of the satellite
     * @param targetTime      time for which the orbital position is required
     * @return visualization response containing the propagated position
     */
    VisualizationResponse getSatelliteVisualization(
            Integer noradCatalogId,
            LocalDateTime targetTime
    );

    /**
     * Retrieves the propagated visualization position of a debris object.
     *
     * @param noradId    NORAD ID of the debris object
     * @param targetTime time for which the orbital position is required
     * @return visualization response containing the propagated position
     */
    VisualizationResponse getDebrisVisualization(
            Long noradId,
            LocalDateTime targetTime
    );
}