package com.orbitguard.dashboard.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.dashboard.dto.response.DashboardResponse;
import com.orbitguard.dashboard.service.DashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * ==============================================================
 * Dashboard Analytics Controller
 * ==============================================================
 *
 * Exposes REST APIs for OrbitGuard AI Dashboard Analytics.
 *
 * The Dashboard module is a read-only analytics layer.
 * It does not create, update, or delete dashboard records.
 *
 * Responsibilities:
 *
 * - Receive dashboard HTTP requests
 * - Accept dashboard query parameters
 * - Delegate requests to DashboardAnalyticsService
 * - Return standardized API responses
 *
 * Business logic must NOT be implemented here.
 * MongoDB access must NOT be implemented here.
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    /**
     * Dashboard analytics service.
     */
    private final DashboardAnalyticsService dashboardAnalyticsService;


    /**
     * ==============================================================
     * Get Dashboard Analytics
     * ==============================================================
     *
     * Retrieves complete OrbitGuard AI dashboard analytics.
     *
     * Includes:
     *
     * - Dashboard overview KPIs
     * - Satellite analytics
     * - Collision risk analytics
     * - Alert analytics
     * - Risk trend analytics
     *
     * Example:
     *
     * GET /api/dashboard?trendDays=7
     *
     * @param trendDays number of days for risk trend analytics
     * @return complete dashboard analytics
     */
    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard(
            @RequestParam(defaultValue = "7") int trendDays
    ) {

        return dashboardAnalyticsService.getDashboard(trendDays);
    }
}