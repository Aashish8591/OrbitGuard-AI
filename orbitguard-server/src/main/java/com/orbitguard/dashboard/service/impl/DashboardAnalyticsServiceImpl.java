package com.orbitguard.dashboard.service.impl;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.dashboard.constants.DashboardApiConstants;
import com.orbitguard.dashboard.dto.response.*;
import com.orbitguard.dashboard.repository.DashboardAnalyticsRepository;
import com.orbitguard.dashboard.service.DashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * ==============================================================
 * Dashboard Analytics Service Implementation
 * ==============================================================
 *
 * Provides business orchestration for OrbitGuard AI
 * Dashboard Analytics.
 *
 * The Dashboard module is a read-only analytics layer.
 * It does not maintain its own database collection.
 *
 * This service coordinates analytics retrieved from
 * existing application modules:
 *
 * - Satellite
 * - Space Debris
 * - Collision Risk
 * - Alert
 *
 * Repository responsibilities:
 * - MongoDB queries
 * - MongoDB aggregation
 * - Data retrieval
 *
 * Service responsibilities:
 * - Business validation
 * - Date-range calculation
 * - Analytics orchestration
 * - Dashboard response construction
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardAnalyticsServiceImpl
        implements DashboardAnalyticsService {

    private final DashboardAnalyticsRepository dashboardAnalyticsRepository;


    /**
     * ==============================================================
     * Get Dashboard Analytics
     * ==============================================================
     *
     * Retrieves all dashboard analytics and combines them
     * into a single dashboard response.
     *
     * The requested trend period is converted into a
     * concrete date range before being passed to the repository.
     *
     * @param trendDays number of days to include in risk trends
     * @return complete dashboard analytics response
     */
    @Override
    public ApiResponse<DashboardResponse> getDashboard(
            int trendDays
    ) {

        validateTrendDays(trendDays);

        /*
         * ----------------------------------------------------------
         * Calculate Risk Trend Date Range
         * ----------------------------------------------------------
         *
         * Example:
         *
         * trendDays = 7
         * today     = 2026-08-20
         *
         * fromDate  = 2026-08-14
         * toDate    = 2026-08-20
         *
         * This gives exactly 7 calendar days.
         */
        LocalDate toDate = LocalDate.now();

        LocalDate fromDate =
                toDate.minusDays(trendDays - 1L);


        /*
         * ----------------------------------------------------------
         * Retrieve Dashboard Analytics
         * ----------------------------------------------------------
         *
         * The repository already exposes high-level analytics
         * methods, so the service must use those methods directly.
         */
        DashboardOverviewResponse overview =
                dashboardAnalyticsRepository.getOverview();

        DashboardSatelliteAnalyticsResponse satelliteAnalytics =
                dashboardAnalyticsRepository.getSatelliteAnalytics();

        DashboardRiskAnalyticsResponse riskAnalytics =
                dashboardAnalyticsRepository.getRiskAnalytics();

        DashboardAlertAnalyticsResponse alertAnalytics =
                dashboardAnalyticsRepository.getAlertAnalytics();

        List<DashboardTrendResponse> riskTrends =
                dashboardAnalyticsRepository.getRiskTrends(
                        fromDate,
                        toDate
                );

        DashboardLatestInsightResponse latestInsight =
                dashboardAnalyticsRepository.getLatestInsight();


        /*
         * ----------------------------------------------------------
         * Build Complete Dashboard Response
         * ----------------------------------------------------------
         */
        DashboardResponse dashboardResponse =
                DashboardResponse.builder()
                        .overview(overview)
                        .satelliteAnalytics(satelliteAnalytics)
                        .riskAnalytics(riskAnalytics)
                        .alertAnalytics(alertAnalytics)
                        .riskTrends(riskTrends)
                        .latestInsight(latestInsight)
                        .build();


        /*
         * ----------------------------------------------------------
         * Return Standard API Response
         * ----------------------------------------------------------
         */
        return ResponseBuilder.success(
                DashboardApiConstants.DASHBOARD_RETRIEVED,
                dashboardResponse
        );
    }


    /**
     * ==============================================================
     * Validate Trend Days
     * ==============================================================
     *
     * Validates the requested dashboard trend period
     * using centralized Dashboard API constants.
     *
     * Validation is intentionally kept here until the
     * DashboardValidator utility is implemented.
     *
     * @param trendDays requested trend period
     * @throws IllegalArgumentException when trendDays is invalid
     */
    private void validateTrendDays(int trendDays) {

        if (!DashboardApiConstants.isValidTrendDays(trendDays)) {

            throw new IllegalArgumentException(
                    DashboardApiConstants.INVALID_TREND_DAYS
            );
        }
    }
}