package com.orbitguard.satellite.integration.celestrak.service;

import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;

import java.util.List;

public interface CelesTrakService {

    /**
     * Fetch orbital data for a satellite using
     * its NORAD catalog ID.
     *
     * @param noradCatalogId NORAD catalog identification number
     * @return mapped orbital data from CelesTrak
     */
    List<CelesTrakOrbitalData> fetchSatelliteOrbitalData(
            Integer noradCatalogId
    );
}