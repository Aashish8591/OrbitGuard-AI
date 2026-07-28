package com.orbitguard.satellite.service;

import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.satellite.dto.request.CreateSatelliteRequest;
import com.orbitguard.satellite.dto.request.UpdateSatelliteRequest;
import com.orbitguard.satellite.dto.response.SatelliteResponse;

import java.util.List;

public interface SatelliteService {

    SatelliteResponse createSatellite(CreateSatelliteRequest request);

    SatelliteResponse getSatelliteById(String satelliteId);

    PagedResponse<SatelliteResponse> getAllSatellites(

            int page,

            int size,

            String sortBy,

            String direction,

            String keyword

    );

    SatelliteResponse updateSatellite(
            String satelliteId,
            UpdateSatelliteRequest request
    );

    void deleteSatellite(String satelliteId);

}