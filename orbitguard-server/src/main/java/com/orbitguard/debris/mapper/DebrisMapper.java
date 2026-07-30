package com.orbitguard.debris.mapper;

import com.orbitguard.debris.dto.request.CreateDebrisRequest;
import com.orbitguard.debris.dto.request.UpdateDebrisRequest;
import com.orbitguard.debris.dto.response.DebrisResponse;
import com.orbitguard.debris.entity.SpaceDebris;
import org.springframework.stereotype.Component;

/**
 * Mapper responsible for converting between
 * Debris DTOs and Entity.
 *
 * <p>
 * This class intentionally performs explicit mapping
 * instead of using BeanUtils or ModelMapper.
 * This prevents accidental modification of immutable
 * business fields.
 * </p>
 *
 * Responsibilities:
 * <ul>
 *     <li>Create Request → Entity</li>
 *     <li>Entity → Response</li>
 *     <li>Update Request → Existing Entity</li>
 * </ul>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class DebrisMapper {

    /**
     * Converts CreateDebrisRequest into SpaceDebris entity.
     */
    public SpaceDebris toEntity(CreateDebrisRequest request) {

        if (request == null) {
            return null;
        }

        return SpaceDebris.builder()
                .debrisName(request.getDebrisName())
                .noradId(request.getNoradId())
                .objectType(request.getObjectType())
                .orbitType(request.getOrbitType())
                .country(request.getCountry())
                .size(request.getSize())
                .mass(request.getMass())
                .velocity(request.getVelocity())
                .altitude(request.getAltitude())
                .inclination(request.getInclination())
                .eccentricity(request.getEccentricity())
                .launchDate(request.getLaunchDate())
                .description(request.getDescription())
                .build();
    }

    /**
     * Converts SpaceDebris entity into DebrisResponse DTO.
     */
    public DebrisResponse toResponse(SpaceDebris debris) {

        if (debris == null) {
            return null;
        }

        return DebrisResponse.builder()
                .id(debris.getId())
                .debrisCode(debris.getDebrisCode())
                .debrisName(debris.getDebrisName())
                .noradId(debris.getNoradId())
                .objectType(debris.getObjectType())
                .orbitType(debris.getOrbitType())
                .country(debris.getCountry())
                .size(debris.getSize())
                .mass(debris.getMass())
                .velocity(debris.getVelocity())
                .altitude(debris.getAltitude())
                .inclination(debris.getInclination())
                .eccentricity(debris.getEccentricity())
                .launchDate(debris.getLaunchDate())
                .description(debris.getDescription())
                .status(debris.getStatus())
                .isActive(debris.getIsActive())
                .createdAt(debris.getCreatedAt())
                .updatedAt(debris.getUpdatedAt())
                .build();
    }

    /**
     * Updates an existing SpaceDebris entity.
     *
     * Immutable fields are intentionally NOT modified:
     * - id
     * - debrisCode
     * - noradId
     * - launchDate
     * - createdAt
     * - isActive
     */
    public void updateEntity(UpdateDebrisRequest request,
                             SpaceDebris debris) {

        if (request == null || debris == null) {
            return;
        }

        debris.setDebrisName(request.getDebrisName());
        debris.setObjectType(request.getObjectType());
        debris.setOrbitType(request.getOrbitType());
        debris.setCountry(request.getCountry());
        debris.setSize(request.getSize());
        debris.setMass(request.getMass());
        debris.setVelocity(request.getVelocity());
        debris.setAltitude(request.getAltitude());
        debris.setInclination(request.getInclination());
        debris.setEccentricity(request.getEccentricity());
        debris.setDescription(request.getDescription());
        debris.setStatus(request.getStatus());
    }

}