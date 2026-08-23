package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * ==============================================================
 * Dashboard Trend Response
 * ==============================================================
 *
 * Represents a single day's analytics count.
 *
 * Example:
 *
 * 2026-08-10 -> 5
 * 2026-08-11 -> 8
 * 2026-08-12 -> 3
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
public class DashboardTrendResponse {

    /**
     * Analytics date.
     */
    private LocalDate date;

    /**
     * Number of events/records for the date.
     */
    private long count;
}