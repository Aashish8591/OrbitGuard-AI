package com.orbitguard.dashboard.repository;

import com.orbitguard.dashboard.dto.response.*;

import java.time.LocalDate;
import java.util.List;

/**
 * ==============================================================
 * Dashboard Analytics Repository
 * ==============================================================
 *
 * Defines read-only data access operations required by
 * the Dashboard Analytics module.
 *
 * The Dashboard module does NOT maintain its own MongoDB
 * collection.
 *
 * Instead, this repository reads and aggregates data from
 * existing module collections:
 *
 * - satellites
 * - space_debris
 * - collision_risks
 * - alerts
 *
 * MongoDB-specific implementation details are handled by
 * DashboardAnalyticsRepositoryImpl.
 *
 * Responsibilities:
 *
 * - Dashboard KPI aggregation
 * - Satellite analytics
 * - Collision risk analytics
 * - Alert analytics
 * - Risk trend analytics
 *
 * Business orchestration must NOT be implemented here.
 * It belongs in DashboardAnalyticsServiceImpl.
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface DashboardAnalyticsRepository {

    /**
     * --------------------------------------------------------------
     * Dashboard Overview
     * --------------------------------------------------------------
     *
     * Retrieves high-level dashboard KPI statistics.
     *
     * @return dashboard overview analytics
     */
    DashboardOverviewResponse getOverview();


    /**
     * --------------------------------------------------------------
     * Satellite Analytics
     * --------------------------------------------------------------
     *
     * Retrieves satellite distribution analytics.
     *
     * Includes:
     *
     * - Distribution by orbit type
     * - Distribution by mission status
     *
     * @return satellite analytics
     */
    DashboardSatelliteAnalyticsResponse getSatelliteAnalytics();


    /**
     * --------------------------------------------------------------
     * Risk Analytics
     * --------------------------------------------------------------
     *
     * Retrieves collision-risk distribution analytics.
     *
     * Includes:
     *
     * - Distribution by risk level
     * - Distribution by risk status
     *
     * @return risk analytics
     */
    DashboardRiskAnalyticsResponse getRiskAnalytics();


    /**
     * --------------------------------------------------------------
     * Alert Analytics
     * --------------------------------------------------------------
     *
     * Retrieves alert distribution analytics.
     *
     * Includes:
     *
     * - Distribution by severity
     * - Distribution by status
     * - Distribution by type
     *
     * @return alert analytics
     */
    DashboardAlertAnalyticsResponse getAlertAnalytics();


    /**
     * --------------------------------------------------------------
     * Risk Trend Analytics
     * --------------------------------------------------------------
     *
     * Retrieves daily collision-risk assessment counts
     * for the requested date range.
     *
     * @param fromDate start date
     * @param toDate end date
     * @return daily risk trend analytics
     */
    List<DashboardTrendResponse> getRiskTrends(
            LocalDate fromDate,
            LocalDate toDate
    );

    /**
     * --------------------------------------------------------------
     * Latest Orbital Intelligence Insight
     * --------------------------------------------------------------
     *
     * Retrieves the most recently assessed active
     * collision-risk record.
     *
     * @return latest dashboard intelligence insight,
     *         or null when no active risk assessment exists
     */
    DashboardLatestInsightResponse getLatestInsight();
}