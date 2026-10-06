package com.orbitguard.visualization.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.visualization.constants.VisualizationApiConstants;
import com.orbitguard.visualization.dto.VisualizationResponse;
import com.orbitguard.visualization.service.VisualizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping(VisualizationApiConstants.BASE_PATH)
@Tag(
        name = "3D Visualization",
        description = "REST APIs for retrieving propagated orbital positions for 3D visualization."
)
public class VisualizationController {

    private final VisualizationService visualizationService;

    /**
     * ================================================================
     * BULK 3D VISUALIZATION
     * ================================================================
     *
     * Retrieves propagated positions of all active satellites and
     * debris objects for rendering on the 3D Earth visualization.
     *
     * This endpoint is intentionally designed as a bulk endpoint so
     * that the frontend does not need to make thousands of individual
     * API requests.
     */
    @Operation(
            summary = "Get All 3D Visualization Objects",
            description = """
                    Retrieves propagated visualization data for all active
                    satellites and space debris objects.

                    The backend reads orbital data from MongoDB, propagates
                    each object using the existing SGP4/Orekit propagation
                    engine, converts the propagated position to an
                    Earth-fixed coordinate system, and returns lightweight
                    visualization data for the 3D Earth scene.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Satellite and debris visualization data retrieved successfully."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid target time."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Unable to generate visualization data."
            )
    })
    @GetMapping("/objects")
    public ApiResponse<VisualizationResponse> getAllVisualizationObjects(
            @RequestParam(required = false)
            LocalDateTime targetTime
    ) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now(ZoneOffset.UTC);

        VisualizationResponse response =
                visualizationService.getAllVisualizationObjects(
                        propagationTime
                );

        return ResponseBuilder.success(
                "Satellite and debris visualization data retrieved successfully.",
                response
        );
    }

    /**
     * ================================================================
     * SINGLE SATELLITE VISUALIZATION
     * ================================================================
     *
     * Retrieves the propagated position of a single satellite.
     *
     * This endpoint is retained for object-specific visualization,
     * selection, inspection, and detail operations.
     */
    @Operation(
            summary = "Get Satellite Visualization Position",
            description = """
                    Retrieves the propagated position of a satellite
                    using its NORAD catalog ID.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Satellite visualization position retrieved successfully."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid NORAD catalog ID or target time."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Satellite orbital data not found."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Unable to propagate satellite orbital data."
            )
    })
    @GetMapping(
            VisualizationApiConstants.SATELLITE_PATH + "/{noradCatalogId}"
    )
    public ApiResponse<VisualizationResponse> getSatelliteVisualization(
            @PathVariable
            @Min(
                    value = 1,
                    message = "NORAD catalog ID must be greater than zero."
            )
            Integer noradCatalogId,

            @RequestParam(required = false)
            LocalDateTime targetTime
    ) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now(ZoneOffset.UTC);

        VisualizationResponse response =
                visualizationService.getSatelliteVisualization(
                        noradCatalogId,
                        propagationTime
                );

        return ResponseBuilder.success(
                VisualizationApiConstants.SATELLITE_POSITION_RETRIEVED,
                response
        );
    }

    /**
     * ================================================================
     * SINGLE DEBRIS VISUALIZATION
     * ================================================================
     *
     * Retrieves the propagated position of a single debris object.
     *
     * This endpoint is retained for object-specific visualization,
     * selection, inspection, and detail operations.
     */
    @Operation(
            summary = "Get Debris Visualization Position",
            description = """
                    Retrieves the propagated position of a space debris
                    object using its NORAD ID.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Debris visualization position retrieved successfully."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid NORAD ID or target time."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Debris orbital data not found."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Unable to propagate debris orbital data."
            )
    })
    @GetMapping(
            VisualizationApiConstants.DEBRIS_PATH + "/{noradId}"
    )
    public ApiResponse<VisualizationResponse> getDebrisVisualization(
            @PathVariable
            @Min(
                    value = 1,
                    message = "NORAD ID must be greater than zero."
            )
            Long noradId,

            @RequestParam(required = false)
            LocalDateTime targetTime
    ) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now(ZoneOffset.UTC);

        VisualizationResponse response =
                visualizationService.getDebrisVisualization(
                        noradId,
                        propagationTime
                );

        return ResponseBuilder.success(
                VisualizationApiConstants.DEBRIS_POSITION_RETRIEVED,
                response
        );
    }
}