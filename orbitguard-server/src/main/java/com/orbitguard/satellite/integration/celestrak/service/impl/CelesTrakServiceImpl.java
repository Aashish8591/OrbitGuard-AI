package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.satellite.integration.celestrak.client.CelesTrakClient;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteMapper;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CelesTrakServiceImpl implements CelesTrakService {

    private final CelesTrakClient celesTrakClient;
    private final CelesTrakSatelliteMapper celesTrakSatelliteMapper;

    /**
     * Fetch orbital data for a satellite from CelesTrak
     * using its NORAD catalog ID.
     *
     * Flow:
     *
     * CelesTrak API
     *      ↓
     * CelesTrakClient
     *      ↓
     * CelesTrakSatelliteResponse
     *      ↓
     * CelesTrakSatelliteMapper
     *      ↓
     * CelesTrakOrbitalData
     *
     * @param noradCatalogId NORAD catalog identification number
     * @return mapped orbital data
     */
    @Override
    public List<CelesTrakOrbitalData> fetchSatelliteOrbitalData(
            Integer noradCatalogId) {

        if (noradCatalogId == null || noradCatalogId <= 0) {
            throw new BadRequestException(
                    "NORAD catalog ID must be greater than zero."
            );
        }

        List<CelesTrakSatelliteResponse> responses =
                celesTrakClient.getSatelliteByNoradId(noradCatalogId);

        if (responses == null || responses.isEmpty()) {
            return List.of();
        }

        return responses.stream()
                .map(celesTrakSatelliteMapper::toOrbitalData)
                .filter(data -> data != null)
                .toList();
    }

    @Override
    public List<CelesTrakSatelliteResponse> fetchSatellitesByGroup(String group) {

        if (group == null || group.isBlank()) {
            throw new IllegalArgumentException("CelesTrak group must not be blank.");
        }

        return celesTrakClient.getSatellitesByGroup(group);
    }
}