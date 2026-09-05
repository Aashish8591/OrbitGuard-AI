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

@Repository
public interface SatelliteRepository extends MongoRepository<Satellite, String> {

    /**
     * Find satellite by unique code.
     */
    Optional<Satellite> findBySatelliteCode(String satelliteCode);

    /**
     * Check duplicate satellite code.
     */
    boolean existsBySatelliteCode(String satelliteCode);

    /**
     * Find active satellite by ID.
     */
    Optional<Satellite> findByIdAndActiveTrue(String id);

    /**
     * Find active satellite by code.
     */
    Optional<Satellite> findBySatelliteCodeAndActiveTrue(String satelliteCode);

    /**
     * Get all active satellites.
     */
    List<Satellite> findByActiveTrue();

    /**
     * Get all active satellites with pagination.
     */
    Page<Satellite> findByActiveTrue(Pageable pageable);

    /**
     * Search active satellites by name.
     */
    Page<Satellite> findByActiveTrueAndSatelliteNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    /**
     * Filter active satellites by mission status.
     */
    List<Satellite> findByMissionStatusAndActiveTrue(
            MissionStatus missionStatus
    );

    /**
     * Filter active satellites by orbit type.
     */
    List<Satellite> findByOrbitTypeAndActiveTrue(
            OrbitType orbitType
    );

    /**
     * Find satellite by NORAD catalog ID.
     *
     * Used during CelesTrak synchronization
     * to determine whether a satellite already exists.
     */
    Optional<Satellite> findByNoradCatalogId(Integer noradCatalogId);

}