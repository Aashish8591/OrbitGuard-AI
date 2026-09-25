package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



import java.util.List;

/**
 * ==============================================================
 * Dashboard Response
 * ==============================================================
 *
 * Root response object for OrbitGuard AI Dashboard Analytics.
 *
 * This response combines analytics from existing modules.
 *
 * The Dashboard module does NOT maintain its own database
 * collection.
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    /**
     * High-level dashboard KPIs.
     */
    private DashboardOverviewResponse overview;

    /**
     * Satellite analytics.
     */
    private DashboardSatelliteAnalyticsResponse satelliteAnalytics;

    /**
     * Collision risk analytics.
     */
    private DashboardRiskAnalyticsResponse riskAnalytics;

    /**
     * Alert analytics.
     */
    private DashboardAlertAnalyticsResponse alertAnalytics;

    /**
     * Risk trend analytics.
     */
    private List<DashboardTrendResponse> riskTrends;

    /**
     * Latest orbital intelligence insight.
     */
    private DashboardLatestInsightResponse latestInsight;
}