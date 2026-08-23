package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ==============================================================
 * Dashboard Risk Analytics Response
 * ==============================================================
 *
 * Provides aggregated collision-risk statistics.
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
public class DashboardRiskAnalyticsResponse {

    /**
     * Risk distribution by risk level.
     */
    private List<DashboardCountResponse> byRiskLevel;

    /**
     * Risk distribution by assessment status.
     */
    private List<DashboardCountResponse> byRiskStatus;
}