package com.orbitguard.notification.enums;

/**
 * Represents the urgency level of a notification.
 *
 * <ul>
 *     <li>LOW - Informational notifications.</li>
 *     <li>MEDIUM - Standard operational notifications.</li>
 *     <li>HIGH - Important notifications requiring attention.</li>
 *     <li>CRITICAL - Emergency notifications requiring immediate action.</li>
 * </ul>
 *
 * @author OrbitGuard AI
 * @since 1.0
 */
public enum NotificationPriority {

    /**
     * Lowest priority.
     */
    LOW,

    /**
     * Normal priority.
     */
    MEDIUM,

    /**
     * High priority.
     */
    HIGH,

    /**
     * Critical priority.
     */
    CRITICAL

}