package com.orbitguard.notification.constants;

/**
 * Constants used across the Notification module.
 *
 * <p>This class centralizes API paths, business codes,
 * response messages, Swagger metadata, and default values
 * to avoid hardcoded strings throughout the application.</p>
 *
 * @author OrbitGuard AI
 * @since 1.0
 */
public final class NotificationConstants {

    private NotificationConstants() {
        throw new IllegalStateException("Utility class");
    }

    /* ==========================================================
     * Swagger
     * ========================================================== */

    public static final String SWAGGER_TAG = "Notification Management";

    public static final String SWAGGER_DESCRIPTION =
            "APIs for managing notifications, unread status, search, pagination, and notification lifecycle.";

    /* ==========================================================
     * API Base Path
     * ========================================================== */

    public static final String BASE_URL = "/api/v1/notifications";

    public static final String GET_BY_ID = "/{id}";

    public static final String GET_BY_CODE = "/code/{notificationCode}";

    public static final String GET_ALL = "";

    public static final String UPDATE = "/{id}";

    public static final String DELETE = "/{id}";

    public static final String MARK_READ_STATUS = "/{id}/read-status";

    public static final String UNREAD_COUNT = "/unread/count";

    /**
     * MongoDB sequence name used for generating
     * notification business codes.
     */
    public static final String NOTIFICATION_SEQUENCE_NAME =
            "notification_sequence";

    /* ==========================================================
     * Business Code
     * ========================================================== */

    public static final String NOTIFICATION_CODE_PREFIX = "NOT";

    /* ==========================================================
     * Success Messages
     * ========================================================== */

    public static final String NOTIFICATION_CREATED =
            "Notification created successfully.";

    public static final String NOTIFICATION_UPDATED =
            "Notification updated successfully.";

    public static final String NOTIFICATION_FETCHED =
            "Notification retrieved successfully.";

    public static final String NOTIFICATIONS_FETCHED =
            "Notifications retrieved successfully.";

    public static final String NOTIFICATION_DELETED =
            "Notification deleted successfully.";

    public static final String NOTIFICATION_MARKED_AS_READ =
            "Notification marked as read successfully.";

    public static final String ALL_NOTIFICATIONS_MARKED_AS_READ =
            "All notifications marked as read successfully.";

    public static final String NOTIFICATION_ARCHIVED =
            "Notification archived successfully.";

    /* ==========================================================
     * Error Messages
     * ========================================================== */

    public static final String NOTIFICATION_NOT_FOUND =
            "Notification not found.";

    public static final String INVALID_NOTIFICATION_STATUS =
            "Invalid notification status.";

    public static final String INVALID_NOTIFICATION_PRIORITY =
            "Invalid notification priority.";

    public static final String INVALID_NOTIFICATION_TYPE =
            "Invalid notification type.";

    /* ==========================================================
     * Default Values
     * ========================================================== */

    public static final int DEFAULT_PAGE_NUMBER = 0;

    public static final int DEFAULT_PAGE_SIZE = 10;

    public static final String DEFAULT_SORT_BY = "createdAt";

    public static final String DEFAULT_SORT_DIRECTION = "desc";
}