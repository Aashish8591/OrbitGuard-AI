package com.orbitguard.debris.integration.celestrak.service;

/**
 * Service responsible for synchronizing space debris
 * data from CelesTrak with the local MongoDB database.
 *
 * <p>
 * The synchronization uses the NORAD catalog ID as the
 * unique identity of a debris object.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface DebrisSynchronizationService {

    /**
     * Synchronizes debris data from the specified
     * CelesTrak group.
     *
     * @param group CelesTrak debris group
     */
    void synchronizeDebris(String group);
}