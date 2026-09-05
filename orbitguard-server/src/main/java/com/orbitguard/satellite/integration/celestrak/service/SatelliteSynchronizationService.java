package com.orbitguard.satellite.integration.celestrak.service;

public interface SatelliteSynchronizationService {

    /**
     * Synchronize satellite records from a CelesTrak group
     * into the local satellite collection.
     *
     * Existing satellites are updated using their NORAD catalog ID.
     * New satellites are inserted when no matching NORAD ID exists.
     *
     * @param group CelesTrak group name
     */
    void synchronizeSatellites(String group);
}