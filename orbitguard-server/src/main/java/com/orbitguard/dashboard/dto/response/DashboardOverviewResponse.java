package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ==============================================================
 * Dashboard Overview Response
 * ==============================================================
 *
 * Represents high-level KPI statistics displayed
 * on the OrbitGuard AI dashboard.
 *
 * This DTO does not represent a database document.
 *
 * Data is calculated from existing modules:
 *
 * - Satellite
 * - Space Debris
 * - Collision Risk
 * - Alert
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
public class DashboardOverviewResponse {

    /**
     * Total active satellites.
     */
    private long totalSatellites;

    /**
     * Total active space debris objects.
     */
    private long totalDebris;

    /**
     * Total active collision risk assessments.
     */
    private long totalRisks;

    /**
     * Number of HIGH risk assessments.
     */
    private long highRisks;

    /**
     * Number of CRITICAL risk assessments.
     */
    private long criticalRisks;

    /**
     * Total active alerts.
     */
    private long totalAlerts;

    /**
     * Number of alerts waiting for operator action.
     */
    private long pendingAlerts;
}