package com.orbitguard.satellite.integration.celestrak.mapper;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import org.springframework.stereotype.Component;

@Component
public class CelesTrakSatelliteSyncMapper {

    /**
     * Convert CelesTrak satellite response into the application's
     * Satellite entity.
     *
     * Only fields that can be safely mapped from the current
     * CelesTrak response are populated here.
     *
     * CelesTrak
     *      ↓
     * CelesTrakSatelliteResponse
     *      ↓
     * CelesTrakSatelliteSyncMapper
     *      ↓
     * Satellite
     */
    public Satellite toSatellite(CelesTrakSatelliteResponse response) {

        if (response == null) {
            return null;
        }

        return Satellite.builder()
                .satelliteName(response.getObjectName())
                .noradCatalogId(response.getNoradCatalogId())
                .build();
    }
}