package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ==============================================================
 * Dashboard Alert Analytics Response
 * ==============================================================
 *
 * Provides aggregated alert statistics.
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
public class DashboardAlertAnalyticsResponse {

    /**
     * Alert distribution by severity.
     */
    private List<DashboardCountResponse> bySeverity;

    /**
     * Alert distribution by status.
     */
    private List<DashboardCountResponse> byStatus;

    /**
     * Alert distribution by type.
     */
    private List<DashboardCountResponse> byType;
}