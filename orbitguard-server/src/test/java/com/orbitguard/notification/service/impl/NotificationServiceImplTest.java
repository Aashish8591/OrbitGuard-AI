package com.orbitguard.notification.service.impl;

import com.orbitguard.alert.repository.AlertRepository;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.notification.constants.NotificationConstants;
import com.orbitguard.notification.dto.request.CreateNotificationRequest;
import com.orbitguard.notification.dto.request.MarkNotificationReadRequest;
import com.orbitguard.notification.dto.request.UpdateNotificationRequest;
import com.orbitguard.notification.dto.response.NotificationResponse;
import com.orbitguard.notification.entity.Notification;
import com.orbitguard.notification.enums.NotificationAction;
import com.orbitguard.notification.enums.NotificationPriority;
import com.orbitguard.notification.enums.NotificationStatus;
import com.orbitguard.notification.enums.NotificationType;
import com.orbitguard.notification.mapper.NotificationMapper;
import com.orbitguard.notification.repository.NotificationRepository;
import com.orbitguard.notification.specification.NotificationQueryBuilder;
import com.orbitguard.notification.validator.NotificationValidator;
import com.orbitguard.risk.repository.CollisionRiskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private CollisionRiskRepository collisionRiskRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private NotificationQueryBuilder notificationQueryBuilder;

    @Mock
    private NotificationMapper notificationMapper;

    @Mock
    private NotificationValidator notificationValidator;

    @Mock
    private SequenceGeneratorService sequenceGeneratorService;

    @Mock
    private BusinessCodeGenerator businessCodeGenerator;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Notification notification;

    private NotificationResponse notificationResponse;

    @BeforeEach
    void setUp() {

        LocalDateTime now = LocalDateTime.now();

        notification = Notification.builder()
                .id("notification-id")
                .notificationCode("NTF-000001")
                .title("Test Notification")
                .message("This is a test notification.")
                .type(NotificationType.SYSTEM)
                .priority(NotificationPriority.MEDIUM)
                .status(NotificationStatus.UNREAD)
                .recipientId("user-001")
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        notificationResponse = NotificationResponse.builder()
                .id("notification-id")
                .notificationCode("NTF-000001")
                .title("Test Notification")
                .message("This is a test notification.")
                .type(NotificationType.SYSTEM)
                .priority(NotificationPriority.MEDIUM)
                .status(NotificationStatus.UNREAD)
                .recipientId("user-001")
                .readAt(null)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    // ============================================================
    // CREATE NOTIFICATION
    // ============================================================

    @Test
    void createNotification_shouldCreateSuccessfully() {

        CreateNotificationRequest request =
                CreateNotificationRequest.builder()
                        .title("Test Notification")
                        .message("This is a test notification.")
                        .type(NotificationType.SYSTEM)
                        .priority(NotificationPriority.MEDIUM)
                        .recipientId("user-001")
                        .build();

        when(notificationMapper.toEntity(request))
                .thenReturn(notification);

        when(sequenceGeneratorService.getNextSequence(
                NotificationConstants.NOTIFICATION_SEQUENCE_NAME
        )).thenReturn(1L);

        when(businessCodeGenerator.generate(
                NotificationConstants.NOTIFICATION_CODE_PREFIX,
                1L
        )).thenReturn("NTF-000001");

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.createNotification(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());

        assertEquals(
                "notification-id",
                result.getData().getId()
        );

        assertEquals(
                "NTF-000001",
                result.getData().getNotificationCode()
        );

        assertEquals(
                NotificationStatus.UNREAD,
                result.getData().getStatus()
        );

        verify(notificationValidator)
                .validateCreateRequest(request);

        verify(notificationMapper)
                .toEntity(request);

        verify(sequenceGeneratorService)
                .getNextSequence(
                        NotificationConstants.NOTIFICATION_SEQUENCE_NAME
                );

        verify(businessCodeGenerator)
                .generate(
                        NotificationConstants.NOTIFICATION_CODE_PREFIX,
                        1L
                );

        verify(notificationRepository)
                .save(notification);

        verify(notificationMapper)
                .toResponse(notification);
    }

    // ============================================================
    // CREATE - ALERT REFERENCE
    // ============================================================

    @Test
    void createNotification_shouldValidateAlertReference() {

        CreateNotificationRequest request =
                CreateNotificationRequest.builder()
                        .title("Alert Notification")
                        .message("This notification is related to an alert.")
                        .type(NotificationType.ALERT)
                        .priority(NotificationPriority.HIGH)
                        .recipientId("user-001")
                        .alertId("alert-001")
                        .build();

        when(alertRepository.findByIdAndIsActiveTrue("alert-001"))
                .thenReturn(Optional.of(mock(
                        com.orbitguard.alert.entity.Alert.class
                )));

        when(notificationMapper.toEntity(request))
                .thenReturn(notification);

        when(sequenceGeneratorService.getNextSequence(
                NotificationConstants.NOTIFICATION_SEQUENCE_NAME
        )).thenReturn(1L);

        when(businessCodeGenerator.generate(
                NotificationConstants.NOTIFICATION_CODE_PREFIX,
                1L
        )).thenReturn("NTF-000001");

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.createNotification(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());

        verify(alertRepository)
                .findByIdAndIsActiveTrue("alert-001");
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    @Test
    void getNotificationById_shouldReturnNotification() {

        when(notificationRepository.findByIdAndIsActiveTrue(
                "notification-id"
        )).thenReturn(Optional.of(notification));

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.getNotificationById(
                        "notification-id"
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());

        assertEquals(
                "notification-id",
                result.getData().getId()
        );

        assertEquals(
                "NTF-000001",
                result.getData().getNotificationCode()
        );

        verify(notificationRepository)
                .findByIdAndIsActiveTrue("notification-id");

        verify(notificationMapper)
                .toResponse(notification);
    }

    // ============================================================
    // GET BY CODE
    // ============================================================

    @Test
    void getNotificationByCode_shouldReturnNotification() {

        when(notificationRepository
                .findByNotificationCodeAndIsActiveTrue(
                        "NTF-000001"
                ))
                .thenReturn(Optional.of(notification));

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.getNotificationByCode(
                        "NTF-000001"
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());

        assertEquals(
                "NTF-000001",
                result.getData().getNotificationCode()
        );

        verify(notificationRepository)
                .findByNotificationCodeAndIsActiveTrue(
                        "NTF-000001"
                );

        verify(notificationMapper)
                .toResponse(notification);
    }

    // ============================================================
    // UPDATE
    // ============================================================

    @Test
    void updateNotification_shouldUpdateSuccessfully() {

        UpdateNotificationRequest request =
                UpdateNotificationRequest.builder()
                        .title("Updated Notification")
                        .message("Updated notification message.")
                        .priority(NotificationPriority.HIGH)
                        .build();

        when(notificationRepository.findByIdAndIsActiveTrue(
                "notification-id"
        )).thenReturn(Optional.of(notification));

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.updateNotification(
                        "notification-id",
                        request
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());

        verify(notificationValidator)
                .validateUpdateRequest(request);

        verify(notificationMapper)
                .updateEntity(
                        notification,
                        request
                );

        verify(notificationRepository)
                .save(notification);

        verify(notificationMapper)
                .toResponse(notification);
    }

    // ============================================================
    // DELETE
    // ============================================================

    @Test
    void deleteNotification_shouldSoftDeleteSuccessfully() {

        when(notificationRepository.findByIdAndIsActiveTrue(
                "notification-id"
        )).thenReturn(Optional.of(notification));

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        ApiResponse<Void> result =
                notificationService.deleteNotification(
                        "notification-id"
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());

        assertFalse(notification.getIsActive());

        verify(notificationRepository)
                .findByIdAndIsActiveTrue("notification-id");

        verify(notificationRepository)
                .save(notification);
    }

    // ============================================================
    // MARK AS READ
    // ============================================================

    @Test
    void updateNotificationReadStatus_shouldMarkAsRead() {

        MarkNotificationReadRequest request =
                MarkNotificationReadRequest.builder()
                        .action(NotificationAction.READ)
                        .build();

        when(notificationRepository.findByIdAndIsActiveTrue(
                "notification-id"
        )).thenReturn(Optional.of(notification));

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.updateNotificationReadStatus(
                        "notification-id",
                        request
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());

        assertEquals(
                NotificationStatus.READ,
                notification.getStatus()
        );

        assertNotNull(notification.getReadAt());

        verify(notificationValidator)
                .validateNotificationAction(request);

        verify(notificationRepository)
                .save(notification);

        verify(notificationMapper)
                .toResponse(notification);
    }

    // ============================================================
    // MARK AS UNREAD
    // ============================================================

    @Test
    void updateNotificationReadStatus_shouldMarkAsUnread() {

        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());

        MarkNotificationReadRequest request =
                MarkNotificationReadRequest.builder()
                        .action(NotificationAction.UNREAD)
                        .build();

        when(notificationRepository.findByIdAndIsActiveTrue(
                "notification-id"
        )).thenReturn(Optional.of(notification));

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        when(notificationMapper.toResponse(notification))
                .thenReturn(notificationResponse);

        ApiResponse<NotificationResponse> result =
                notificationService.updateNotificationReadStatus(
                        "notification-id",
                        request
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());

        assertEquals(
                NotificationStatus.UNREAD,
                notification.getStatus()
        );

        assertNull(notification.getReadAt());

        verify(notificationValidator)
                .validateNotificationAction(request);

        verify(notificationRepository)
                .save(notification);

        verify(notificationMapper)
                .toResponse(notification);
    }

    // ============================================================
    // UNREAD COUNT
    // ============================================================

    @Test
    void getUnreadNotificationCount_shouldReturnCount() {

        when(notificationRepository
                .countByRecipientIdAndStatusAndIsActiveTrue(
                        "user-001",
                        NotificationStatus.UNREAD
                ))
                .thenReturn(5L);

        ApiResponse<Long> result =
                notificationService.getUnreadNotificationCount(
                        "user-001"
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals(5L, result.getData());

        verify(notificationRepository)
                .countByRecipientIdAndStatusAndIsActiveTrue(
                        "user-001",
                        NotificationStatus.UNREAD
                );
    }
}