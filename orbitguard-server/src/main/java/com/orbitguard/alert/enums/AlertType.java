package com.orbitguard.alert.enums;

/**
 * ==============================================================
 * Alert Type
 * ==============================================================
 *
 * Represents the business category of an alert.
 *
 * Unlike AlertSeverity (priority), AlertType
 * identifies why the alert was generated.
 *
 * This design allows the Alert Module to support
 * multiple alert categories without changing
 * the database schema or business logic.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public enum AlertType {

    /**
     * Collision risk alert.
     *
     * Generated when a collision risk assessment
     * exceeds the configured threshold.
     */
    COLLISION,

    /**
     * System-generated alert.
     *
     * Used for application or infrastructure events,
     * such as service failures or synchronization issues.
     */
    SYSTEM,

    /**
     * Security-related alert.
     *
     * Used for authentication failures,
     * unauthorized access attempts,
     * or suspicious activities.
     */
    SECURITY,

    /**
     * Mission-related operational alert.
     *
     * Examples:
     * - Satellite communication loss
     * - Orbit deviation
     * - Payload anomaly
     */
    MISSION

}