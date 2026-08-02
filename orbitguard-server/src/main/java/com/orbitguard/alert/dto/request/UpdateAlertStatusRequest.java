package com.orbitguard.alert.dto.request;

import com.orbitguard.alert.enums.AlertStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ==============================================================
 * Update Alert Status Request
 * ==============================================================
 *
 * Request DTO used to update the status of an
 * existing alert.
 *
 * This operation supports the alert lifecycle:
 *
 * PENDING
 *      ↓
 * ACKNOWLEDGED
 *      ↓
 * RESOLVED
 *      ↓
 * CLOSED
 *
 * Only workflow-related fields are allowed
 * to be modified.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAlertStatusRequest {

    /**
     * New alert status.
     */
    @NotNull(message = "Alert status is required.")
    private AlertStatus status;

    /**
     * Remarks added while updating
     * the alert status.
     */
    @Size(
            max = 500,
            message = "Remarks must not exceed 500 characters."
    )
    private String remarks;

}