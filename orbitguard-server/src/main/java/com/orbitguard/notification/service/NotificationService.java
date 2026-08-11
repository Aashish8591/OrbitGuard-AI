package com.orbitguard.notification.service;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.MarkNotificationReadRequest;
import com.orbitguard.notification.dto.request.NotificationFilterRequest;
import com.orbitguard.notification.dto.request.NotificationSearchRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.dto.response.NotificationResponse;
import org.springframework.data.domain.Pageable;

/**
 * ===============================================================
 * Notification Service
 * ===============================================================
 *
 * Defines the business operations supported by the
 * Notification Management module.
 *
 * This interface contains only the service contract.
 * Business implementation belongs to NotificationServiceImpl.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface NotificationService {

    /**
     * Creates a new notification.
     *
     * @param request create notification request
     * @return created notification response
     */
    ApiResponse<NotificationResponse> createNotification(
            CreateNotificationRequest request
    );

    /**
     * Retrieves an active notification by its MongoDB ID.
     *
     * @param id notification identifier
     * @return notification response
     */
    ApiResponse<NotificationResponse> getNotificationById(
            String id
    );

    /**
     * Retrieves an active notification by its business code.
     *
     * @param notificationCode notification business code
     * @return notification response
     */
    ApiResponse<NotificationResponse> getNotificationByCode(
            String notificationCode
    );

    /**
     * Updates an existing notification.
     *
     * Only fields allowed by UpdateNotificationRequest
     * can be modified.
     *
     * @param id notification identifier
     * @param request update notification request
     * @return updated notification response
     */
    ApiResponse<NotificationResponse> updateNotification(
            String id,
            UpdateNotificationRequest request
    );

    /**
     * Soft deletes an existing notification.
     *
     * The notification is not physically removed from MongoDB.
     *
     * @param id notification identifier
     * @return success response
     */
    ApiResponse<Void> deleteNotification(
            String id
    );

    /**
     * Searches and filters notifications with pagination
     * and sorting support.
     *
     * @param searchRequest search, pagination and sorting parameters
     * @param filterRequest notification filtering parameters
     * @param pageable pagination and sorting information
     * @return paginated notification response
     */
    ApiResponse<PagedResponse<NotificationResponse>> searchNotifications(
            NotificationSearchRequest searchRequest,
            NotificationFilterRequest filterRequest,
            Pageable pageable
    );

    /**
     * Marks a notification as read or unread based on
     * the requested action.
     *
     * @param id notification identifier
     * @param request notification action request
     * @return updated notification response
     */
    ApiResponse<NotificationResponse> updateNotificationReadStatus(
            String id,
            MarkNotificationReadRequest request
    );

    /**
     * Returns the number of unread active notifications
     * for a specific recipient.
     *
     * @param recipientId recipient identifier
     * @return unread notification count
     */
    ApiResponse<Long> getUnreadNotificationCount(
            String recipientId
    );

}