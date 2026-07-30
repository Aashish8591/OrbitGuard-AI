package com.orbitguard.debris.repository;

import com.orbitguard.debris.entity.SpaceDebris;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing Space Debris documents.
 *
 * <p>
 * Provides database access operations for:
 * <ul>
 *     <li>CRUD Operations</li>
 *     <li>Duplicate Validation</li>
 *     <li>Soft Delete</li>
 *     <li>Searching</li>
 *     <li>Pagination & Sorting (via MongoRepository)</li>
 * </ul>
 * </p>
 *
 * Custom business logic should NOT be implemented here.
 * It belongs in the Service layer.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Repository
public interface DebrisRepository extends MongoRepository<SpaceDebris, String> {

    /**
     * Checks whether a NORAD ID already exists.
     *
     * Used during Create operation.
     */
    boolean existsByNoradId(Long noradId);

    /**
     * Checks whether a Business Code already exists.
     */
    boolean existsByDebrisCode(String debrisCode);

    /**
     * Finds an active debris by Mongo ID.
     */
    Optional<SpaceDebris> findByIdAndIsActiveTrue(String id);

    /**
     * Finds an active debris by Business Code.
     */
    Optional<SpaceDebris> findByDebrisCodeAndIsActiveTrue(String debrisCode);

    /**
     * Finds an active debris by NORAD ID.
     */
    Optional<SpaceDebris> findByNoradIdAndIsActiveTrue(Long noradId);

}