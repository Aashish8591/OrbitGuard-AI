package com.orbitguard.alert.enums;

/**
 * ==============================================================
 * Alert Severity
 * ==============================================================
 *
 * Represents the priority level of an alert.
 *
 * Alert severity indicates how urgently
 * mission operators should respond.
 *
 * Severity Order:
 *
 * LOW
 *      ↓
 * MEDIUM
 *      ↓
 * HIGH
 *      ↓
 * CRITICAL
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public enum AlertSeverity {

    /**
     * Informational alert.
     *
     * No immediate action required.
     */
    LOW,

    /**
     * Warning alert.
     *
     * Should be reviewed by operators.
     */
    MEDIUM,

    /**
     * High priority alert.
     *
     * Requires prompt attention.
     */
    HIGH,

    /**
     * Mission critical alert.
     *
     * Immediate action is required to
     * avoid potential mission impact.
     */
    CRITICAL

}