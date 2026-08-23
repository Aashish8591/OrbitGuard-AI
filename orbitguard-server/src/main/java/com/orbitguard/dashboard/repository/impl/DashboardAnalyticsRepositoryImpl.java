package com.orbitguard.dashboard.repository.impl;

import com.orbitguard.alert.enums.AlertStatus;
import com.orbitguard.dashboard.constants.DashboardApiConstants;
import com.orbitguard.dashboard.dto.response.DashboardAlertAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardCountResponse;
import com.orbitguard.dashboard.dto.response.DashboardOverviewResponse;
import com.orbitguard.dashboard.dto.response.DashboardRiskAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardSatelliteAnalyticsResponse;
import com.orbitguard.dashboard.dto.response.DashboardTrendResponse;
import com.orbitguard.dashboard.repository.DashboardAnalyticsRepository;
import com.orbitguard.risk.enums.RiskLevel;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.DateOperators;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==============================================================
 * Dashboard Analytics Repository Implementation
 * ==============================================================
 *
 * MongoDB implementation of the Dashboard Analytics Repository.
 *
 * The Dashboard module does NOT own a MongoDB collection.
 *
 * This implementation reads and aggregates data from:
 *
 * - satellites
 * - space_debris
 * - collision_risks
 * - alerts
 *
 * Responsibilities:
 *
 * - Execute MongoDB count queries
 * - Execute MongoDB aggregation pipelines
 * - Build dashboard analytics DTOs
 * - Provide risk trend data
 *
 * Business workflow orchestration does NOT belong here.
 * It belongs in DashboardAnalyticsServiceImpl.
 *
 * Module : Dashboard Analytics
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Repository
@RequiredArgsConstructor
public class DashboardAnalyticsRepositoryImpl
        implements DashboardAnalyticsRepository {

    /**
     * MongoDB access layer.
     */
    private final MongoTemplate mongoTemplate;


    /**
     * ==============================================================
     * Get Dashboard Overview
     * ==============================================================
     *
     * Retrieves high-level dashboard KPI statistics.
     *
     * Active flags are respected according to the
     * existing entity definitions:
     *
     * Satellite:
     *     active = true
     *
     * Debris:
     *     isActive = true
     *
     * Risk:
     *     isActive = true
     *
     * Alert:
     *     isActive = true
     *
     * @return dashboard overview
     */
    @Override
    public DashboardOverviewResponse getOverview() {

        long totalSatellites =
                countActiveRecords(
                        DashboardApiConstants.SATELLITES_COLLECTION,
                        DashboardApiConstants.FIELD_ACTIVE
                );

        long totalDebris =
                countActiveRecords(
                        DashboardApiConstants.SPACE_DEBRIS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE
                );

        long totalRisks =
                countActiveRecords(
                        DashboardApiConstants.COLLISION_RISKS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE
                );

        long highRisks =
                countActiveRecordsByFieldValue(
                        DashboardApiConstants.COLLISION_RISKS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_RISK_LEVEL,
                        RiskLevel.HIGH.name()
                );

        long criticalRisks =
                countActiveRecordsByFieldValue(
                        DashboardApiConstants.COLLISION_RISKS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_RISK_LEVEL,
                        RiskLevel.CRITICAL.name()
                );

        long totalAlerts =
                countActiveRecords(
                        DashboardApiConstants.ALERTS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE
                );

        long pendingAlerts =
                countActiveRecordsByFieldValue(
                        DashboardApiConstants.ALERTS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_ALERT_STATUS,
                        AlertStatus.PENDING.name()
                );

        return DashboardOverviewResponse.builder()
                .totalSatellites(totalSatellites)
                .totalDebris(totalDebris)
                .totalRisks(totalRisks)
                .highRisks(highRisks)
                .criticalRisks(criticalRisks)
                .totalAlerts(totalAlerts)
                .pendingAlerts(pendingAlerts)
                .build();
    }


    /**
     * ==============================================================
     * Get Satellite Analytics
     * ==============================================================
     *
     * Retrieves satellite distributions by:
     *
     * - Orbit type
     * - Mission status
     *
     * Only active satellites are included.
     *
     * @return satellite analytics
     */
    @Override
    public DashboardSatelliteAnalyticsResponse
    getSatelliteAnalytics() {

        List<DashboardCountResponse> byOrbitType =
                aggregateCounts(
                        DashboardApiConstants.SATELLITES_COLLECTION,
                        DashboardApiConstants.FIELD_ACTIVE,
                        DashboardApiConstants.FIELD_ORBIT_TYPE
                );

        List<DashboardCountResponse> byMissionStatus =
                aggregateCounts(
                        DashboardApiConstants.SATELLITES_COLLECTION,
                        DashboardApiConstants.FIELD_ACTIVE,
                        DashboardApiConstants.FIELD_MISSION_STATUS
                );

        return DashboardSatelliteAnalyticsResponse.builder()
                .byOrbitType(byOrbitType)
                .byMissionStatus(byMissionStatus)
                .build();
    }


    /**
     * ==============================================================
     * Get Risk Analytics
     * ==============================================================
     *
     * Retrieves collision-risk distributions by:
     *
     * - Risk level
     * - Risk status
     *
     * Only active risk assessments are included.
     *
     * @return risk analytics
     */
    @Override
    public DashboardRiskAnalyticsResponse
    getRiskAnalytics() {

        List<DashboardCountResponse> byRiskLevel =
                aggregateCounts(
                        DashboardApiConstants.COLLISION_RISKS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_RISK_LEVEL
                );

        List<DashboardCountResponse> byRiskStatus =
                aggregateCounts(
                        DashboardApiConstants.COLLISION_RISKS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_RISK_STATUS
                );

        return DashboardRiskAnalyticsResponse.builder()
                .byRiskLevel(byRiskLevel)
                .byRiskStatus(byRiskStatus)
                .build();
    }


    /**
     * ==============================================================
     * Get Alert Analytics
     * ==============================================================
     *
     * Retrieves alert distributions by:
     *
     * - Severity
     * - Status
     * - Type
     *
     * Only active alerts are included.
     *
     * @return alert analytics
     */
    @Override
    public DashboardAlertAnalyticsResponse
    getAlertAnalytics() {

        List<DashboardCountResponse> bySeverity =
                aggregateCounts(
                        DashboardApiConstants.ALERTS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_ALERT_SEVERITY
                );

        List<DashboardCountResponse> byStatus =
                aggregateCounts(
                        DashboardApiConstants.ALERTS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_ALERT_STATUS
                );

        List<DashboardCountResponse> byType =
                aggregateCounts(
                        DashboardApiConstants.ALERTS_COLLECTION,
                        DashboardApiConstants.FIELD_IS_ACTIVE,
                        DashboardApiConstants.FIELD_ALERT_TYPE
                );

        return DashboardAlertAnalyticsResponse.builder()
                .bySeverity(bySeverity)
                .byStatus(byStatus)
                .byType(byType)
                .build();
    }


    /**
     * ==============================================================
     * Get Risk Trends
     * ==============================================================
     *
     * Retrieves daily collision-risk assessment counts
     * between the requested dates.
     *
     * The CollisionRisk entity uses assessedAt as the
     * assessment timestamp, therefore assessedAt is used
     * for trend calculations.
     *
     * Missing dates are returned with count = 0 so that
     * dashboard charts receive a continuous date series.
     *
     * @param fromDate start date
     * @param toDate end date
     * @return daily risk trend analytics
     */
    @Override
    public List<DashboardTrendResponse> getRiskTrends(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        validateDateRange(fromDate, toDate);

        LocalDateTime startDateTime =
                fromDate.atStartOfDay();

        LocalDateTime endDateTime =
                toDate.plusDays(1).atStartOfDay();

        Criteria criteria =
                new Criteria()
                        .andOperator(
                                Criteria.where(
                                        DashboardApiConstants.FIELD_IS_ACTIVE
                                ).is(true),

                                Criteria.where(
                                        DashboardApiConstants.FIELD_ASSESSED_AT
                                ).gte(startDateTime).lt(endDateTime)
                        );

        /*
         * ----------------------------------------------------------
         * Convert assessedAt into YYYY-MM-DD
         * ----------------------------------------------------------
         *
         * Example:
         *
         * 2026-08-20T10:30:00
         *
         * becomes:
         *
         * 2026-08-20
         */
        Aggregation aggregation =
                Aggregation.newAggregation(

                        Aggregation.match(criteria),

                        Aggregation.project()
                                .and(
                                        DateOperators.DateToString
                                                .dateOf(
                                                        DashboardApiConstants.FIELD_ASSESSED_AT
                                                )
                                                .toString("%Y-%m-%d")
                                )
                                .as("date"),

                        Aggregation.group("date")
                                .count()
                                .as("count"),

                        Aggregation.sort(
                                Sort.by(
                                        Sort.Direction.ASC,
                                        "_id"
                                )
                        )
                );

        List<Document> results =
                mongoTemplate
                        .aggregate(
                                aggregation,
                                DashboardApiConstants.COLLISION_RISKS_COLLECTION,
                                Document.class
                        )
                        .getMappedResults();

        /*
         * ----------------------------------------------------------
         * Convert aggregation result into a date -> count map.
         * ----------------------------------------------------------
         */
        Map<LocalDate, Long> countByDate =
                new HashMap<>();

        for (Document document : results) {

            Object dateValue =
                    document.get("_id");

            Object countValue =
                    document.get("count");

            if (dateValue == null || countValue == null) {
                continue;
            }

            LocalDate date =
                    LocalDate.parse(
                            dateValue.toString()
                    );

            long count =
                    ((Number) countValue).longValue();

            countByDate.put(date, count);
        }

        /*
         * ----------------------------------------------------------
         * Build continuous trend series.
         * ----------------------------------------------------------
         *
         * Dates with no risk assessments receive zero.
         */
        List<DashboardTrendResponse> trends =
                new ArrayList<>();

        LocalDate currentDate = fromDate;

        while (!currentDate.isAfter(toDate)) {

            trends.add(
                    DashboardTrendResponse.builder()
                            .date(currentDate)
                            .count(
                                    countByDate.getOrDefault(
                                            currentDate,
                                            0L
                                    )
                            )
                            .build()
            );

            currentDate =
                    currentDate.plusDays(1);
        }

        return trends;
    }


    /**
     * ==============================================================
     * Count Active Records
     * ==============================================================
     *
     * Generic active-record count used by the overview.
     *
     * @param collectionName MongoDB collection
     * @param activeField active flag field
     * @return number of active records
     */
    private long countActiveRecords(
            String collectionName,
            String activeField
    ) {

        Query query =
                Query.query(
                        Criteria.where(activeField)
                                .is(true)
                );

        return mongoTemplate.count(
                query,
                collectionName
        );
    }


    /**
     * ==============================================================
     * Count Active Records By Field Value
     * ==============================================================
     *
     * Counts active documents matching a specific
     * field value.
     *
     * @param collectionName MongoDB collection
     * @param activeField active flag field
     * @param fieldName field to filter
     * @param fieldValue expected field value
     * @return matching active document count
     */
    private long countActiveRecordsByFieldValue(
            String collectionName,
            String activeField,
            String fieldName,
            Object fieldValue
    ) {

        Criteria criteria =
                new Criteria()
                        .andOperator(
                                Criteria.where(activeField)
                                        .is(true),

                                Criteria.where(fieldName)
                                        .is(fieldValue)
                        );

        Query query =
                Query.query(criteria);

        return mongoTemplate.count(
                query,
                collectionName
        );
    }


    /**
     * ==============================================================
     * Aggregate Counts
     * ==============================================================
     *
     * Performs a MongoDB group-and-count aggregation.
     *
     * Example:
     *
     * orbitType:
     *
     * LEO  -> 20
     * MEO  -> 10
     * GEO  -> 5
     *
     * @param collectionName MongoDB collection
     * @param activeField active flag field
     * @param groupField field used for grouping
     * @return label-count analytics
     */
    private List<DashboardCountResponse> aggregateCounts(
            String collectionName,
            String activeField,
            String groupField
    ) {

        Criteria criteria =
                new Criteria()
                        .andOperator(
                                Criteria.where(activeField)
                                        .is(true),

                                Criteria.where(groupField)
                                        .exists(true)
                                        .ne(null)
                        );

        Aggregation aggregation =
                Aggregation.newAggregation(

                        Aggregation.match(criteria),

                        Aggregation.group(groupField)
                                .count()
                                .as("count"),

                        Aggregation.sort(
                                Sort.by(
                                        Sort.Direction.ASC,
                                        "_id"
                                )
                        )
                );

        List<Document> results =
                mongoTemplate
                        .aggregate(
                                aggregation,
                                collectionName,
                                Document.class
                        )
                        .getMappedResults();

        List<DashboardCountResponse> responses =
                new ArrayList<>();

        for (Document document : results) {

            Object labelValue =
                    document.get("_id");

            Object countValue =
                    document.get("count");

            if (labelValue == null || countValue == null) {
                continue;
            }

            responses.add(
                    DashboardCountResponse.builder()
                            .label(labelValue.toString())
                            .count(
                                    ((Number) countValue)
                                            .longValue()
                            )
                            .build()
            );
        }

        return responses;
    }


    /**
     * ==============================================================
     * Validate Date Range
     * ==============================================================
     *
     * Ensures that both dates are present and that
     * the start date does not occur after the end date.
     *
     * @param fromDate start date
     * @param toDate end date
     */
    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate == null || toDate == null) {

            throw new IllegalArgumentException(
                    "Risk trend dates must not be null."
            );
        }

        if (fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "Risk trend start date must not be after end date."
            );
        }
    }
}