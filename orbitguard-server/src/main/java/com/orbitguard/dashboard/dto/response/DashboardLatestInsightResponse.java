package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ==============================================================
 * Dashboard Latest Insight Response
 * ==============================================================
 *
 * Represents the latest orbital intelligence insight
 * available to the Dashboard.
 *
 * The insight is derived from existing dashboard data.
 *
 * The Dashboard module does not maintain a separate
 * MongoDB collection for insights.
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
public class DashboardLatestInsightResponse {

    /**
     * Insight category.
     *
     * Example:
     * RISK_ASSESSMENT
     */
    private String type;

    /**
     * Human-readable insight title.
     */
    private String title;

    /**
     * Human-readable insight message.
     */
    private String message;

    /**
     * Risk level associated with the insight.
     *
     * Example:
     * LOW
     * MEDIUM
     * HIGH
     * CRITICAL
     */
    private String riskLevel;

    /**
     * Current assessment status.
     *
     * Example:
     * PENDING
     * ANALYZED
     */
    private String status;

    /**
     * Time when the underlying risk assessment
     * was performed.
     */
    private LocalDateTime assessedAt;
}