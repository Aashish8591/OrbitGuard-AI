package com.orbitguard.alert.constants;

/**
 * ==============================================================
 * Alert API Constants
 * ==============================================================
 *
 * Contains all REST API endpoint constants used by the
 * Alert Module.
 *
 * Keeping API paths in one place improves:
 * • Maintainability
 * • Readability
 * • Consistency across controllers
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public final class AlertApiConstants {

    /**
     * Prevent instantiation.
     */
    private AlertApiConstants() {
        throw new IllegalStateException(
                "Utility class cannot be instantiated."
        );
    }

    /**
     * Base URL for Alert APIs.
     */
    public static final String BASE_URL = "/api/v1/alerts";

    /**
     * Create Alert.
     */
    public static final String CREATE = "";

    /**
     * Get Alert By ID.
     */
    public static final String GET_BY_ID = "/{id}";

    /**
     * Get All Alerts.
     */
    public static final String GET_ALL = "";

    /**
     * Update Alert Status.
     */
    public static final String UPDATE_STATUS = "/{id}/status";

    /**
     * Soft Delete Alert.
     */
    public static final String DELETE = "/{id}";
}