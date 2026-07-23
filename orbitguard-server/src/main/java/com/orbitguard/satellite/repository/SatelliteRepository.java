package com.orbitguard.satellite.repository;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;

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
     * Find by mission status.
     */
    List<Satellite> findByMissionStatus(MissionStatus missionStatus);

    /**
     * Find by orbit type.
     */
    List<Satellite> findByOrbitType(OrbitType orbitType);

    /**
     * Search by satellite name.
     */
    List<Satellite> findBySatelliteNameContainingIgnoreCase(String satelliteName);

    /**
     * Find active records only.
     */
    List<Satellite> findByActiveTrue();

}