package com.orbitguard.dashboard.repository.impl;

import com.orbitguard.dashboard.constants.DashboardApiConstants;
import com.orbitguard.dashboard.dto.response.DashboardAlertAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardOverviewResponse;
import com.orbitguard.dashboard.dto.response.DashboardRiskAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardSatelliteAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardTrendResponse;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardAnalyticsRepositoryImplTest {

    @Mock
    private MongoTemplate mongoTemplate;

    private DashboardAnalyticsRepositoryImpl repository;

    @BeforeEach
    void setUp() {
        repository = new DashboardAnalyticsRepositoryImpl(mongoTemplate);
    }


    // ==============================================================
    // getOverview()
    // ==============================================================

    @Test
    void shouldGetOverviewSuccessfully() {

        when(mongoTemplate.count(
                any(),
                eq(DashboardApiConstants.SATELLITES_COLLECTION)
        )).thenReturn(10L);

        when(mongoTemplate.count(
                any(),
                eq(DashboardApiConstants.SPACE_DEBRIS_COLLECTION)
        )).thenReturn(20L);

        when(mongoTemplate.count(
                any(),
                eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION)
        ))
                .thenReturn(15L)
                .thenReturn(5L)
                .thenReturn(2L);

        when(mongoTemplate.count(
                any(),
                eq(DashboardApiConstants.ALERTS_COLLECTION)
        ))
                .thenReturn(8L)
                .thenReturn(3L);

        DashboardOverviewResponse response =
                repository.getOverview();

        assertNotNull(response);

        assertEquals(10L, response.getTotalSatellites());
        assertEquals(20L, response.getTotalDebris());
        assertEquals(15L, response.getTotalRisks());
        assertEquals(5L, response.getHighRisks());
        assertEquals(2L, response.getCriticalRisks());
        assertEquals(8L, response.getTotalAlerts());
        assertEquals(3L, response.getPendingAlerts());

        verify(mongoTemplate, times(1))
                .count(
                        any(),
                        eq(DashboardApiConstants.SATELLITES_COLLECTION)
                );

        verify(mongoTemplate, times(1))
                .count(
                        any(),
                        eq(DashboardApiConstants.SPACE_DEBRIS_COLLECTION)
                );

        verify(mongoTemplate, times(3))
                .count(
                        any(),
                        eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION)
                );

        verify(mongoTemplate, times(2))
                .count(
                        any(),
                        eq(DashboardApiConstants.ALERTS_COLLECTION)
                );
    }


    // ==============================================================
    // getSatelliteAnalytics()
    // ==============================================================

    @Test
    void shouldGetSatelliteAnalyticsSuccessfully() {

        Document leo =
                new Document("_id", "LEO")
                        .append("count", 10);

        Document geo =
                new Document("_id", "GEO")
                        .append("count", 5);

        Document active =
                new Document("_id", "ACTIVE")
                        .append("count", 12);

        Document inactive =
                new Document("_id", "INACTIVE")
                        .append("count", 3);

        AggregationResults<Document> orbitResults =
                new AggregationResults<>(
                        List.of(leo, geo),
                        new Document()
                );

        AggregationResults<Document> missionResults =
                new AggregationResults<>(
                        List.of(active, inactive),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.SATELLITES_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(orbitResults)
                .thenReturn(missionResults);

        DashboardSatelliteAnalyticsResponse response =
                repository.getSatelliteAnalytics();

        assertNotNull(response);

        assertNotNull(response.getByOrbitType());
        assertNotNull(response.getByMissionStatus());

        assertEquals(2, response.getByOrbitType().size());
        assertEquals(2, response.getByMissionStatus().size());

        assertEquals(
                "LEO",
                response.getByOrbitType().get(0).getLabel()
        );

        assertEquals(
                10L,
                response.getByOrbitType().get(0).getCount()
        );

        assertEquals(
                "GEO",
                response.getByOrbitType().get(1).getLabel()
        );

        assertEquals(
                5L,
                response.getByOrbitType().get(1).getCount()
        );

        assertEquals(
                "ACTIVE",
                response.getByMissionStatus().get(0).getLabel()
        );

        assertEquals(
                12L,
                response.getByMissionStatus().get(0).getCount()
        );

        assertEquals(
                "INACTIVE",
                response.getByMissionStatus().get(1).getLabel()
        );

        assertEquals(
                3L,
                response.getByMissionStatus().get(1).getCount()
        );

        verify(mongoTemplate, times(2))
                .aggregate(
                        ArgumentMatchers.any(Aggregation.class),
                        eq(DashboardApiConstants.SATELLITES_COLLECTION),
                        eq(Document.class)
                );
    }


    // ==============================================================
    // getRiskAnalytics()
    // ==============================================================

    @Test
    void shouldGetRiskAnalyticsSuccessfully() {

        Document low =
                new Document("_id", "LOW")
                        .append("count", 20);

        Document high =
                new Document("_id", "HIGH")
                        .append("count", 5);

        Document analyzed =
                new Document("_id", "ANALYZED")
                        .append("count", 18);

        Document pending =
                new Document("_id", "PENDING")
                        .append("count", 7);

        AggregationResults<Document> riskLevelResults =
                new AggregationResults<>(
                        List.of(low, high),
                        new Document()
                );

        AggregationResults<Document> riskStatusResults =
                new AggregationResults<>(
                        List.of(analyzed, pending),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(riskLevelResults)
                .thenReturn(riskStatusResults);

        DashboardRiskAnalyticsResponse response =
                repository.getRiskAnalytics();

        assertNotNull(response);

        assertNotNull(response.getByRiskLevel());
        assertNotNull(response.getByRiskStatus());

        assertEquals(2, response.getByRiskLevel().size());
        assertEquals(2, response.getByRiskStatus().size());

        assertEquals(
                "LOW",
                response.getByRiskLevel().get(0).getLabel()
        );

        assertEquals(
                20L,
                response.getByRiskLevel().get(0).getCount()
        );

        assertEquals(
                "HIGH",
                response.getByRiskLevel().get(1).getLabel()
        );

        assertEquals(
                5L,
                response.getByRiskLevel().get(1).getCount()
        );

        assertEquals(
                "ANALYZED",
                response.getByRiskStatus().get(0).getLabel()
        );

        assertEquals(
                18L,
                response.getByRiskStatus().get(0).getCount()
        );

        assertEquals(
                "PENDING",
                response.getByRiskStatus().get(1).getLabel()
        );

        assertEquals(
                7L,
                response.getByRiskStatus().get(1).getCount()
        );

        verify(mongoTemplate, times(2))
                .aggregate(
                        ArgumentMatchers.any(Aggregation.class),
                        eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION),
                        eq(Document.class)
                );
    }


    // ==============================================================
    // getAlertAnalytics()
    // ==============================================================

    @Test
    void shouldGetAlertAnalyticsSuccessfully() {

        Document highSeverity =
                new Document("_id", "HIGH")
                        .append("count", 6);

        Document criticalSeverity =
                new Document("_id", "CRITICAL")
                        .append("count", 2);

        Document pendingStatus =
                new Document("_id", "PENDING")
                        .append("count", 5);

        Document resolvedStatus =
                new Document("_id", "RESOLVED")
                        .append("count", 3);

        Document riskType =
                new Document("_id", "RISK")
                        .append("count", 7);

        Document warningType =
                new Document("_id", "WARNING")
                        .append("count", 1);

        AggregationResults<Document> severityResults =
                new AggregationResults<>(
                        List.of(highSeverity, criticalSeverity),
                        new Document()
                );

        AggregationResults<Document> statusResults =
                new AggregationResults<>(
                        List.of(pendingStatus, resolvedStatus),
                        new Document()
                );

        AggregationResults<Document> typeResults =
                new AggregationResults<>(
                        List.of(riskType, warningType),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.ALERTS_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(severityResults)
                .thenReturn(statusResults)
                .thenReturn(typeResults);

        DashboardAlertAnalyticsResponse response =
                repository.getAlertAnalytics();

        assertNotNull(response);

        assertNotNull(response.getBySeverity());
        assertNotNull(response.getByStatus());
        assertNotNull(response.getByType());

        assertEquals(2, response.getBySeverity().size());
        assertEquals(2, response.getByStatus().size());
        assertEquals(2, response.getByType().size());

        assertEquals(
                "HIGH",
                response.getBySeverity().get(0).getLabel()
        );

        assertEquals(
                6L,
                response.getBySeverity().get(0).getCount()
        );

        assertEquals(
                "CRITICAL",
                response.getBySeverity().get(1).getLabel()
        );

        assertEquals(
                2L,
                response.getBySeverity().get(1).getCount()
        );

        assertEquals(
                "PENDING",
                response.getByStatus().get(0).getLabel()
        );

        assertEquals(
                5L,
                response.getByStatus().get(0).getCount()
        );

        assertEquals(
                "RESOLVED",
                response.getByStatus().get(1).getLabel()
        );

        assertEquals(
                3L,
                response.getByStatus().get(1).getCount()
        );

        assertEquals(
                "RISK",
                response.getByType().get(0).getLabel()
        );

        assertEquals(
                7L,
                response.getByType().get(0).getCount()
        );

        assertEquals(
                "WARNING",
                response.getByType().get(1).getLabel()
        );

        assertEquals(
                1L,
                response.getByType().get(1).getCount()
        );

        verify(mongoTemplate, times(3))
                .aggregate(
                        ArgumentMatchers.any(Aggregation.class),
                        eq(DashboardApiConstants.ALERTS_COLLECTION),
                        eq(Document.class)
                );
    }


    // ==============================================================
    // getRiskTrends()
    // ==============================================================

    @Test
    void shouldGetRiskTrendsWithContinuousDateSeries() {

        LocalDate fromDate =
                LocalDate.of(2026, 9, 1);

        LocalDate toDate =
                LocalDate.of(2026, 9, 3);

        Document firstDay =
                new Document("_id", "2026-09-01")
                        .append("count", 3);

        Document thirdDay =
                new Document("_id", "2026-09-03")
                        .append("count", 5);

        AggregationResults<Document> aggregationResults =
                new AggregationResults<>(
                        List.of(firstDay, thirdDay),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION),
                eq(Document.class)
        )).thenReturn(aggregationResults);

        List<DashboardTrendResponse> response =
                repository.getRiskTrends(
                        fromDate,
                        toDate
                );

        assertNotNull(response);

        assertEquals(3, response.size());

        assertEquals(
                LocalDate.of(2026, 9, 1),
                response.get(0).getDate()
        );

        assertEquals(
                3L,
                response.get(0).getCount()
        );

        assertEquals(
                LocalDate.of(2026, 9, 2),
                response.get(1).getDate()
        );

        assertEquals(
                0L,
                response.get(1).getCount()
        );

        assertEquals(
                LocalDate.of(2026, 9, 3),
                response.get(2).getDate()
        );

        assertEquals(
                5L,
                response.get(2).getCount()
        );

        verify(mongoTemplate, times(1))
                .aggregate(
                        ArgumentMatchers.any(Aggregation.class),
                        eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION),
                        eq(Document.class)
                );
    }


    @Test
    void shouldReturnZeroCountsWhenNoRiskTrendDataExists() {

        LocalDate fromDate =
                LocalDate.of(2026, 9, 1);

        LocalDate toDate =
                LocalDate.of(2026, 9, 3);

        AggregationResults<Document> aggregationResults =
                new AggregationResults<>(
                        List.of(),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION),
                eq(Document.class)
        )).thenReturn(aggregationResults);

        List<DashboardTrendResponse> response =
                repository.getRiskTrends(
                        fromDate,
                        toDate
                );

        assertNotNull(response);
        assertEquals(3, response.size());

        assertEquals(
                LocalDate.of(2026, 9, 1),
                response.get(0).getDate()
        );

        assertEquals(
                0L,
                response.get(0).getCount()
        );

        assertEquals(
                LocalDate.of(2026, 9, 2),
                response.get(1).getDate()
        );

        assertEquals(
                0L,
                response.get(1).getCount()
        );

        assertEquals(
                LocalDate.of(2026, 9, 3),
                response.get(2).getDate()
        );

        assertEquals(
                0L,
                response.get(2).getCount()
        );
    }


    // ==============================================================
    // Date validation
    // ==============================================================

    @Test
    void shouldRejectNullFromDate() {

        LocalDate toDate =
                LocalDate.of(2026, 9, 3);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> repository.getRiskTrends(
                                null,
                                toDate
                        )
                );

        assertEquals(
                "Risk trend dates must not be null.",
                exception.getMessage()
        );

        verifyNoInteractions(mongoTemplate);
    }


    @Test
    void shouldRejectNullToDate() {

        LocalDate fromDate =
                LocalDate.of(2026, 9, 1);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> repository.getRiskTrends(
                                fromDate,
                                null
                        )
                );

        assertEquals(
                "Risk trend dates must not be null.",
                exception.getMessage()
        );

        verifyNoInteractions(mongoTemplate);
    }


    @Test
    void shouldRejectInvalidDateRange() {

        LocalDate fromDate =
                LocalDate.of(2026, 9, 5);

        LocalDate toDate =
                LocalDate.of(2026, 9, 1);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> repository.getRiskTrends(
                                fromDate,
                                toDate
                        )
                );

        assertEquals(
                "Risk trend start date must not be after end date.",
                exception.getMessage()
        );

        verifyNoInteractions(mongoTemplate);
    }


    // ==============================================================
    // Empty aggregation handling
    // ==============================================================

    @Test
    void shouldReturnEmptySatelliteAnalyticsWhenNoResultsExist() {

        AggregationResults<Document> emptyResults =
                new AggregationResults<>(
                        List.of(),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.SATELLITES_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(emptyResults)
                .thenReturn(emptyResults);

        DashboardSatelliteAnalyticsResponse response =
                repository.getSatelliteAnalytics();

        assertNotNull(response);

        assertNotNull(response.getByOrbitType());
        assertNotNull(response.getByMissionStatus());

        assertTrue(response.getByOrbitType().isEmpty());
        assertTrue(response.getByMissionStatus().isEmpty());
    }


    @Test
    void shouldReturnEmptyRiskAnalyticsWhenNoResultsExist() {

        AggregationResults<Document> emptyResults =
                new AggregationResults<>(
                        List.of(),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.COLLISION_RISKS_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(emptyResults)
                .thenReturn(emptyResults);

        DashboardRiskAnalyticsResponse response =
                repository.getRiskAnalytics();

        assertNotNull(response);

        assertNotNull(response.getByRiskLevel());
        assertNotNull(response.getByRiskStatus());

        assertTrue(response.getByRiskLevel().isEmpty());
        assertTrue(response.getByRiskStatus().isEmpty());
    }


    @Test
    void shouldReturnEmptyAlertAnalyticsWhenNoResultsExist() {

        AggregationResults<Document> emptyResults =
                new AggregationResults<>(
                        List.of(),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.ALERTS_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(emptyResults)
                .thenReturn(emptyResults)
                .thenReturn(emptyResults);

        DashboardAlertAnalyticsResponse response =
                repository.getAlertAnalytics();

        assertNotNull(response);

        assertNotNull(response.getBySeverity());
        assertNotNull(response.getByStatus());
        assertNotNull(response.getByType());

        assertTrue(response.getBySeverity().isEmpty());
        assertTrue(response.getByStatus().isEmpty());
        assertTrue(response.getByType().isEmpty());
    }


    // ==============================================================
    // Invalid aggregation document
    // ==============================================================

    @Test
    void shouldIgnoreInvalidAggregationDocuments() {

        Document validDocument =
                new Document("_id", "LEO")
                        .append("count", 10);

        Document invalidDocument =
                new Document("_id", null)
                        .append("count", 5);

        AggregationResults<Document> orbitResults =
                new AggregationResults<>(
                        List.of(validDocument, invalidDocument),
                        new Document()
                );

        AggregationResults<Document> missionResults =
                new AggregationResults<>(
                        List.of(),
                        new Document()
                );

        when(mongoTemplate.aggregate(
                ArgumentMatchers.any(Aggregation.class),
                eq(DashboardApiConstants.SATELLITES_COLLECTION),
                eq(Document.class)
        ))
                .thenReturn(orbitResults)
                .thenReturn(missionResults);

        DashboardSatelliteAnalyticsResponse response =
                repository.getSatelliteAnalytics();

        assertNotNull(response);

        assertEquals(1, response.getByOrbitType().size());

        assertEquals(
                "LEO",
                response.getByOrbitType().get(0).getLabel()
        );

        assertEquals(
                10L,
                response.getByOrbitType().get(0).getCount()
        );
    }
}