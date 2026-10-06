package com.orbitguard.visualization.service;

import com.orbitguard.visualization.dto.VisualizationResponse;

import java.time.LocalDateTime;

/**
 * Service contract for 3D orbital visualization.
 *
 * <p>
 * This service provides propagated visualization data for individual
 * satellites, individual space debris objects, and the complete set
 * of active orbital objects required by the 3D Earth visualization.
 * </p>
 *
 * <p>
 * The service delegates orbital propagation to the existing
 * propagation infrastructure and does not expose CelesTrak-specific
 * implementation details to the controller layer.
 * </p>
 */
public interface VisualizationService {

    /**
     * Retrieves the propagated visualization position of a satellite.
     *
     * @param noradCatalogId NORAD catalog ID of the satellite
     * @param targetTime     UTC time for which the orbital position is required
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
     * @param targetTime UTC time for which the orbital position is required
     * @return visualization response containing the propagated position
     */
    VisualizationResponse getDebrisVisualization(
            Long noradId,
            LocalDateTime targetTime
    );

    /**
     * Retrieves propagated visualization data for all active satellites
     * and space debris objects.
     *
     * <p>
     * This method is the bulk entry point used by the 3D Earth
     * visualization. The implementation must process the orbital
     * objects from the existing backend data source and use the
     * existing SGP4/Orekit propagation infrastructure.
     * </p>
     *
     * <p>
     * The method must return lightweight visualization data rather than
     * complete satellite or debris database entities. This keeps the
     * response suitable for rendering a large orbital dataset in
     * the frontend.
     * </p>
     *
     * @param targetTime UTC time for which all orbital positions are required
     * @return visualization response containing propagated satellite
     *         and debris objects
     */
    VisualizationResponse getAllVisualizationObjects(
            LocalDateTime targetTime
    );
}