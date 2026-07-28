package com.orbitguard.satellite.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.satellite.dto.request.CreateSatelliteRequest;
import com.orbitguard.satellite.dto.request.UpdateSatelliteRequest;
import com.orbitguard.satellite.dto.response.SatelliteResponse;
import com.orbitguard.satellite.service.SatelliteService;
import com.orbitguard.common.response.PagedResponse;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
        name = "Satellite API",
        description = "Operations related to satellite management"
)

@Validated
@RestController
@RequestMapping("/api/satellites")
@RequiredArgsConstructor
public class SatelliteController {

    private final SatelliteService satelliteService;

    /**
     * Create Satellite
     */
    @Operation(summary = "Create a new satellite")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Satellite created successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid satellite request"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Satellite code already exists"
            )
    })
    @PostMapping
    public ResponseEntity<ApiResponse<SatelliteResponse>> createSatellite(
            @Valid @RequestBody CreateSatelliteRequest request) {

        SatelliteResponse satellite =
                satelliteService.createSatellite(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseBuilder.success(
                        "Satellite created successfully.",
                        satellite
                ));
    }

    /**
     * Get All Satellites with Pagination, Sorting and Searching
     */
    @Operation(summary = "Retrieve satellites with pagination, sorting and searching")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Satellites retrieved successfully"
            )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SatelliteResponse>>> getAllSatellites(

            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "Page number cannot be negative.")
            int page,

            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "Page size must be at least 1.")
            @Max(value = 100, message = "Page size cannot exceed 100.")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction,

            @RequestParam(required = false)
            String keyword
    ) {

        PagedResponse<SatelliteResponse> satellites =
                satelliteService.getAllSatellites(
                        page,
                        size,
                        sortBy,
                        direction,
                        keyword
                );

        return ResponseEntity.ok(
                ResponseBuilder.success(
                        "Satellites retrieved successfully.",
                        satellites
                )
        );
    }

    /**
     * Get Satellite By Id
     */
    @Operation(summary = "Retrieve satellite by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Satellite retrieved successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Satellite not found"
            )
    })
    @GetMapping("/{satelliteId}")
    public ResponseEntity<ApiResponse<SatelliteResponse>> getSatelliteById(
            @PathVariable String satelliteId) {

        SatelliteResponse satellite =
                satelliteService.getSatelliteById(satelliteId);

        return ResponseEntity.ok(
                ResponseBuilder.success(
                        "Satellite retrieved successfully.",
                        satellite
                )
        );
    }

    /**
     * Update Satellite
     */
    @Operation(summary = "Update satellite")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Satellite updated successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Satellite not found"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request"
            )
    })
    @PutMapping("/{satelliteId}")
    public ResponseEntity<ApiResponse<SatelliteResponse>> updateSatellite(
            @PathVariable String satelliteId,
            @Valid @RequestBody UpdateSatelliteRequest request) {

        SatelliteResponse satellite =
                satelliteService.updateSatellite(
                        satelliteId,
                        request
                );

        return ResponseEntity.ok(
                ResponseBuilder.success(
                        "Satellite updated successfully.",
                        satellite
                )
        );
    }

    /**
     * Soft Delete Satellite
     */
    @Operation(summary = "Soft delete satellite")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Satellite deleted successfully"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Satellite not found"
            )
    })
    @DeleteMapping("/{satelliteId}")
    public ResponseEntity<ApiResponse<Void>> deleteSatellite(
            @PathVariable String satelliteId) {

        satelliteService.deleteSatellite(satelliteId);

        return ResponseEntity.ok(
                ResponseBuilder.success(
                        "Satellite deleted successfully."
                )
        );
    }

}