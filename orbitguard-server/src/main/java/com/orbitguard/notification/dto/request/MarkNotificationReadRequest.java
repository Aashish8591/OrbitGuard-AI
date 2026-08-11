package com.orbitguard.notification.dto.request;

import com.orbitguard.notification.enums.NotificationAction;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ===============================================================
 * Mark Notification Read Request DTO
 * ===============================================================
 *
 * Request object used to update the read state
 * of an existing notification.
 *
 * Supported actions:
 * - READ
 * - UNREAD
 *
 * Future versions may support additional actions
 * such as ARCHIVE or RESTORE without changing
 * the API contract.
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
public class MarkNotificationReadRequest {

    /**
     * Action to perform on the notification.
     */
    @NotNull(message = "Notification action is required.")
    private NotificationAction action;

}