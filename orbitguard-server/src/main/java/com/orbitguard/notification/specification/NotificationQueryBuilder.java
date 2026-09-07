package com.orbitguard.notification.specification;

import com.orbitguard.notification.dto.request.NotificationFilterRequest;
import com.orbitguard.notification.dto.request.NotificationSearchRequest;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * ===============================================================
 * Notification Query Builder
 * ===============================================================
 *
 * Builds dynamic MongoDB queries for searching and filtering
 * Notification records.
 *
 * Supported Operations:
 *
 * <ul>
 *     <li>Keyword search</li>
 *     <li>Status filtering</li>
 *     <li>Priority filtering</li>
 *     <li>Type filtering</li>
 *     <li>Recipient filtering</li>
 *     <li>Soft-delete filtering</li>
 * </ul>
 *
 * Pagination and sorting are intentionally handled outside this
 * class through Spring Data Pageable.
 *
 * This class is responsible only for constructing MongoDB
 * query criteria.
 *
 * Module : Notification Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class NotificationQueryBuilder {

    /**
     * Builds a dynamic MongoDB query using search and filter
     * parameters.
     *
     * @param searchRequest search, pagination and sorting request
     * @param filterRequest notification filtering request
     * @return MongoDB query
     */
    public Query buildQuery(
            NotificationSearchRequest searchRequest,
            NotificationFilterRequest filterRequest) {

        Query query = new Query();

        List<Criteria> criteriaList = new ArrayList<>();

        /*
         * =========================================================
         * Soft Delete Filter
         * =========================================================
         *
         * Normal notification queries should only return active
         * records unless the caller explicitly requests inactive
         * records.
         */
        boolean isActive = true;

        if (filterRequest != null
                && filterRequest.getIsActive() != null) {

            isActive = filterRequest.getIsActive();
        }

        criteriaList.add(
                Criteria.where("isActive").is(isActive)
        );

        /*
         * =========================================================
         * Keyword Search
         * =========================================================
         *
         * Searches notification title and message.
         *
         * The keyword is escaped before being used as a regular
         * expression so that user input is treated as literal text.
         *
         * Search is case-insensitive.
         */
        if (searchRequest != null
                && searchRequest.getKeyword() != null
                && !searchRequest.getKeyword().isBlank()) {

            String keyword = searchRequest.getKeyword().trim();
            String escapedKeyword = Pattern.quote(keyword);

            criteriaList.add(
                    new Criteria().orOperator(

                            Criteria.where("title")
                                    .regex(escapedKeyword, "i"),

                            Criteria.where("message")
                                    .regex(escapedKeyword, "i")
                    )
            );
        }

        /*
         * =========================================================
         * Status Filter
         * =========================================================
         */
        if (filterRequest != null
                && filterRequest.getStatus() != null) {

            criteriaList.add(
                    Criteria.where("status")
                            .is(filterRequest.getStatus())
            );
        }

        /*
         * =========================================================
         * Priority Filter
         * =========================================================
         */
        if (filterRequest != null
                && filterRequest.getPriority() != null) {

            criteriaList.add(
                    Criteria.where("priority")
                            .is(filterRequest.getPriority())
            );
        }

        /*
         * =========================================================
         * Notification Type Filter
         * =========================================================
         */
        if (filterRequest != null
                && filterRequest.getType() != null) {

            criteriaList.add(
                    Criteria.where("type")
                            .is(filterRequest.getType())
            );
        }

        /*
         * =========================================================
         * Recipient Filter
         * =========================================================
         */
        if (filterRequest != null
                && filterRequest.getRecipientId() != null
                && !filterRequest.getRecipientId().isBlank()) {

            criteriaList.add(
                    Criteria.where("recipientId")
                            .is(filterRequest.getRecipientId().trim())
            );
        }

        /*
         * =========================================================
         * Apply Criteria
         * =========================================================
         *
         * All filter conditions are combined using AND.
         *
         * Keyword search itself uses OR between title and message.
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