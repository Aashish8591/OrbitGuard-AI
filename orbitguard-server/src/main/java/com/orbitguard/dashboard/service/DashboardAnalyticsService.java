package com.orbitguard.dashboard.service;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.dashboard.dto.response.DashboardResponse;

/**
 * ==============================================================
 * Dashboard Analytics Service
 * ==============================================================
 *
 * Defines business operations for retrieving
 * OrbitGuard AI dashboard analytics.
 *
 * The Dashboard module is a read-only analytics layer.
 * It does not create, update, or delete database records.
 *
 * Dashboard analytics are calculated from existing modules:
 *
 * - Satellite
 * - Space Debris
 * - Collision Risk
 * - Alert
 *
 * Business orchestration belongs in
 * DashboardAnalyticsServiceImpl.
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface DashboardAnalyticsService {

    /**
     * --------------------------------------------------------------
     * Get Dashboard Analytics
     * --------------------------------------------------------------
     *
     * Retrieves the complete dashboard analytics including:
     *
     * - Overview KPIs
     * - Satellite analytics
     * - Risk analytics
     * - Alert analytics
     * - Risk trends
     *
     * @param trendDays number of days to include in risk trend data
     * @return complete dashboard analytics
     */
    ApiResponse<DashboardResponse> getDashboard(
            int trendDays
    );

}