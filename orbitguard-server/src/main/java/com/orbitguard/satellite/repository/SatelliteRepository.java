package com.orbitguard.satellite.repository;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing Satellite documents.
 *
 * <p>
 * Provides database access operations for:
 * </p>
 *
 * <ul>
 *     <li>CRUD operations</li>
 *     <li>Duplicate validation</li>
 *     <li>Active satellite retrieval</li>
 *     <li>Searching and filtering</li>
 *     <li>Pagination and sorting</li>
 *     <li>NORAD-based lookup</li>
 * </ul>
 *
 * <p>
 * Custom business logic belongs in the service layer and should not
 * be implemented in this repository.
 * </p>
 */
@Repository
public interface SatelliteRepository
        extends MongoRepository<Satellite, String> {

    /**
     * Finds a satellite by its unique business code.
     *
     * @param satelliteCode unique satellite business code
     * @return satellite if found
     */
    Optional<Satellite> findBySatelliteCode(
            String satelliteCode
    );

    /**
     * Checks whether a satellite business code already exists.
     *
     * @param satelliteCode satellite business code
     * @return true if the code exists
     */
    boolean existsBySatelliteCode(
            String satelliteCode
    );

    /**
     * Finds an active satellite by its MongoDB document ID.
     *
     * @param id MongoDB document ID
     * @return active satellite if found
     */
    Optional<Satellite> findByIdAndActiveTrue(
            String id
    );

    /**
     * Finds an active satellite by its business code.
     *
     * @param satelliteCode satellite business code
     * @return active satellite if found
     */
    Optional<Satellite> findBySatelliteCodeAndActiveTrue(
            String satelliteCode
    );

    /**
     * Gets all active satellites.
     *
     * <p>
     * This method is also used by the bulk 3D visualization
     * propagation flow. The visualization pipeline reads the
     * orbital elements already stored in MongoDB and passes them
     * to the existing SGP4/Orekit propagation engine.
     * </p>
     *
     * <p>
     * This avoids making an individual CelesTrak request for every
     * satellite during 3D visualization.
     * </p>
     *
     * @return all active satellites
     */
    List<Satellite> findByActiveTrue();

    /**
     * Gets all active satellites with pagination.
     *
     * @param pageable pagination and sorting configuration
     * @return paginated active satellites
     */
    Page<Satellite> findByActiveTrue(
            Pageable pageable
    );

    /**
     * Searches active satellites by name.
     *
     * @param keyword search keyword
     * @param pageable pagination and sorting configuration
     * @return matching active satellites
     */
    Page<Satellite>
    findByActiveTrueAndSatelliteNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    /**
     * Filters active satellites by mission status.
     *
     * @param missionStatus mission status
     * @return matching active satellites
     */
    List<Satellite> findByMissionStatusAndActiveTrue(
            MissionStatus missionStatus
    );

    /**
     * Filters active satellites by orbit type.
     *
     * @param orbitType orbit type
     * @return matching active satellites
     */
    List<Satellite> findByOrbitTypeAndActiveTrue(
            OrbitType orbitType
    );

    /**
     * Finds a satellite by its NORAD catalog ID.
     *
     * <p>
     * Used during CelesTrak synchronization to determine whether
     * a satellite already exists.
     * </p>
     *
     * @param noradCatalogId NORAD catalog ID
     * @return satellite if found
     */
    Optional<Satellite> findByNoradCatalogId(
            Integer noradCatalogId
    );
}