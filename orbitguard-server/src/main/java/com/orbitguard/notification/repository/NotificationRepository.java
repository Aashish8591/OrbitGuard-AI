package com.orbitguard.notification.repository;

import com.orbitguard.notification.entity.Notification;
import com.orbitguard.notification.enums.NotificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ===============================================================
 * Notification Repository
 * ===============================================================
 *
 * Repository responsible for CRUD operations on Notification
 * documents stored in MongoDB.
 *
 * This repository contains only data access methods.
 * Business logic must remain inside the Service layer.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    /**
     * Finds an active notification by MongoDB document ID.
     *
     * @param id MongoDB document ID.
     * @return Optional Notification.
     */
    Optional<Notification> findByIdAndIsActiveTrue(String id);

    /**
     * Finds an active notification using the business notification code.
     *
     * Example:
     * NOT-000001
     *
     * @param notificationCode business notification code
     * @return Optional Notification.
     */
    Optional<Notification> findByNotificationCodeAndIsActiveTrue(String notificationCode);

    /**
     * Checks whether a notification business code already exists.
     *
     * @param notificationCode business notification code
     * @return true if exists
     */
    boolean existsByNotificationCode(String notificationCode);

    /**
     * Counts unread notifications for a recipient.
     *
     * Used for dashboard notification badge.
     *
     * @param recipientId recipient identifier
     * @param status notification status
     * @return unread notification count
     */
    long countByRecipientIdAndStatusAndIsActiveTrue(
            String recipientId,
            NotificationStatus status
    );

}