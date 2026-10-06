package com.orbitguard.debris.repository;

import com.orbitguard.debris.entity.SpaceDebris;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing Space Debris documents.
 *
 * <p>
 * Provides database access operations for:
 * </p>
 *
 * <ul>
 *     <li>CRUD Operations</li>
 *     <li>Duplicate Validation</li>
 *     <li>Soft Delete</li>
 *     <li>Searching</li>
 *     <li>Active Debris Retrieval</li>
 *     <li>Pagination & Sorting (via MongoRepository)</li>
 * </ul>
 *
 * <p>
 * Custom business logic should NOT be implemented here.
 * It belongs in the Service layer.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Repository
public interface DebrisRepository extends MongoRepository<SpaceDebris, String> {

    /**
     * Checks whether a NORAD ID already exists.
     *
     * <p>
     * Used during Create operation.
     * </p>
     *
     * @param noradId NORAD identifier
     * @return true if the NORAD ID exists
     */
    boolean existsByNoradId(Long noradId);

    /**
     * Checks whether a Business Code already exists.
     *
     * @param debrisCode debris business code
     * @return true if the business code exists
     */
    boolean existsByDebrisCode(String debrisCode);

    /**
     * Finds an active debris by Mongo ID.
     *
     * @param id MongoDB document ID
     * @return active debris if found
     */
    Optional<SpaceDebris> findByIdAndIsActiveTrue(String id);

    /**
     * Finds an active debris by Business Code.
     *
     * @param debrisCode debris business code
     * @return active debris if found
     */
    Optional<SpaceDebris> findByDebrisCodeAndIsActiveTrue(
            String debrisCode
    );

    /**
     * Finds an active debris by NORAD ID.
     *
     * @param noradId NORAD identifier
     * @return active debris if found
     */
    Optional<SpaceDebris> findByNoradIdAndIsActiveTrue(
            Long noradId
    );

    /**
     * Finds all active debris objects.
     *
     * <p>
     * This method is used by the bulk 3D visualization propagation
     * flow. The visualization module reads the orbital elements
     * already stored in MongoDB instead of making individual
     * CelesTrak requests.
     * </p>
     *
     * @return list of all active debris objects
     */
    List<SpaceDebris> findByIsActiveTrue();

    /**
     * Finds debris by NORAD ID regardless of active status.
     *
     * <p>
     * Used by CelesTrak synchronization to avoid duplicate NORAD
     * records when a soft-deleted debris object already exists.
     * </p>
     *
     * @param noradId NORAD identifier
     * @return debris if found
     */
    Optional<SpaceDebris> findByNoradId(Long noradId);
}