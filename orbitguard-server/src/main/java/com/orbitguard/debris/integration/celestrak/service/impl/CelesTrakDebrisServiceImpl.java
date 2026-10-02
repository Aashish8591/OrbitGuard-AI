package com.orbitguard.debris.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.debris.integration.celestrak.client.CelesTrakClient;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.debris.integration.celestrak.mapper.CelesTrakDebrisMapper;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Service implementation responsible for retrieving
 * debris-related data from CelesTrak.
 *
 * <p>
 * This service provides the application-level abstraction
 * over the CelesTrak GP client.
 * </p>
 *
 * <p>
 * The service supports retrieving:
 * </p>
 *
 * <ul>
 *     <li>Orbital data for a specific NORAD Catalog ID</li>
 *     <li>Debris orbital records using a CelesTrak GP group</li>
 * </ul>
 *
 * <p>
 * SATCAT validation is intentionally handled separately
 * by the debris synchronization layer.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class CelesTrakDebrisServiceImpl
        implements CelesTrakDebrisService {

    private final CelesTrakClient celesTrakClient;

    private final CelesTrakDebrisMapper celesTrakDebrisMapper;


    /**
     * Fetches the latest orbital data for a specific
     * debris object using its NORAD Catalog ID.
     *
     * @param noradId NORAD Catalog ID
     * @return normalized orbital data, or null when no
     *         orbital data is returned by CelesTrak
     */
    @Override
    public CelesTrakOrbitalData fetchOrbitalData(
            Long noradId) {

        validateNoradId(noradId);

        CelesTrakDebrisResponse[] responses =
                celesTrakClient.fetchOrbitalData(
                        noradId
                );

        if (responses == null
                || responses.length == 0) {

            return null;
        }

        return celesTrakDebrisMapper.toOrbitalData(
                responses[0]
        );
    }


    /**
     * Validates a NORAD Catalog ID.
     *
     * @param noradId NORAD Catalog ID
     */
    private void validateNoradId(
            Long noradId) {

        if (noradId == null
                || noradId <= 0) {

            throw new BadRequestException(
                    "NORAD ID must be a positive number."
            );
        }
    }


    /**
     * Fetches debris orbital records from the
     * CelesTrak GP dataset using the supplied group.
     *
     * <p>
     * The group is validated before the request is
     * sent to CelesTrak.
     * </p>
     *
     * @param group CelesTrak GP group
     * @return list of CelesTrak debris orbital records
     */
    @Override
    public List<CelesTrakDebrisResponse> fetchDebrisByGroup(
            String group) {

        if (group == null
                || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }

        String normalizedGroup =
                group.trim().toUpperCase();

        CelesTrakDebrisResponse[] responses =
                celesTrakClient.fetchDebrisByGroup(
                        normalizedGroup
                );

        if (responses == null
                || responses.length == 0) {

            return List.of();
        }

        return Arrays.asList(responses);
    }
}