package com.orbitguard.notification.enums;

/**
 * ===============================================================
 * Notification Action
 * ===============================================================
 *
 * Represents an action requested by the client on a notification.
 *
 * This enum is intentionally separated from NotificationStatus
 * to distinguish user operations from the persisted state.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public enum NotificationAction {

    /**
     * Mark notification as read.
     */
    READ,

    /**
     * Mark notification as unread.
     */
    UNREAD

}