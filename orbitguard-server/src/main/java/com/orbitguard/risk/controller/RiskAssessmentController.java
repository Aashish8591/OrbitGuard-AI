package com.orbitguard.risk.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.risk.constants.RiskApiConstants;
import com.orbitguard.risk.dto.request.AnalyzeRiskRequest;
import com.orbitguard.risk.dto.response.RiskAssessmentResponse;
import com.orbitguard.risk.service.RiskAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.orbitguard.risk.enums.AssessmentType;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.enums.RiskStatus;
import com.orbitguard.risk.dto.request.UpdateRiskStatusRequest;


import java.time.LocalDateTime;

/**
 * ==============================================================
 * Risk Assessment Controller
 * ==============================================================
 *
 * Exposes REST APIs for collision risk assessment between
 * active satellites and space debris.
 *
 * Responsibilities:
 * • Analyze collision risk
 * • Retrieve risk assessments
 * • Search & Filter
 * • Update risk status
 * • Soft delete risk assessments
 *
 * Author : OrbitGuard AI
 */
@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping(RiskApiConstants.BASE_URL)
@Tag(
        name = "Risk Assessment",
        description = "APIs for managing satellite collision risk assessments."
)
public class RiskAssessmentController {

    private final RiskAssessmentService riskAssessmentService;

    /**
     * --------------------------------------------------------------
     * Analyze Collision Risk
     * --------------------------------------------------------------
     *
     * Calculates:
     * • Closest approach distance
     * • Relative velocity
     * • Collision probability
     * • Risk level
     * • Recommendation
     *
     * Stores the assessment in MongoDB.
     *
     * @param request Analyze Risk Request
     * @return Created Risk Assessment
     */
    @PostMapping(RiskApiConstants.ANALYZE)
    @Operation(
            summary = "Analyze Collision Risk",
            description = "Creates a new collision risk assessment for the selected satellite and space debris."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Risk assessment created successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload.",
                    content = @Content(schema = @Schema())
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Satellite or debris not found."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )

    })
    public ResponseEntity<ApiResponse<RiskAssessmentResponse>> analyzeRisk(

            @Valid
            @RequestBody
            AnalyzeRiskRequest request) {

        ApiResponse<RiskAssessmentResponse> response =
                riskAssessmentService.analyzeRisk(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * ------------------------------------------------------------------
     * Get Risk Assessment By ID
     * ------------------------------------------------------------------
     *
     * Retrieves a single active collision risk assessment using its ID.
     *
     * @param id Risk Assessment ID
     * @return Risk Assessment Details
     */
    @GetMapping(RiskApiConstants.GET_BY_ID)
    @Operation(
            summary = "Get Risk Assessment By ID",
            description = "Retrieve a collision risk assessment using its unique identifier."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Risk assessment retrieved successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid risk ID supplied."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Risk assessment not found."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )

    })
    public ResponseEntity<ApiResponse<RiskAssessmentResponse>> getRiskById(

            @Parameter(
                    description = "Unique Risk Assessment ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id) {

        ApiResponse<RiskAssessmentResponse> response =
                riskAssessmentService.getRiskById(id);

        return ResponseEntity.ok(response);
    }

    /**
     * ------------------------------------------------------------------
     * Get All Risk Assessments
     * ------------------------------------------------------------------
     *
     * Retrieves collision risk assessments with support for:
     *
     * • Pagination
     * • Sorting
     * • Search
     * • Risk Level Filter
     * • Status Filter
     * • Assessment Type Filter
     * • Satellite Filter
     * • Debris Filter
     * • Date Range Filter
     *
     * @return Paged Risk Assessments
     */
    @GetMapping(RiskApiConstants.GET_ALL)
    @Operation(
            summary = "Get All Risk Assessments",
            description = "Retrieve collision risk assessments using pagination, searching, filtering and sorting."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Risk assessments retrieved successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )

    })
    public ResponseEntity<ApiResponse<PagedResponse<RiskAssessmentResponse>>> getAllRisks(

            @Parameter(
                    description = "Search by Risk Code, Recommendation or Remarks"
            )
            @RequestParam(required = false)
            String search,

            @Parameter(description = "Filter by Risk Level")
            @RequestParam(required = false)
            RiskLevel riskLevel,

            @Parameter(description = "Filter by Risk Status")
            @RequestParam(required = false)
            RiskStatus status,

            @Parameter(description = "Filter by Assessment Type")
            @RequestParam(required = false)
            AssessmentType assessmentType,

            @Parameter(description = "Satellite ID")
            @RequestParam(required = false)
            String satelliteId,

            @Parameter(description = "Space Debris ID")
            @RequestParam(required = false)
            String debrisId,

            @Parameter(
                    description = "Assessment Start Date (yyyy-MM-dd'T'HH:mm:ss)"
            )
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fromDate,

            @Parameter(
                    description = "Assessment End Date (yyyy-MM-dd'T'HH:mm:ss)"
            )
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime toDate,

            @Parameter(hidden = true)
            Pageable pageable) {

        ApiResponse<PagedResponse<RiskAssessmentResponse>> response =
                riskAssessmentService.getAllRisks(
                        search,
                        riskLevel,
                        status,
                        assessmentType,
                        satelliteId,
                        debrisId,
                        fromDate,
                        toDate,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    /**
     * ------------------------------------------------------------------
     * Update Risk Status
     * ------------------------------------------------------------------
     *
     * Updates the status and remarks of an existing collision risk
     * assessment.
     *
     * Supported Status:
     * • PENDING
     * • ANALYZED
     * • MITIGATED
     * • CLOSED
     *
     * @param id Risk Assessment ID
     * @param request Update Risk Status Request
     * @return Updated Risk Assessment
     */
    @PatchMapping(RiskApiConstants.UPDATE_STATUS)
    @Operation(
            summary = "Update Risk Status",
            description = "Updates the status and remarks of an existing collision risk assessment."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Risk status updated successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Risk assessment not found."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )

    })
    public ResponseEntity<ApiResponse<RiskAssessmentResponse>> updateRiskStatus(

            @Parameter(
                    description = "Risk Assessment ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id,

            @Valid
            @RequestBody
            UpdateRiskStatusRequest request) {

        ApiResponse<RiskAssessmentResponse> response =
                riskAssessmentService.updateRiskStatus(id, request);

        return ResponseEntity.ok(response);
    }

    /**
     * ------------------------------------------------------------------
     * Delete Risk Assessment
     * ------------------------------------------------------------------
     *
     * Performs a soft delete by marking the assessment as inactive.
     *
     * The record remains available in the database for auditing
     * purposes.
     *
     * @param id Risk Assessment ID
     * @return Success Response
     */
    @DeleteMapping(RiskApiConstants.DELETE)
    @Operation(
            summary = "Delete Risk Assessment",
            description = "Soft deletes an existing collision risk assessment."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Risk assessment deleted successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid risk assessment ID."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Risk assessment not found."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )

    })
    public ResponseEntity<ApiResponse<Void>> deleteRisk(

            @Parameter(
                    description = "Risk Assessment ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id) {

        ApiResponse<Void> response =
                riskAssessmentService.deleteRisk(id);

        return ResponseEntity.ok(response);
    }

}