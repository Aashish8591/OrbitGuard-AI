package com.orbitguard.risk.repository;

import com.orbitguard.risk.entity.CollisionRisk;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollisionRiskRepository extends MongoRepository<CollisionRisk, String> {

    /**
     * Find active risk assessment by ID.
     */
    Optional<CollisionRisk> findByIdAndIsActiveTrue(String id);

    /**
     * Find active risk assessment by Risk Code.
     */
    Optional<CollisionRisk> findByRiskCodeAndIsActiveTrue(String riskCode);

    /**
     * Check whether Risk Code already exists.
     */
    boolean existsByRiskCode(String riskCode);

}