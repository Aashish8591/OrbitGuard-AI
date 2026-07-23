package com.orbitguard.satellite.service;

import com.orbitguard.satellite.dto.request.CreateSatelliteRequest;
import com.orbitguard.satellite.dto.request.UpdateSatelliteRequest;
import com.orbitguard.satellite.dto.response.SatelliteResponse;

import java.util.List;

public interface SatelliteService {

    SatelliteResponse createSatellite(CreateSatelliteRequest request);

    SatelliteResponse getSatelliteById(String satelliteId);

    List<SatelliteResponse> getAllSatellites();

    SatelliteResponse updateSatellite(
            String satelliteId,
            UpdateSatelliteRequest request
    );

    void deleteSatellite(String satelliteId);

}