package com.orbitguard.alert.enums;

/**
 * ==============================================================
 * Alert Status
 * ==============================================================
 *
 * Represents the lifecycle status of an alert.
 *
 * Alert Workflow:
 *
 * PENDING
 *      ↓
 * ACKNOWLEDGED
 *      ↓
 * RESOLVED
 *      ↓
 * CLOSED
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public enum AlertStatus {

    /**
     * Alert has been generated
     * and is waiting for operator action.
     */
    PENDING,

    /**
     * Alert has been reviewed
     * and acknowledged by an operator.
     */
    ACKNOWLEDGED,

    /**
     * The issue causing the alert
     * has been resolved.
     */
    RESOLVED,

    /**
     * Alert lifecycle has been completed.
     *
     * No further action is required.
     */
    CLOSED

}