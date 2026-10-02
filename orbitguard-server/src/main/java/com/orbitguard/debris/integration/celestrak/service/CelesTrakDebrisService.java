package com.orbitguard.debris.integration.celestrak.service;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;

import java.util.List;

/**
 * Service responsible for retrieving debris-related
 * orbital data from CelesTrak.
 *
 * <p>
 * This service acts as the application-level abstraction
 * over the CelesTrak GP client.
 * </p>
 *
 * <p>
 * Responsibilities:
 * </p>
 *
 * <ul>
 *     <li>Retrieve orbital data for a specific NORAD ID</li>
 *     <li>Retrieve debris orbital records by CelesTrak group</li>
 * </ul>
 *
 * <p>
 * The service uses the CelesTrak GP dataset and delegates
 * external communication to the CelesTrak client.
 * </p>
 *
 * <p>
 * Current on-orbit validation is intentionally not performed
 * by this service. SATCAT is a separate CelesTrak data source
 * and can be handled by the debris synchronization flow.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public interface CelesTrakDebrisService {

    /**
     * Fetches the latest GP orbital data for a specific
     * debris object using its NORAD Catalog ID.
     *
     * @param noradId NORAD Catalog ID
     * @return normalized orbital data
     */
    CelesTrakOrbitalData fetchOrbitalData(
            Long noradId
    );

    /**
     * Fetches debris orbital records from the CelesTrak
     * GP dataset using the specified CelesTrak group.
     *
     * <p>
     * The group is passed to the CelesTrak GP endpoint
     * as the GROUP query parameter.
     * </p>
     *
     * <p>
     * The synchronization layer is responsible for
     * validating and processing the returned records.
     * </p>
     *
     * @param group CelesTrak GP group
     * @return list of CelesTrak debris orbital records
     */
    List<CelesTrakDebrisResponse> fetchDebrisByGroup(
            String group
    );
}