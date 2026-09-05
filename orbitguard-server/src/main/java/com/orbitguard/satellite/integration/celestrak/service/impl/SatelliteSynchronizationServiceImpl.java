package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteSyncMapper;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import com.orbitguard.satellite.integration.celestrak.service.SatelliteSynchronizationService;
import com.orbitguard.satellite.repository.SatelliteRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SatelliteSynchronizationServiceImpl
        implements SatelliteSynchronizationService {

    private final CelesTrakService celesTrakService;
    private final SatelliteRepository satelliteRepository;
    private final CelesTrakSatelliteSyncMapper syncMapper;

    /**
     * Synchronize satellites from a CelesTrak group
     * with the local MongoDB satellite collection.
     *
     * Flow:
     *
     * CelesTrak group
     *      ↓
     * CelesTrakService
     *      ↓
     * CelesTrakSatelliteResponse
     *      ↓
     * Find local satellite by NORAD ID
     *      ↓
     * ┌───────────────┐
     * │ Existing?     │
     * └───────┬───────┘
     *      YES│   │NO
     *         ↓   ↓
     *      Update Insert
     *
     * @param group CelesTrak group name
     */
    @Override
    public void synchronizeSatellites(String group) {

        if (group == null || group.isBlank()) {
            throw new IllegalArgumentException(
                    "CelesTrak group must not be blank."
            );
        }

        List<CelesTrakSatelliteResponse> responses =
                celesTrakService.fetchSatellitesByGroup(group);

        if (responses == null || responses.isEmpty()) {
            return;
        }

        for (CelesTrakSatelliteResponse response : responses) {

            if (response == null || response.getNoradCatalogId() == null) {
                continue;
            }

            Integer noradCatalogId = response.getNoradCatalogId();

            satelliteRepository.findByNoradCatalogId(noradCatalogId)
                    .ifPresentOrElse(
                            existingSatellite ->
                                    updateExistingSatellite(
                                            existingSatellite,
                                            response
                                    ),
                            () -> insertNewSatellite(response)
                    );
        }
    }

    /**
     * Update only fields owned by the CelesTrak synchronization.
     *
     * Application-managed fields such as satelliteCode,
     * operator, country, purpose, missionStatus and description
     * are intentionally preserved.
     */
    private void updateExistingSatellite(
            Satellite existingSatellite,
            CelesTrakSatelliteResponse response) {

        existingSatellite.setSatelliteName(response.getObjectName());
        existingSatellite.setNoradCatalogId(response.getNoradCatalogId());

        satelliteRepository.save(existingSatellite);
    }

    /**
     * Create and persist a new satellite using the
     * dedicated CelesTrak synchronization mapper.
     */
    private void insertNewSatellite(
            CelesTrakSatelliteResponse response) {

        Satellite satellite = syncMapper.toSatellite(response);

        if (satellite != null) {
            satelliteRepository.save(satellite);
        }
    }
}