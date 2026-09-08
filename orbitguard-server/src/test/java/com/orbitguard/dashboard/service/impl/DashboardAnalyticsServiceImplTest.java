package com.orbitguard.dashboard.service.impl;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.dashboard.constants.DashboardApiConstants;
import com.orbitguard.dashboard.dto.response.DashboardAlertAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardOverviewResponse;
import com.orbitguard.dashboard.dto.response.DashboardResponse;
import com.orbitguard.dashboard.dto.response.DashboardRiskAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardSatelliteAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardTrendResponse;
import com.orbitguard.dashboard.repository.DashboardAnalyticsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * ==============================================================
 * Dashboard Analytics Service Implementation Test
 * ==============================================================
 *
 * Unit tests for DashboardAnalyticsServiceImpl.
 *
 * These tests verify:
 *
 * - Trend days validation
 * - Risk trend date calculation
 * - Repository orchestration
 * - Dashboard response construction
 * - Standard API response creation
 *
 * MongoDB is not required because the repository is mocked.
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class DashboardAnalyticsServiceImplTest {

    @Mock
    private DashboardAnalyticsRepository dashboardAnalyticsRepository;

    private DashboardAnalyticsServiceImpl dashboardAnalyticsService;


    /**
     * Creates the service under test before each test.
     */
    @BeforeEach
    void setUp() {

        dashboardAnalyticsService =
                new DashboardAnalyticsServiceImpl(
                        dashboardAnalyticsRepository
                );
    }


    /**
     * ==============================================================
     * Test 1: Get Dashboard Successfully
     * ==============================================================
     *
     * Verifies that the service:
     *
     * - Retrieves all required analytics
     * - Calculates the trend date range
     * - Builds DashboardResponse
     * - Returns a successful ApiResponse
     */
    @Test
    void shouldGetDashboardSuccessfully() {

        DashboardOverviewResponse overview =
                DashboardOverviewResponse.builder()
                        .totalSatellites(10)
                        .totalDebris(20)
                        .totalRisks(5)
                        .highRisks(2)
                        .criticalRisks(1)
                        .totalAlerts(8)
                        .pendingAlerts(3)
                        .build();

        DashboardSatelliteAnalyticsResponse satelliteAnalytics =
                DashboardSatelliteAnalyticsResponse.builder()
                        .byOrbitType(List.of())
                        .byMissionStatus(List.of())
                        .build();

        DashboardRiskAnalyticsResponse riskAnalytics =
                DashboardRiskAnalyticsResponse.builder()
                        .byRiskLevel(List.of())
                        .byRiskStatus(List.of())
                        .build();

        DashboardAlertAnalyticsResponse alertAnalytics =
                DashboardAlertAnalyticsResponse.builder()
                        .bySeverity(List.of())
                        .byStatus(List.of())
                        .byType(List.of())
                        .build();

        LocalDate today = LocalDate.now();
        LocalDate expectedFromDate = today.minusDays(6);

        List<DashboardTrendResponse> riskTrends =
                List.of(
                        DashboardTrendResponse.builder()
                                .date(expectedFromDate)
                                .count(2)
                                .build(),
                        DashboardTrendResponse.builder()
                                .date(today)
                                .count(5)
                                .build()
                );

        when(dashboardAnalyticsRepository.getOverview())
                .thenReturn(overview);

        when(dashboardAnalyticsRepository.getSatelliteAnalytics())
                .thenReturn(satelliteAnalytics);

        when(dashboardAnalyticsRepository.getRiskAnalytics())
                .thenReturn(riskAnalytics);

        when(dashboardAnalyticsRepository.getAlertAnalytics())
                .thenReturn(alertAnalytics);

        when(dashboardAnalyticsRepository.getRiskTrends(
                expectedFromDate,
                today
        )).thenReturn(riskTrends);


        ApiResponse<DashboardResponse> response =
                dashboardAnalyticsService.getDashboard(7);


        assertNotNull(response);
        assertEquals(
                DashboardApiConstants.DASHBOARD_RETRIEVED,
                response.getMessage()
        );

        assertNotNull(response.getData());

        DashboardResponse dashboard =
                response.getData();

        assertSame(overview, dashboard.getOverview());
        assertSame(
                satelliteAnalytics,
                dashboard.getSatelliteAnalytics()
        );
        assertSame(
                riskAnalytics,
                dashboard.getRiskAnalytics()
        );
        assertSame(
                alertAnalytics,
                dashboard.getAlertAnalytics()
        );
        assertSame(
                riskTrends,
                dashboard.getRiskTrends()
        );


        verify(dashboardAnalyticsRepository)
                .getOverview();

        verify(dashboardAnalyticsRepository)
                .getSatelliteAnalytics();

        verify(dashboardAnalyticsRepository)
                .getRiskAnalytics();

        verify(dashboardAnalyticsRepository)
                .getAlertAnalytics();

        verify(dashboardAnalyticsRepository)
                .getRiskTrends(
                        expectedFromDate,
                        today
                );

        verifyNoMoreInteractions(
                dashboardAnalyticsRepository
        );
    }


    /**
     * ==============================================================
     * Test 2: Trend Days = 1
     * ==============================================================
     *
     * Verifies that one requested trend day produces
     * the same start and end date.
     */
    @Test
    void shouldAcceptMinimumTrendDays() {

        DashboardOverviewResponse overview =
                DashboardOverviewResponse.builder()
                        .build();

        DashboardSatelliteAnalyticsResponse satelliteAnalytics =
                DashboardSatelliteAnalyticsResponse.builder()
                        .byOrbitType(List.of())
                        .byMissionStatus(List.of())
                        .build();

        DashboardRiskAnalyticsResponse riskAnalytics =
                DashboardRiskAnalyticsResponse.builder()
                        .byRiskLevel(List.of())
                        .byRiskStatus(List.of())
                        .build();

        DashboardAlertAnalyticsResponse alertAnalytics =
                DashboardAlertAnalyticsResponse.builder()
                        .bySeverity(List.of())
                        .byStatus(List.of())
                        .byType(List.of())
                        .build();

        LocalDate today = LocalDate.now();

        List<DashboardTrendResponse> riskTrends =
                List.of(
                        DashboardTrendResponse.builder()
                                .date(today)
                                .count(0)
                                .build()
                );

        when(dashboardAnalyticsRepository.getOverview())
                .thenReturn(overview);

        when(dashboardAnalyticsRepository.getSatelliteAnalytics())
                .thenReturn(satelliteAnalytics);

        when(dashboardAnalyticsRepository.getRiskAnalytics())
                .thenReturn(riskAnalytics);

        when(dashboardAnalyticsRepository.getAlertAnalytics())
                .thenReturn(alertAnalytics);

        when(dashboardAnalyticsRepository.getRiskTrends(
                today,
                today
        )).thenReturn(riskTrends);


        ApiResponse<DashboardResponse> response =
                dashboardAnalyticsService.getDashboard(1);


        assertNotNull(response);
        assertNotNull(response.getData());

        verify(dashboardAnalyticsRepository)
                .getRiskTrends(today, today);
    }


    /**
     * ==============================================================
     * Test 3: Trend Days = 365
     * ==============================================================
     *
     * Verifies that the maximum allowed trend period
     * is accepted.
     */
    @Test
    void shouldAcceptMaximumTrendDays() {

        DashboardOverviewResponse overview =
                DashboardOverviewResponse.builder()
                        .build();

        DashboardSatelliteAnalyticsResponse satelliteAnalytics =
                DashboardSatelliteAnalyticsResponse.builder()
                        .byOrbitType(List.of())
                        .byMissionStatus(List.of())
                        .build();

        DashboardRiskAnalyticsResponse riskAnalytics =
                DashboardRiskAnalyticsResponse.builder()
                        .byRiskLevel(List.of())
                        .byRiskStatus(List.of())
                        .build();

        DashboardAlertAnalyticsResponse alertAnalytics =
                DashboardAlertAnalyticsResponse.builder()
                        .bySeverity(List.of())
                        .byStatus(List.of())
                        .byType(List.of())
                        .build();

        LocalDate today = LocalDate.now();
        LocalDate expectedFromDate =
                today.minusDays(364);

        when(dashboardAnalyticsRepository.getOverview())
                .thenReturn(overview);

        when(dashboardAnalyticsRepository.getSatelliteAnalytics())
                .thenReturn(satelliteAnalytics);

        when(dashboardAnalyticsRepository.getRiskAnalytics())
                .thenReturn(riskAnalytics);

        when(dashboardAnalyticsRepository.getAlertAnalytics())
                .thenReturn(alertAnalytics);

        when(dashboardAnalyticsRepository.getRiskTrends(
                expectedFromDate,
                today
        )).thenReturn(List.of());


        ApiResponse<DashboardResponse> response =
                dashboardAnalyticsService.getDashboard(365);


        assertNotNull(response);
        assertNotNull(response.getData());

        verify(dashboardAnalyticsRepository)
                .getRiskTrends(
                        expectedFromDate,
                        today
                );
    }


    /**
     * ==============================================================
     * Test 4: Reject Zero Trend Days
     * ==============================================================
     */
    @Test
    void shouldRejectZeroTrendDays() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> dashboardAnalyticsService
                                .getDashboard(0)
                );

        assertEquals(
                DashboardApiConstants.INVALID_TREND_DAYS,
                exception.getMessage()
        );

        verifyNoInteractions(
                dashboardAnalyticsRepository
        );
    }


    /**
     * ==============================================================
     * Test 5: Reject Negative Trend Days
     * ==============================================================
     */
    @Test
    void shouldRejectNegativeTrendDays() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> dashboardAnalyticsService
                                .getDashboard(-1)
                );

        assertEquals(
                DashboardApiConstants.INVALID_TREND_DAYS,
                exception.getMessage()
        );

        verifyNoInteractions(
                dashboardAnalyticsRepository
        );
    }


    /**
     * ==============================================================
     * Test 6: Reject Trend Days Greater Than Maximum
     * ==============================================================
     */
    @Test
    void shouldRejectTrendDaysGreaterThanMaximum() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> dashboardAnalyticsService
                                .getDashboard(366)
                );

        assertEquals(
                DashboardApiConstants.INVALID_TREND_DAYS,
                exception.getMessage()
        );

        verifyNoInteractions(
                dashboardAnalyticsRepository
        );
    }
}