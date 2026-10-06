package com.orbitguard.visualization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response containing propagated orbital visualization data.
 *
 * <p>
 * This response supports both:
 * </p>
 *
 * <ul>
 *     <li>Single-object visualization requests.</li>
 *     <li>Bulk satellite and debris visualization requests.</li>
 * </ul>
 *
 * <p>
 * The bulk representation is used by the 3D Earth visualization so
 * that the frontend can retrieve all required orbital objects through
 * a single backend request instead of issuing one request per object.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualizationResponse {

    /**
     * Single propagated visualization object.
     *
     * <p>
     * Used by the existing satellite and debris detail endpoints.
     * </p>
     */
    private VisualizationObjectResponse object;

    /**
     * Collection of propagated visualization objects.
     *
     * <p>
     * Used by the bulk 3D Earth visualization endpoint.
     * The collection can contain both SATELLITE and DEBRIS objects.
     * </p>
     */
    @Builder.Default
    private List<VisualizationObjectResponse> objects = List.of();

    /**
     * UTC timestamp at which the visualization positions were
     * propagated.
     *
     * <p>
     * All objects in a bulk response are propagated for the same
     * target time.
     * </p>
     */
    private String propagatedAt;
}