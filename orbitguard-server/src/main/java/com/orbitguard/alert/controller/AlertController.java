package com.orbitguard.alert.controller;

import com.orbitguard.alert.constants.AlertApiConstants;
import com.orbitguard.alert.dto.request.AlertSearchRequest;
import com.orbitguard.alert.dto.request.CreateAlertRequest;
import com.orbitguard.alert.dto.request.UpdateAlertStatusRequest;
import com.orbitguard.alert.dto.response.AlertResponse;
import com.orbitguard.alert.service.AlertService;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

/**
 * ==============================================================
 * Alert Controller
 * ==============================================================
 *
 * REST APIs for Alert Management.
 *
 * Responsibilities:
 * • Create Alert
 * • Get Alert By ID
 * • Search Alerts
 * • Update Alert Status
 * • Delete Alert
 *
 * This controller delegates all business logic
 * to AlertService.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(AlertApiConstants.BASE_URL)
@Tag(
        name = "Alert Management",
        description = "APIs for managing OrbitGuard AI alerts."
)
public class AlertController {

    /**
     * Alert Service.
     */
    private final AlertService alertService;

    /**
     * ----------------------------------------------------------
     * Create Alert
     * ----------------------------------------------------------
     *
     * Creates a new Alert for a Collision Risk.
     *
     * @param request Create Alert Request
     * @return Created Alert
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AlertResponse>> createAlert(
            @Valid
            @RequestBody
            CreateAlertRequest request
    ) {

        ApiResponse<AlertResponse> response =
                alertService.createAlert(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * ----------------------------------------------------------
     * Get Alert By ID
     * ----------------------------------------------------------
     *
     * Retrieves an Alert using its unique ID.
     *
     * @param id Alert ID
     * @return Alert Details
     */
    @Operation(
            summary = "Get Alert By ID",
            description = "Retrieves an active Alert using its unique ID."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Alert retrieved successfully."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Alert not found."
            )
    })
    @GetMapping(AlertApiConstants.GET_BY_ID)
    public ResponseEntity<ApiResponse<AlertResponse>> getAlertById(

            @Parameter(
                    description = "Unique Alert ID",
                    required = true
            )
            @PathVariable
            String id
    ) {

        ApiResponse<AlertResponse> response =
                alertService.getAlertById(id);

        return ResponseEntity.ok(response);
    }

    /**
     * ----------------------------------------------------------
     * Get All Alerts
     * ----------------------------------------------------------
     *
     * Retrieves Alerts using dynamic filters,
     * pagination and sorting.
     *
     * @param request Search Request
     * @param pageable Pagination Information
     * @return Paged Alert Response
     */
    @Operation(
            summary = "Get All Alerts",
            description = "Retrieves alerts using search filters, pagination and sorting."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Alerts retrieved successfully."
            )
    })
    @GetMapping(AlertApiConstants.GET_ALL)
    public ResponseEntity<ApiResponse<PagedResponse<AlertResponse>>> getAllAlerts(

            @ParameterObject
            AlertSearchRequest request,

            @ParameterObject
            @PageableDefault(
                    page = 0,
                    size = 10
            )
            Pageable pageable
    ) {

        ApiResponse<PagedResponse<AlertResponse>> response =
                alertService.getAllAlerts(
                        request,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    /**
     * ----------------------------------------------------------
     * Update Alert Status
     * ----------------------------------------------------------
     *
     * Updates the workflow status of an existing Alert.
     *
     * @param id Alert ID
     * @param request Update Alert Status Request
     * @return Updated Alert Response
     */
    @Operation(
            summary = "Update Alert Status",
            description = "Updates the status of an existing Alert."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Alert status updated successfully."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid status transition."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Alert not found."
            )
    })
    @PutMapping(AlertApiConstants.UPDATE_STATUS)
    public ResponseEntity<ApiResponse<AlertResponse>> updateAlertStatus(

            @Parameter(
                    description = "Unique Alert ID",
                    required = true
            )
            @PathVariable
            String id,

            @Valid
            @RequestBody
            UpdateAlertStatusRequest request
    ) {

        ApiResponse<AlertResponse> response =
                alertService.updateAlertStatus(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /**
     * ----------------------------------------------------------
     * Delete Alert
     * ----------------------------------------------------------
     *
     * Performs a soft delete on an existing Alert.
     *
     * @param id Alert ID
     * @return Success Response
     */
    @Operation(
            summary = "Delete Alert",
            description = "Performs a soft delete on an existing Alert."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Alert deleted successfully."
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Alert not found."
            )
    })
    @DeleteMapping(AlertApiConstants.DELETE)
    public ResponseEntity<ApiResponse<Void>> deleteAlert(

            @Parameter(
                    description = "Unique Alert ID",
                    required = true
            )
            @PathVariable
            String id
    ) {

        ApiResponse<Void> response =
                alertService.deleteAlert(id);

        return ResponseEntity.ok(response);
    }

}