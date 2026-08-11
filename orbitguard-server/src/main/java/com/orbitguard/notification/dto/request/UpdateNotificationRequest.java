package com.orbitguard.notification.dto.request;

import com.orbitguard.notification.enums.NotificationPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ===============================================================
 * Update Notification Request DTO
 * ===============================================================
 *
 * Request object used to update an existing notification.
 *
 * Only business-editable fields are exposed.
 * System-managed fields such as notification code,
 * recipient, timestamps, status, and references
 * cannot be updated through this DTO.
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
public class UpdateNotificationRequest {

    /**
     * Updated notification title.
     */
    @NotBlank(message = "Notification title is required.")
    @Size(
            min = 5,
            max = 150,
            message = "Notification title must be between 5 and 150 characters."
    )
    private String title;

    /**
     * Updated notification message.
     */
    @NotBlank(message = "Notification message is required.")
    @Size(
            min = 10,
            max = 1000,
            message = "Notification message must be between 10 and 1000 characters."
    )
    private String message;

    /**
     * Updated notification priority.
     */
    @NotNull(message = "Notification priority is required.")
    private NotificationPriority priority;

}