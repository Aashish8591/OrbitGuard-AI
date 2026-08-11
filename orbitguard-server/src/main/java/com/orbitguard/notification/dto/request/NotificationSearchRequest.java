package com.orbitguard.notification.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ===============================================================
 * Notification Search Request DTO
 * ===============================================================
 *
 * Request object used for searching notifications with
 * pagination and sorting support.
 *
 * This DTO is responsible only for search-related parameters.
 * Filtering parameters such as status, priority, and type
 * are handled separately by NotificationFilterRequest.
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
public class NotificationSearchRequest {

    /**
     * Keyword used to search notifications.
     *
     * Searches against:
     * - Title
     * - Message
     */
    private String keyword;

    /**
     * Page number.
     *
     * Starts from 0.
     */
    @Builder.Default
    @Min(value = 0, message = "Page number cannot be negative.")
    private Integer page = 0;

    /**
     * Number of records per page.
     */
    @Builder.Default
    @Min(value = 1, message = "Page size must be at least 1.")
    @Max(value = 100, message = "Page size cannot exceed 100.")
    private Integer size = 10;

    /**
     * Field used for sorting.
     *
     * Examples:
     * - createdAt
     * - title
     * - priority
     */
    @Builder.Default
    private String sortBy = "createdAt";

    /**
     * Sort direction.
     *
     * Allowed values:
     * asc
     * desc
     */
    @Builder.Default
    @Pattern(
            regexp = "^(asc|desc)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Sort direction must be either 'asc' or 'desc'."
    )
    private String direction = "desc";

}