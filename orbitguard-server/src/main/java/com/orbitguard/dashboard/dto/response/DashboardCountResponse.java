package com.orbitguard.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ==============================================================
 * Dashboard Count Response
 * ==============================================================
 *
 * Generic label-count pair used by Dashboard Analytics.
 *
 * Examples:
 *
 * LEO      -> 25
 * GEO      -> 10
 *
 * HIGH     -> 8
 * CRITICAL -> 3
 *
 * COLLISION -> 15
 * SYSTEM    -> 5
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
public class DashboardCountResponse {

    /**
     * Category label.
     */
    private String label;

    /**
     * Number of records in that category.
     */
    private long count;
}