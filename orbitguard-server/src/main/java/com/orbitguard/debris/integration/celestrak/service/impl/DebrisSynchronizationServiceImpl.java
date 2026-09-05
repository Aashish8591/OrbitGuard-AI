package com.orbitguard.debris.integration.celestrak.service.impl;

import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.mapper.CelesTrakDebrisSyncMapper;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.debris.integration.celestrak.service.DebrisSynchronizationService;
import com.orbitguard.debris.repository.DebrisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service implementation responsible for synchronizing
 * space debris data from CelesTrak with MongoDB.
 *
 * <p>
 * NORAD catalog ID is used as the unique identity
 * of a debris object during synchronization.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class DebrisSynchronizationServiceImpl
        implements DebrisSynchronizationService {

    private static final String DEBRIS_SEQUENCE = "debris_sequence";
    private static final String DEBRIS_CODE_PREFIX = "DEB";

    private final CelesTrakDebrisService celesTrakService;
    private final DebrisRepository debrisRepository;
    private final CelesTrakDebrisSyncMapper syncMapper;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final BusinessCodeGenerator businessCodeGenerator;

    /**
     * Synchronizes debris records from CelesTrak.
     *
     * @param group CelesTrak debris group
     */
    @Override
    public void synchronizeDebris(String group) {

        if (group == null || group.isBlank()) {
            throw new IllegalArgumentException(
                    "CelesTrak group must not be blank."
            );
        }

        List<CelesTrakDebrisResponse> responses =
                celesTrakService.fetchDebrisByGroup(group);

        if (responses == null || responses.isEmpty()) {
            return;
        }

        for (CelesTrakDebrisResponse response : responses) {

            if (response == null || response.getNoradCatalogId() == null) {
                continue;
            }

            Long noradId = response.getNoradCatalogId();

            debrisRepository.findByNoradId(noradId)
                    .ifPresentOrElse(
                            existingDebris ->
                                    updateExistingDebris(
                                            existingDebris,
                                            response
                                    ),
                            () -> insertNewDebris(response)
                    );
        }
    }

    /**
     * Updates an existing debris record.
     *
     * <p>
     * Existing business code and MongoDB ID are preserved.
     * </p>
     */
    private void updateExistingDebris(
            SpaceDebris existingDebris,
            CelesTrakDebrisResponse response) {

        existingDebris.setDebrisName(response.getObjectName());
        existingDebris.setNoradId(response.getNoradCatalogId());

        /*
         * CelesTrak confirms that this object is currently
         * being synchronized, so reactivate a previously
         * soft-deleted record.
         */
        existingDebris.setIsActive(true);

        /*
         * Do not overwrite:
         * - debrisCode
         * - objectType
         * - orbitType
         * - country
         * - size
         * - mass
         * - velocity
         * - altitude
         * - launchDate
         * - description
         *
         * These values are not directly available from
         * the current CelesTrak GP response.
         */

        debrisRepository.save(existingDebris);
    }

    /**
     * Inserts a new debris record.
     *
     * <p>
     * A new business code is generated using the existing
     * OrbitGuard AI sequence and business-code utilities.
     * </p>
     */
    private void insertNewDebris(
            CelesTrakDebrisResponse response) {

        SpaceDebris debris = syncMapper.toEntity(response);

        if (debris == null) {
            return;
        }

        long sequence =
                sequenceGeneratorService.getNextSequence(
                        DEBRIS_SEQUENCE
                );

        String debrisCode =
                businessCodeGenerator.generate(
                        DEBRIS_CODE_PREFIX,
                        sequence
                );

        debris.setDebrisCode(debrisCode);
        debris.setStatus(DebrisStatus.ACTIVE);
        debris.setIsActive(true);

        debrisRepository.save(debris);
    }
}