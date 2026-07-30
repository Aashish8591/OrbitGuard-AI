package com.orbitguard.debris.specification;

import com.orbitguard.debris.entity.SpaceDebris;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Builds MongoDB queries for the Space Debris module.
 *
 * <p>
 * Responsibilities:
 * <ul>
 *     <li>Search</li>
 *     <li>Filtering</li>
 *     <li>Soft Delete Filtering</li>
 * </ul>
 *
 * Pagination and Sorting are applied separately
 * using Pageable.
 *
 * This class keeps the Service layer clean by
 * encapsulating MongoDB Criteria creation.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class DebrisQueryBuilder {

    /**
     * Builds a MongoDB query for searching active debris.
     *
     * Search is performed against:
     * - debrisName
     * - debrisCode
     * - noradId
     *
     * @param search search keyword
     * @return MongoDB Query
     */
    public Query buildSearchQuery(String search) {

        Query query = new Query();

        // Always exclude soft-deleted records.
        query.addCriteria(Criteria.where("isActive").is(true));

        if (search == null || search.isBlank()) {
            return query;
        }

        String keyword = Pattern.quote(search.trim());

        List<Criteria> criteriaList = new ArrayList<>();

        // Search by Debris Name (case-insensitive)
        criteriaList.add(
                Criteria.where("debrisName")
                        .regex(keyword, "i")
        );

        // Search by Debris Code (case-insensitive)
        criteriaList.add(
                Criteria.where("debrisCode")
                        .regex(keyword, "i")
        );

        // Search by NORAD ID (only if numeric)
        if (search.matches("\\d+")) {
            criteriaList.add(
                    Criteria.where("noradId")
                            .is(Long.parseLong(search))
            );
        }

        query.addCriteria(
                new Criteria().orOperator(
                        criteriaList.toArray(new Criteria[0])
                )
        );

        return query;
    }

}