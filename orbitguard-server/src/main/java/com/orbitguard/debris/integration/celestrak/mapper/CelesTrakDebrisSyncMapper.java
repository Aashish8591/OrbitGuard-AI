package com.orbitguard.debris.integration.celestrak.mapper;

import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import org.springframework.stereotype.Component;

/**
 * Mapper responsible for converting CelesTrak debris
 * data into a SpaceDebris entity for synchronization.
 *
 * <p>
 * Only fields that can be safely mapped directly from
 * the CelesTrak GP response are populated here.
 * </p>
 *
 * <p>
 * Business code generation, database lookup, update logic,
 * and persistence are handled by the synchronization service.
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class CelesTrakDebrisSyncMapper {

    /**
     * Converts CelesTrak debris response into a SpaceDebris entity.
     *
     * <p>
     * Safe mappings:
     * <ul>
     *     <li>OBJECT_NAME → debrisName</li>
     *     <li>NORAD_CAT_ID → noradId</li>
     * </ul>
     * </p>
     *
     * @param response CelesTrak debris response
     * @return mapped SpaceDebris entity, or null when response is null
     */
    public SpaceDebris toEntity(CelesTrakDebrisResponse response) {

        if (response == null) {
            return null;
        }

        return SpaceDebris.builder()
                .debrisName(response.getObjectName())
                .noradId(response.getNoradCatalogId())
                .build();
    }
}