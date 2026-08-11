package com.orbitguard.notification.entity;

import com.orbitguard.notification.enums.NotificationPriority;
import com.orbitguard.notification.enums.NotificationStatus;
import com.orbitguard.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ===============================================================
 * Notification Entity
 * ===============================================================
 *
 * Represents a notification delivered to a user within
 * OrbitGuard AI.
 *
 * Notifications are generated from different modules such as:
 *
 * - Alert Module
 * - Collision Risk Module
 * - System Events
 *
 * Future integrations:
 *
 * - Email Notifications
 * - Push Notifications
 * - WebSocket Notifications
 * - Kafka/RabbitMQ Events
 *
 * Collection : notifications
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    /**
     * MongoDB document ID.
     */
    @Id
    private String id;

    /**
     * Business Notification Code.
     *
     * Example:
     * NOT-000001
     */
    @Indexed(unique = true)
    private String notificationCode;

    /**
     * Notification title.
     */
    private String title;

    /**
     * Detailed notification message.
     */
    private String message;

    /**
     * Notification category.
     */
    private NotificationType type;

    /**
     * Notification priority.
     */
    private NotificationPriority priority;

    /**
     * Current notification status.
     */
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;

    /**
     * Recipient user ID.
     */
    @Indexed
    private String recipientId;

    /**
     * Related Alert ID.
     *
     * Nullable.
     */
    @Indexed
    private String alertId;

    /**
     * Related Collision Risk ID.
     *
     * Nullable.
     */
    @Indexed
    private String collisionRiskId;

    /**
     * Time when the notification was read.
     */
    private LocalDateTime readAt;

    /**
     * Soft delete flag.
     */
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Record creation timestamp.
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Record last update timestamp.
     */
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}