package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ==============================================================
 * Dashboard Satellite Analytics Response
 * ==============================================================
 *
 * Provides aggregated satellite statistics for
 * dashboard visualization.
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
public class DashboardSatelliteAnalyticsResponse {

    /**
     * Satellite distribution by orbit type.
     */
    private List<DashboardCountResponse> byOrbitType;

    /**
     * Satellite distribution by mission status.
     */
    private List<DashboardCountResponse> byMissionStatus;
}