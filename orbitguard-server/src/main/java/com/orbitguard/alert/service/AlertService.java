package com.orbitguard.alert.service;

import com.orbitguard.alert.dto.request.AlertSearchRequest;
import com.orbitguard.alert.dto.request.CreateAlertRequest;
import com.orbitguard.alert.dto.request.UpdateAlertStatusRequest;
import com.orbitguard.alert.dto.response.AlertResponse;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * ==============================================================
 * Alert Service
 * ==============================================================
 *
 * Defines business operations for managing
 * Alert records.
 *
 * Implementations of this interface should
 * contain all Alert business logic.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface AlertService {

    /**
     * --------------------------------------------------------------
     * Create Alert
     * --------------------------------------------------------------
     *
     * Creates a new alert.
     *
     * @param request Create Alert Request
     * @return Created Alert
     */
    ApiResponse<AlertResponse> createAlert(
            CreateAlertRequest request
    );

    /**
     * --------------------------------------------------------------
     * Get Alert By ID
     * --------------------------------------------------------------
     *
     * Returns an active alert using its ID.
     *
     * @param id Alert ID
     * @return Alert Details
     */
    ApiResponse<AlertResponse> getAlertById(
            String id
    );

    /**
     * --------------------------------------------------------------
     * Get All Alerts
     * --------------------------------------------------------------
     *
     * Returns alerts using:
     *
     * • Pagination
     * • Sorting
     * • Searching
     * • Dynamic Filters
     *
     * @param searchRequest Alert Search Request
     * @param pageable Pagination Information
     * @return Paged Alert Response
     */
    ApiResponse<PagedResponse<AlertResponse>> getAllAlerts(
            AlertSearchRequest searchRequest,
            Pageable pageable
    );

    /**
     * --------------------------------------------------------------
     * Update Alert Status
     * --------------------------------------------------------------
     *
     * Updates the workflow status
     * of an existing alert.
     *
     * @param id Alert ID
     * @param request Update Alert Status Request
     * @return Updated Alert
     */
    ApiResponse<AlertResponse> updateAlertStatus(
            String id,
            UpdateAlertStatusRequest request
    );

    /**
     * --------------------------------------------------------------
     * Delete Alert
     * --------------------------------------------------------------
     *
     * Performs a soft delete.
     *
     * @param id Alert ID
     * @return Success Response
     */
    ApiResponse<Void> deleteAlert(
            String id
    );

}