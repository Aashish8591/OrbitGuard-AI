package com.orbitguard.notification.enums;

/**
 * Represents the current lifecycle status of a notification.
 *
 * <p>
 * Status Flow:
 * UNREAD -> READ -> ARCHIVED
 * </p>
 *
 * <ul>
 *     <li>UNREAD - Notification has not been viewed by the recipient.</li>
 *     <li>READ - Notification has been viewed by the recipient.</li>
 *     <li>ARCHIVED - Notification has been archived and is no longer active.</li>
 * </ul>
 *
 * @author OrbitGuard AI
 * @since 1.0
 */
public enum NotificationStatus {

    /**
     * Notification has not been viewed yet.
     */
    UNREAD,

    /**
     * Notification has been viewed by the recipient.
     */
    READ,

    /**
     * Notification has been archived.
     */
    ARCHIVED

}