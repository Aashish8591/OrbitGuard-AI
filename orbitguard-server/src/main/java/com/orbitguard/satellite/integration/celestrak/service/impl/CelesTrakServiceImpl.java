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
public class CelesTrakServiceImpl
        implements CelesTrakService {

    private final CelesTrakClient celesTrakClient;

    private final CelesTrakSatelliteMapper celesTrakSatelliteMapper;

    /**
     * Fetch current orbital data for a satellite
     * using its NORAD catalog ID.
     *
     * Flow:
     *
     * <pre>
     * CelesTrak API
     *      ↓
     * CelesTrakClient
     *      ↓
     * CelesTrakSatelliteResponse
     *      ↓
     * CelesTrakSatelliteMapper
     *      ↓
     * CelesTrakOrbitalData
     * </pre>
     *
     * @param noradCatalogId NORAD catalog identification number
     * @return mapped orbital data
     */
    @Override
    public List<CelesTrakOrbitalData> fetchSatelliteOrbitalData(
            Integer noradCatalogId) {

        validateNoradCatalogId(noradCatalogId);

        List<CelesTrakSatelliteResponse> responses =
                celesTrakClient.getSatelliteByNoradId(
                        noradCatalogId
                );

        if (responses == null || responses.isEmpty()) {
            return List.of();
        }

        return responses.stream()
                .filter(response -> response != null)
                .map(celesTrakSatelliteMapper::toOrbitalData)
                .filter(data -> data != null)
                .toList();
    }

    /**
     * Fetch satellites belonging to a CelesTrak group.
     *
     * <p>
     * The synchronization layer currently works directly
     * with the external CelesTrak response model, therefore
     * this method intentionally returns
     * {@link CelesTrakSatelliteResponse}.
     * </p>
     *
     * <p>
     * No satellite persistence or business transformation
     * is performed here. Those responsibilities belong to
     * the synchronization service.
     * </p>
     *
     * @param group CelesTrak group name
     * @return satellites returned by CelesTrak
     */
    @Override
    public List<CelesTrakSatelliteResponse> fetchSatellitesByGroup(
            String group) {

        validateGroup(group);

        String normalizedGroup =
                group.trim().toUpperCase();

        List<CelesTrakSatelliteResponse> responses =
                celesTrakClient.getSatellitesByGroup(
                        normalizedGroup
                );

        if (responses == null || responses.isEmpty()) {
            return List.of();
        }

        return responses.stream()
                .filter(response -> response != null)
                .toList();
    }

    /**
     * Validate NORAD catalog ID before contacting CelesTrak.
     */
    private void validateNoradCatalogId(
            Integer noradCatalogId) {

        if (noradCatalogId == null
                || noradCatalogId <= 0) {

            throw new BadRequestException(
                    "NORAD catalog ID must be greater than zero."
            );
        }
    }

    /**
     * Validate CelesTrak group before contacting CelesTrak.
     */
    private void validateGroup(String group) {

        if (group == null || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }
    }
}