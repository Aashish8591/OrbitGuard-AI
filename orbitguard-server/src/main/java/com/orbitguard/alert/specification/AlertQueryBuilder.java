package com.orbitguard.alert.specification;

import com.orbitguard.alert.dto.request.AlertSearchRequest;
import com.orbitguard.alert.entity.Alert;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * ==============================================================
 * Alert Query Builder
 * ==============================================================
 *
 * Builds dynamic MongoDB queries for searching
 * and filtering Alert records.
 *
 * Supported Filters:
 *
 * • Search
 * • Severity
 * • Status
 * • Source
 * • Type
 * • Risk
 * • Satellite
 * • Debris
 * • Date Range
 *
 * Soft deleted records are excluded automatically.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class AlertQueryBuilder {

    /**
     * ----------------------------------------------------------
     * Build Dynamic Query
     * ----------------------------------------------------------
     *
     * @param request Alert Search Request
     * @return Mongo Query
     */
    public Query buildQuery(AlertSearchRequest request) {

        Query query = new Query();

        List<Criteria> criteriaList = new ArrayList<>();

        /*
         * ------------------------------------------------------
         * Soft Delete Filter
         * ------------------------------------------------------
         */
        criteriaList.add(
                Criteria.where("isActive").is(true)
        );

        /*
         * ------------------------------------------------------
         * Search
         * ------------------------------------------------------
         */
        if (request != null
                && request.getSearch() != null
                && !request.getSearch().isBlank()) {

            criteriaList.add(
                    new Criteria().orOperator(

                            Criteria.where("alertCode")
                                    .regex(request.getSearch(), "i"),

                            Criteria.where("title")
                                    .regex(request.getSearch(), "i"),

                            Criteria.where("message")
                                    .regex(request.getSearch(), "i")
                    )
            );
        }

        /*
         * ------------------------------------------------------
         * Severity
         * ------------------------------------------------------
         */
        if (request != null && request.getSeverity() != null) {

            criteriaList.add(
                    Criteria.where("severity")
                            .is(request.getSeverity())
            );
        }

        /*
         * ------------------------------------------------------
         * Status
         * ------------------------------------------------------
         */
        if (request != null && request.getStatus() != null) {

            criteriaList.add(
                    Criteria.where("status")
                            .is(request.getStatus())
            );
        }

        /*
         * ------------------------------------------------------
         * Source
         * ------------------------------------------------------
         */
        if (request != null && request.getSource() != null) {

            criteriaList.add(
                    Criteria.where("source")
                            .is(request.getSource())
            );
        }

        /*
         * ------------------------------------------------------
         * Type
         * ------------------------------------------------------
         */
        if (request != null && request.getType() != null) {

            criteriaList.add(
                    Criteria.where("type")
                            .is(request.getType())
            );
        }

        /*
         * ------------------------------------------------------
         * Risk ID
         * ------------------------------------------------------
         */
        if (request != null
                && request.getRiskId() != null
                && !request.getRiskId().isBlank()) {

            criteriaList.add(
                    Criteria.where("riskId")
                            .is(request.getRiskId())
            );
        }

        /*
         * ------------------------------------------------------
         * Satellite ID
         * ------------------------------------------------------
         */
        if (request != null
                && request.getSatelliteId() != null
                && !request.getSatelliteId().isBlank()) {

            criteriaList.add(
                    Criteria.where("satelliteId")
                            .is(request.getSatelliteId())
            );
        }

        /*
         * ------------------------------------------------------
         * Debris ID
         * ------------------------------------------------------
         */
        if (request != null
                && request.getDebrisId() != null
                && !request.getDebrisId().isBlank()) {

            criteriaList.add(
                    Criteria.where("debrisId")
                            .is(request.getDebrisId())
            );
        }

        /*
         * ------------------------------------------------------
         * Date Range
         * ------------------------------------------------------
         */
        if (request != null) {

            if (request.getFromDate() != null
                    && request.getToDate() != null) {

                criteriaList.add(
                        Criteria.where("generatedAt")
                                .gte(request.getFromDate())
                                .lte(request.getToDate())
                );

            } else if (request.getFromDate() != null) {

                criteriaList.add(
                        Criteria.where("generatedAt")
                                .gte(request.getFromDate())
                );

            } else if (request.getToDate() != null) {

                criteriaList.add(
                        Criteria.where("generatedAt")
                                .lte(request.getToDate())
                );
            }
        }

        /*
         * ------------------------------------------------------
         * Apply Criteria
         * ------------------------------------------------------
         */
        if (!criteriaList.isEmpty()) {

            query.addCriteria(
                    new Criteria().andOperator(
                            criteriaList.toArray(new Criteria[0])
                    )
            );
        }

        return query;
    }

}