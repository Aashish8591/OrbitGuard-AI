package com.orbitguard.dashboard.constants;

/**
 * ==============================================================
 * Dashboard Constants
 * ==============================================================
 *
 * Centralized constants used by the Dashboard Analytics module.
 *
 * The Dashboard module is a read-only analytics layer.
 * It does not maintain its own MongoDB collection.
 *
 * Dashboard data is calculated from existing modules such as:
 *
 * - Satellite
 * - Space Debris
 * - Collision Risk
 * - Alert
 * - Notification
 *
 * Keeping constants here prevents:
 *
 * - Hard-coded collection names
 * - Hard-coded API messages
 * - Repeated default values
 * - Magic numbers
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public final class DashboardApiConstants {

    /**
     * Private constructor prevents object creation.
     */
    private DashboardApiConstants() {
        throw new IllegalStateException(
                "DashboardConstants class must not be instantiated."
        );
    }

    /*
     * ==============================================================
     * Default Values
     * ==============================================================
     */

    /**
     * Default number of days used when calculating
     * dashboard trend analytics.
     */
    public static final int DEFAULT_TREND_DAYS = 7;

    /**
     * Minimum allowed trend period.
     */
    public static final int MIN_TREND_DAYS = 1;

    /**
     * Maximum allowed trend period.
     */
    public static final int MAX_TREND_DAYS = 365;


    /*
     * ==============================================================
     * Module Names
     * ==============================================================
     */

    /**
     * Satellite module identifier.
     */
    public static final String MODULE_SATELLITE = "SATELLITE";

    /**
     * Space Debris module identifier.
     */
    public static final String MODULE_DEBRIS = "DEBRIS";

    /**
     * Collision Risk module identifier.
     */
    public static final String MODULE_RISK = "RISK";

    /**
     * Alert module identifier.
     */
    public static final String MODULE_ALERT = "ALERT";

    /**
     * Notification module identifier.
     */
    public static final String MODULE_NOTIFICATION = "NOTIFICATION";


    /*
     * ==============================================================
     * MongoDB Collection Names
     * ==============================================================
     *
     * These values match the existing entity definitions.
     */

    /**
     * Satellite collection.
     */
    public static final String SATELLITES_COLLECTION = "satellites";

    /**
     * Space debris collection.
     */
    public static final String SPACE_DEBRIS_COLLECTION = "space_debris";

    /**
     * Collision risk collection.
     */
    public static final String COLLISION_RISKS_COLLECTION = "collision_risks";

    /**
     * Alert collection.
     */
    public static final String ALERTS_COLLECTION = "alerts";

    /**
     * Notification collection.
     */
    public static final String NOTIFICATIONS_COLLECTION = "notifications";


    /*
     * ==============================================================
     * API Messages
     * ==============================================================
     */

    /**
     * Successful dashboard retrieval message.
     */
    public static final String DASHBOARD_RETRIEVED =
            "Dashboard analytics retrieved successfully.";

    /**
     * Invalid trend period message.
     */
    public static final String INVALID_TREND_DAYS =
            "Trend days must be between "
                    + MIN_TREND_DAYS
                    + " and "
                    + MAX_TREND_DAYS
                    + ".";


    /*
     * ==============================================================
     * Field Names
     * ==============================================================
     *
     * These names will be used later for MongoDB aggregation.
     */

    /**
     * Active flag used by Satellite entity.
     */
    public static final String FIELD_ACTIVE = "active";

    /**
     * Active flag used by Debris, Risk and Alert entities.
     */
    public static final String FIELD_IS_ACTIVE = "isActive";

    /**
     * Satellite mission status field.
     */
    public static final String FIELD_MISSION_STATUS = "missionStatus";

    /**
     * Satellite orbit type field.
     */
    public static final String FIELD_ORBIT_TYPE = "orbitType";

    /**
     * Risk level field.
     */
    public static final String FIELD_RISK_LEVEL = "riskLevel";

    /**
     * Risk status field.
     */
    public static final String FIELD_RISK_STATUS = "status";

    /**
     * Alert severity field.
     */
    public static final String FIELD_ALERT_SEVERITY = "severity";

    /**
     * Alert status field.
     */
    public static final String FIELD_ALERT_STATUS = "status";

    /**
     * Alert type field.
     */
    public static final String FIELD_ALERT_TYPE = "type";

    /**
     * Creation timestamp field.
     */
    public static final String FIELD_CREATED_AT = "createdAt";

    /**
     * Assessment timestamp field.
     */
    public static final String FIELD_ASSESSED_AT = "assessedAt";

    /**
     * Alert generation timestamp field.
     */
    public static final String FIELD_GENERATED_AT = "generatedAt";


    /*
     * ==============================================================
     * Dashboard Validation
     * ==============================================================
     */

    /**
     * Validates whether the requested trend period is supported.
     *
     * @param days requested number of days
     * @return true when the value is valid
     */
    public static boolean isValidTrendDays(int days) {

        return days >= MIN_TREND_DAYS
                && days <= MAX_TREND_DAYS;
    }
}