package com.orbitguard.risk.specification;

import com.orbitguard.risk.enums.AssessmentType;
import com.orbitguard.risk.enums.RiskLevel;
import com.orbitguard.risk.enums.RiskStatus;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Component
public class RiskQueryBuilder {

    public Query buildQuery(
            String search,
            RiskLevel riskLevel,
            RiskStatus status,
            AssessmentType assessmentType,
            String satelliteId,
            String debrisId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {

        Query query = new Query();

        /*
         * Soft Delete Filter
         */
        query.addCriteria(Criteria.where("isActive").is(true));

        /*
         * Search
         */
        if (search != null && !search.isBlank()) {

            String regex = ".*" + Pattern.quote(search.trim()) + ".*";

            query.addCriteria(new Criteria().orOperator(

                    Criteria.where("riskCode").regex(regex, "i"),

                    Criteria.where("recommendation").regex(regex, "i"),

                    Criteria.where("remarks").regex(regex, "i")

            ));
        }

        /*
         * Risk Level
         */
        if (riskLevel != null) {
            query.addCriteria(Criteria.where("riskLevel").is(riskLevel));
        }

        /*
         * Status
         */
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        /*
         * Assessment Type
         */
        if (assessmentType != null) {
            query.addCriteria(Criteria.where("assessmentType").is(assessmentType));
        }

        /*
         * Satellite
         */
        if (satelliteId != null && !satelliteId.isBlank()) {
            query.addCriteria(Criteria.where("satelliteId").is(satelliteId));
        }

        /*
         * Debris
         */
        if (debrisId != null && !debrisId.isBlank()) {
            query.addCriteria(Criteria.where("debrisId").is(debrisId));
        }

        /*
         * Date Range
         */
        if (fromDate != null && toDate != null) {

            query.addCriteria(
                    Criteria.where("assessedAt")
                            .gte(fromDate)
                            .lte(toDate)
            );

        } else if (fromDate != null) {

            query.addCriteria(
                    Criteria.where("assessedAt")
                            .gte(fromDate)
            );

        } else if (toDate != null) {

            query.addCriteria(
                    Criteria.where("assessedAt")
                            .lte(toDate)
            );
        }

        return query;
    }

}