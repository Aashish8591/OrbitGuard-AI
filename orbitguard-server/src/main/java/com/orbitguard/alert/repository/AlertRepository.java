package com.orbitguard.alert.repository;

import com.orbitguard.alert.entity.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ==============================================================
 * Alert Repository
 * ==============================================================
 *
 * Repository layer responsible for performing
 * database operations for Alert documents.
 *
 * Custom business logic should NOT be placed here.
 * It belongs in the Service layer.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    /**
     * --------------------------------------------------------------
     * Find Active Alert By ID
     * --------------------------------------------------------------
     *
     * @param id Alert ID
     * @return Active Alert
     */
    Optional<Alert> findByIdAndIsActiveTrue(String id);

    /**
     * --------------------------------------------------------------
     * Find Active Alert By Alert Code
     * --------------------------------------------------------------
     *
     * @param alertCode Business Alert Code
     * @return Active Alert
     */
    Optional<Alert> findByAlertCodeAndIsActiveTrue(String alertCode);

    /**
     * --------------------------------------------------------------
     * Check Alert Code Exists
     * --------------------------------------------------------------
     *
     * @param alertCode Business Alert Code
     * @return true if exists
     */
    boolean existsByAlertCode(String alertCode);

}