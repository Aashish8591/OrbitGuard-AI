package com.orbitguard.alert.service.impl;

import com.orbitguard.alert.dto.request.CreateAlertRequest;
import com.orbitguard.alert.dto.request.UpdateAlertStatusRequest;
import com.orbitguard.alert.dto.response.AlertResponse;
import com.orbitguard.alert.entity.Alert;
import com.orbitguard.alert.enums.AlertSeverity;
import com.orbitguard.alert.enums.AlertSource;
import com.orbitguard.alert.enums.AlertStatus;
import com.orbitguard.alert.enums.AlertType;
import com.orbitguard.alert.mapper.AlertMapper;
import com.orbitguard.alert.repository.AlertRepository;
import com.orbitguard.alert.specification.AlertQueryBuilder;
import com.orbitguard.alert.util.AlertMessageGenerator;
import com.orbitguard.alert.util.AlertPriorityCalculator;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.risk.entity.CollisionRisk;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.repository.CollisionRiskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * ==============================================================
 * Alert Service Implementation Test
 * ==============================================================
 *
 * Unit tests for AlertServiceImpl.
 *
 * These tests verify Alert business logic without
 * connecting to MongoDB or external services.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class AlertServiceImplTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private CollisionRiskRepository collisionRiskRepository;

    @Mock
    private AlertMapper alertMapper;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private AlertQueryBuilder alertQueryBuilder;

    @Mock
    private BusinessCodeGenerator businessCodeGenerator;

    @Mock
    private SequenceGeneratorService sequenceGeneratorService;

    @Mock
    private AlertPriorityCalculator alertPriorityCalculator;

    @Mock
    private AlertMessageGenerator alertMessageGenerator;

    @InjectMocks
    private AlertServiceImpl alertService;

    private CollisionRisk collisionRisk;

    private Alert alert;

    @BeforeEach
    void setUp() {

        collisionRisk = CollisionRisk.builder()
                .id("risk-001")
                .satelliteId("satellite-001")
                .debrisId("debris-001")
                .riskLevel(RiskLevel.HIGH)
                .build();

        alert = Alert.builder()
                .id("alert-001")
                .alertCode("ALT-000001")
                .riskId("risk-001")
                .satelliteId("satellite-001")
                .debrisId("debris-001")
                .title("High Collision Risk")
                .message("High collision probability detected.")
                .severity(AlertSeverity.HIGH)
                .status(AlertStatus.PENDING)
                .source(AlertSource.SYSTEM)
                .type(AlertType.COLLISION)
                .isActive(true)
                .build();
    }

    /**
     * ----------------------------------------------------------
     * Create Alert - Success
     * ----------------------------------------------------------
     */
    @Test
    void createAlert_shouldCreateAlertSuccessfully() {

        CreateAlertRequest request = CreateAlertRequest.builder()
                .riskId("risk-001")
                .title("High Collision Risk")
                .message("High collision probability detected.")
                .build();

        AlertResponse response = AlertResponse.builder()
                .id("alert-001")
                .alertCode("ALT-000001")
                .riskId("risk-001")
                .status(AlertStatus.PENDING)
                .severity(AlertSeverity.HIGH)
                .build();

        when(collisionRiskRepository.findByIdAndIsActiveTrue("risk-001"))
                .thenReturn(Optional.of(collisionRisk));

        when(sequenceGeneratorService.getNextSequence(anyString()))
                .thenReturn(1L);

        when(businessCodeGenerator.generate("ALT", 1L))
                .thenReturn("ALT-000001");

        when(alertPriorityCalculator.calculateSeverity(RiskLevel.HIGH))
                .thenReturn(AlertSeverity.HIGH);

        when(alertRepository.save(any(Alert.class)))
                .thenReturn(alert);

        when(alertMapper.toResponse(alert))
                .thenReturn(response);

        ApiResponse<AlertResponse> result =
                alertService.createAlert(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertNotNull(result.getData());

        assertEquals(
                "ALT-000001",
                result.getData().getAlertCode()
        );

        assertEquals(
                AlertStatus.PENDING,
                result.getData().getStatus()
        );

        verify(collisionRiskRepository)
                .findByIdAndIsActiveTrue("risk-001");

        verify(alertRepository)
                .save(any(Alert.class));
    }

    /**
     * ----------------------------------------------------------
     * Create Alert - Risk Not Found
     * ----------------------------------------------------------
     */
    @Test
    void createAlert_shouldThrowExceptionWhenRiskNotFound() {

        CreateAlertRequest request = CreateAlertRequest.builder()
                .riskId("invalid-risk")
                .title("Test Alert")
                .message("Test message")
                .build();

        when(collisionRiskRepository
                .findByIdAndIsActiveTrue("invalid-risk"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> alertService.createAlert(request)
        );

        verify(alertRepository, never())
                .save(any(Alert.class));
    }

    /**
     * ----------------------------------------------------------
     * Create Alert - Null Request
     * ----------------------------------------------------------
     */
    @Test
    void createAlert_shouldThrowExceptionWhenRequestIsNull() {

        assertThrows(
                BadRequestException.class,
                () -> alertService.createAlert(null)
        );

        verifyNoInteractions(collisionRiskRepository);
        verifyNoInteractions(alertRepository);
    }

    /**
     * ----------------------------------------------------------
     * Get Alert - Success
     * ----------------------------------------------------------
     */
    @Test
    void getAlertById_shouldReturnAlertSuccessfully() {

        AlertResponse response = AlertResponse.builder()
                .id("alert-001")
                .alertCode("ALT-000001")
                .status(AlertStatus.PENDING)
                .build();

        when(alertRepository.findByIdAndIsActiveTrue("alert-001"))
                .thenReturn(Optional.of(alert));

        when(alertMapper.toResponse(alert))
                .thenReturn(response);

        ApiResponse<AlertResponse> result =
                alertService.getAlertById("alert-001");

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals(
                "alert-001",
                result.getData().getId()
        );

        verify(alertRepository)
                .findByIdAndIsActiveTrue("alert-001");
    }

    /**
     * ----------------------------------------------------------
     * Get Alert - Not Found
     * ----------------------------------------------------------
     */
    @Test
    void getAlertById_shouldThrowExceptionWhenAlertNotFound() {

        when(alertRepository.findByIdAndIsActiveTrue("invalid-id"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> alertService.getAlertById("invalid-id")
        );
    }

    /**
     * ----------------------------------------------------------
     * Update Status - PENDING to ACKNOWLEDGED
     * ----------------------------------------------------------
     */
    @Test
    void updateAlertStatus_shouldMovePendingToAcknowledged() {

        UpdateAlertStatusRequest request =
                UpdateAlertStatusRequest.builder()
                        .status(AlertStatus.ACKNOWLEDGED)
                        .remarks("Reviewed by operator.")
                        .build();

        AlertResponse response = AlertResponse.builder()
                .id("alert-001")
                .status(AlertStatus.ACKNOWLEDGED)
                .remarks("Reviewed by operator.")
                .build();

        when(alertRepository.findByIdAndIsActiveTrue("alert-001"))
                .thenReturn(Optional.of(alert));

        when(alertRepository.save(alert))
                .thenReturn(alert);

        when(alertMapper.toResponse(alert))
                .thenReturn(response);

        ApiResponse<AlertResponse> result =
                alertService.updateAlertStatus(
                        "alert-001",
                        request
                );

        assertNotNull(result);
        assertTrue(result.isSuccess());

        assertEquals(
                AlertStatus.ACKNOWLEDGED,
                alert.getStatus()
        );

        assertEquals(
                "Reviewed by operator.",
                alert.getRemarks()
        );

        assertNotNull(alert.getAcknowledgedAt());

        verify(alertRepository)
                .save(alert);
    }

    /**
     * ----------------------------------------------------------
     * Update Status - ACKNOWLEDGED to RESOLVED
     * ----------------------------------------------------------
     */
    @Test
    void updateAlertStatus_shouldMoveAcknowledgedToResolved() {

        alert.setStatus(AlertStatus.ACKNOWLEDGED);

        UpdateAlertStatusRequest request =
                UpdateAlertStatusRequest.builder()
                        .status(AlertStatus.RESOLVED)
                        .remarks("Risk reviewed and resolved.")
                        .build();

        when(alertRepository.findByIdAndIsActiveTrue("alert-001"))
                .thenReturn(Optional.of(alert));

        when(alertRepository.save(alert))
                .thenReturn(alert);

        when(alertMapper.toResponse(alert))
                .thenReturn(
                        AlertResponse.builder()
                                .id("alert-001")
                                .status(AlertStatus.RESOLVED)
                                .build()
                );

        ApiResponse<AlertResponse> result =
                alertService.updateAlertStatus(
                        "alert-001",
                        request
                );

        assertTrue(result.isSuccess());
        assertEquals(
                AlertStatus.RESOLVED,
                alert.getStatus()
        );

        assertNotNull(alert.getResolvedAt());

        verify(alertRepository)
                .save(alert);
    }

    /**
     * ----------------------------------------------------------
     * Invalid Status Transition
     * ----------------------------------------------------------
     */
    @Test
    void updateAlertStatus_shouldRejectInvalidTransition() {

        UpdateAlertStatusRequest request =
                UpdateAlertStatusRequest.builder()
                        .status(AlertStatus.RESOLVED)
                        .build();

        when(alertRepository.findByIdAndIsActiveTrue("alert-001"))
                .thenReturn(Optional.of(alert));

        assertThrows(
                BadRequestException.class,
                () -> alertService.updateAlertStatus(
                        "alert-001",
                        request
                )
        );

        verify(alertRepository, never())
                .save(any(Alert.class));
    }

    /**
     * ----------------------------------------------------------
     * Delete Alert - Soft Delete
     * ----------------------------------------------------------
     */
    @Test
    void deleteAlert_shouldSoftDeleteAlert() {

        when(alertRepository.findByIdAndIsActiveTrue("alert-001"))
                .thenReturn(Optional.of(alert));

        when(alertRepository.save(alert))
                .thenReturn(alert);

        ApiResponse<Void> result =
                alertService.deleteAlert("alert-001");

        assertNotNull(result);
        assertTrue(result.isSuccess());

        assertFalse(alert.getIsActive());

        verify(alertRepository)
                .save(alert);
    }

}