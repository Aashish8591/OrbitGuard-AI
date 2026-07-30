package com.orbitguard.risk.service;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.risk.dto.request.AnalyzeRiskRequest;
import com.orbitguard.risk.dto.request.UpdateRiskStatusRequest;
import com.orbitguard.risk.dto.response.RiskAssessmentResponse;
import com.orbitguard.risk.enums.AssessmentType;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.enums.RiskStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface RiskAssessmentService {

    /**
     * Analyze collision risk between
     * a satellite and space debris.
     *
     * @param request analyze risk request
     * @return created risk assessment
     */
    ApiResponse<RiskAssessmentResponse> analyzeRisk(
            AnalyzeRiskRequest request
    );

    /**
     * Get risk assessment by ID.
     *
     * @param id risk assessment ID
     * @return risk assessment
     */
    ApiResponse<RiskAssessmentResponse> getRiskById(
            String id
    );

    /**
     * Get all risk assessments
     * with search, filtering,
     * pagination and sorting.
     *
     * @param search search keyword
     * @param riskLevel risk level filter
     * @param status status filter
     * @param assessmentType assessment type filter
     * @param satelliteId satellite ID filter
     * @param debrisId debris ID filter
     * @param fromDate assessment start date
     * @param toDate assessment end date
     * @param pageable pagination
     * @return paged risk assessments
     */
    ApiResponse<PagedResponse<RiskAssessmentResponse>> getAllRisks(
            String search,
            RiskLevel riskLevel,
            RiskStatus status,
            AssessmentType assessmentType,
            String satelliteId,
            String debrisId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    );

    /**
     * Update only risk status
     * and remarks.
     *
     * @param id risk assessment ID
     * @param request update request
     * @return updated assessment
     */
    ApiResponse<RiskAssessmentResponse> updateRiskStatus(
            String id,
            UpdateRiskStatusRequest request
    );

    /**
     * Soft delete risk assessment.
     *
     * @param id risk assessment ID
     * @return success response
     */
    ApiResponse<Void> deleteRisk(
            String id
    );

}