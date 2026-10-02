package com.orbitguard.debris.integration.celestrak.service;

/**
 * Service responsible for synchronizing space debris
 * data from CelesTrak with the local MongoDB database.
 *
 * <p>
 * The synchronization uses the NORAD Catalog ID as the
 * unique external identity of a debris object.
 * </p>
 *
 * <p>
 * CelesTrak GP data is retrieved through the
 * {@link CelesTrakDebrisService} abstraction. The
 * synchronization implementation is responsible for
 * validating the received records and creating or updating
 * the corresponding MongoDB documents.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface DebrisSynchronizationService {

    /**
     * Synchronizes debris data from the specified
     * CelesTrak GP group.
     *
     * <p>
     * The supplied group is passed through the CelesTrak
     * debris service and the returned records are
     * synchronized using their NORAD Catalog IDs.
     * </p>
     *
     * @param group CelesTrak GP group
     */
    void synchronizeDebris(String group);
}