package com.orbitguard.notification.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.notification.constants.NotificationConstants;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.MarkNotificationReadRequest;
import com.orbitguard.notification.dto.request.NotificationFilterRequest;
import com.orbitguard.notification.dto.request.NotificationSearchRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.dto.response.NotificationResponse;
import com.orbitguard.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ===============================================================
 * Notification Controller
 * ===============================================================
 *
 * REST APIs for Notification Management.
 *
 * Responsibilities:
 * <ul>
 *     <li>Create notification</li>
 *     <li>Retrieve notification by ID</li>
 *     <li>Retrieve notification by business code</li>
 *     <li>Search and filter notifications</li>
 *     <li>Update notification</li>
 *     <li>Mark notification as read/unread</li>
 *     <li>Retrieve unread notification count</li>
 *     <li>Soft delete notification</li>
 * </ul>
 *
 * This controller contains no business logic.
 * All business operations are delegated to NotificationService.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(NotificationConstants.BASE_URL)
@Tag(
        name = NotificationConstants.SWAGGER_TAG,
        description = NotificationConstants.SWAGGER_DESCRIPTION
)
public class NotificationController {

    /**
     * Notification service.
     */
    private final NotificationService notificationService;

    /**
     * --------------------------------------------------------------
     * Create Notification
     * --------------------------------------------------------------
     *
     * Creates a new notification for a recipient.
     *
     * @param request create notification request
     * @return created notification
     */
    @PostMapping
    @Operation(
            summary = "Create Notification",
            description = "Creates a new notification for a recipient."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Notification created successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid notification request."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Notification could not be created because of a duplicate resource."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )
    })
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(

            @Valid
            @RequestBody
            CreateNotificationRequest request) {

        ApiResponse<NotificationResponse> response =
                notificationService.createNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * --------------------------------------------------------------
     * Get Notification By ID
     * --------------------------------------------------------------
     *
     * Retrieves an active notification using its MongoDB ID.
     *
     * @param id notification ID
     * @return notification details
     */
    @GetMapping(NotificationConstants.GET_BY_ID)
    @Operation(
            summary = "Get Notification By ID",
            description = "Retrieves an active notification using its unique identifier."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Notification retrieved successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid notification ID."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Notification not found."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )
    })
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(

            @Parameter(
                    description = "Unique notification ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id) {

        ApiResponse<NotificationResponse> response =
                notificationService.getNotificationById(id);

        return ResponseEntity.ok(response);
    }

    /**
     * --------------------------------------------------------------
     * Get Notification By Code
     * --------------------------------------------------------------
     *
     * Retrieves an active notification using its business code.
     *
     * Example:
     * NOT-000001
     *
     * @param notificationCode notification business code
     * @return notification details
     */
    @GetMapping(NotificationConstants.GET_BY_CODE)
    @Operation(
            summary = "Get Notification By Code",
            description = "Retrieves an active notification using its business notification code."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Notification retrieved successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid notification code."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Notification not found."
            )
    })
    public ResponseEntity<ApiResponse<NotificationResponse>>
    getNotificationByCode(

            @Parameter(
                    description = "Notification business code",
                    required = true,
                    example = "NOT-000001"
            )
            @PathVariable
            String notificationCode) {

        ApiResponse<NotificationResponse> response =
                notificationService.getNotificationByCode(
                        notificationCode
                );

        return ResponseEntity.ok(response);
    }

    /**
     * --------------------------------------------------------------
     * Search Notifications
     * --------------------------------------------------------------
     *
     * Retrieves notifications using:
     *
     * <ul>
     *     <li>Keyword search</li>
     *     <li>Status filter</li>
     *     <li>Priority filter</li>
     *     <li>Type filter</li>
     *     <li>Recipient filter</li>
     *     <li>Pagination</li>
     *     <li>Sorting</li>
     * </ul>
     *
     * @param searchRequest search and pagination parameters
     * @param filterRequest notification filter parameters
     * @return paginated notifications
     */
    @GetMapping(NotificationConstants.GET_ALL)
    @Operation(
            summary = "Search Notifications",
            description = "Retrieves notifications using search, filtering, pagination and sorting."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Notifications retrieved successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid search or filter parameters."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "Internal server error."
            )
    })
    public ResponseEntity<
            ApiResponse<PagedResponse<NotificationResponse>>>
    searchNotifications(

            @Valid
            @ModelAttribute
            NotificationSearchRequest searchRequest,

            @ModelAttribute
            NotificationFilterRequest filterRequest) {

        Sort.Direction direction =
                Sort.Direction.fromString(
                        searchRequest.getDirection()
                );

        Pageable pageable =
                PageRequest.of(
                        searchRequest.getPage(),
                        searchRequest.getSize(),
                        Sort.by(
                                direction,
                                searchRequest.getSortBy()
                        )
                );

        ApiResponse<PagedResponse<NotificationResponse>> response =
                notificationService.searchNotifications(
                        searchRequest,
                        filterRequest,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    /**
     * --------------------------------------------------------------
     * Update Notification
     * --------------------------------------------------------------
     *
     * Updates editable notification fields.
     *
     * System-managed fields such as recipient, status,
     * notification code and references are not modified.
     *
     * @param id notification ID
     * @param request update notification request
     * @return updated notification
     */
    @PutMapping(NotificationConstants.UPDATE)
    @Operation(
            summary = "Update Notification",
            description = "Updates the editable fields of an existing notification."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Notification updated successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid notification update request."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Notification not found."
            )
    })
    public ResponseEntity<ApiResponse<NotificationResponse>>
    updateNotification(

            @Parameter(
                    description = "Unique notification ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id,

            @Valid
            @RequestBody
            UpdateNotificationRequest request) {

        ApiResponse<NotificationResponse> response =
                notificationService.updateNotification(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /**
     * --------------------------------------------------------------
     * Mark Notification Read / Unread
     * --------------------------------------------------------------
     *
     * Updates the read state of a notification.
     *
     * Supported actions:
     *
     * READ
     * UNREAD
     *
     * @param id notification ID
     * @param request read/unread action request
     * @return updated notification
     */
    @PatchMapping(NotificationConstants.MARK_READ_STATUS)
    @Operation(
            summary = "Mark Notification Read or Unread",
            description = "Updates the read state of an existing notification."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Notification read status updated successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid notification action."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Notification not found."
            )
    })
    public ResponseEntity<ApiResponse<NotificationResponse>>
    updateNotificationReadStatus(

            @Parameter(
                    description = "Unique notification ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id,

            @Valid
            @RequestBody
            MarkNotificationReadRequest request) {

        ApiResponse<NotificationResponse> response =
                notificationService.updateNotificationReadStatus(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /**
     * --------------------------------------------------------------
     * Get Unread Notification Count
     * --------------------------------------------------------------
     *
     * Returns the number of unread active notifications
     * for a recipient.
     *
     * @param recipientId recipient user ID
     * @return unread notification count
     */
    @GetMapping(NotificationConstants.UNREAD_COUNT)
    @Operation(
            summary = "Get Unread Notification Count",
            description = "Returns the number of unread active notifications for a recipient."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Unread notification count retrieved successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid recipient ID."
            )
    })
    public ResponseEntity<ApiResponse<Long>>
    getUnreadNotificationCount(

            @Parameter(
                    description = "Recipient user ID",
                    required = true,
                    example = "USER-000001"
            )
            @RequestParam
            String recipientId) {

        ApiResponse<Long> response =
                notificationService.getUnreadNotificationCount(
                        recipientId
                );

        return ResponseEntity.ok(response);
    }

    /**
     * --------------------------------------------------------------
     * Delete Notification
     * --------------------------------------------------------------
     *
     * Performs a soft delete.
     *
     * The MongoDB document remains available for auditing
     * but is excluded from normal active notification queries.
     *
     * @param id notification ID
     * @return success response
     */
    @DeleteMapping(NotificationConstants.DELETE)
    @Operation(
            summary = "Delete Notification",
            description = "Soft deletes an existing notification."
    )
    @ApiResponses(value = {

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Notification deleted successfully."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid notification ID."
            ),

            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Notification not found."
            )
    })
    public ResponseEntity<ApiResponse<Void>> deleteNotification(

            @Parameter(
                    description = "Unique notification ID",
                    required = true,
                    example = "6863f55ebfc45e3b1d8723d1"
            )
            @PathVariable
            String id) {

        ApiResponse<Void> response =
                notificationService.deleteNotification(id);

        return ResponseEntity.ok(response);
    }
}