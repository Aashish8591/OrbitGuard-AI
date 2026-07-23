package com.orbitguard.satellite.mapper;

import com.orbitguard.satellite.dto.request.CreateSatelliteRequest;
import com.orbitguard.satellite.dto.request.UpdateSatelliteRequest;
import com.orbitguard.satellite.dto.response.SatelliteResponse;
import com.orbitguard.satellite.entity.Satellite;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SatelliteMapper {

    /**
     * Convert Create Request DTO -> Entity
     */
    public Satellite toEntity(CreateSatelliteRequest request) {

        if (request == null) {
            return null;
        }

        return Satellite.builder()
                .satelliteName(request.getSatelliteName())
                .satelliteCode(request.getSatelliteCode())
                .operator(request.getOperator())
                .orbitType(request.getOrbitType())
                .altitude(request.getAltitude())
                .velocity(request.getVelocity())
                .launchDate(request.getLaunchDate())
                .country(request.getCountry())
                .purpose(request.getPurpose())
                .description(request.getDescription())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Convert Entity -> Response DTO
     */
    public SatelliteResponse toResponse(Satellite satellite) {

        if (satellite == null) {
            return null;
        }

        return SatelliteResponse.builder()
                .id(satellite.getId())
                .satelliteName(satellite.getSatelliteName())
                .satelliteCode(satellite.getSatelliteCode())
                .operator(satellite.getOperator())
                .orbitType(satellite.getOrbitType())
                .altitude(satellite.getAltitude())
                .velocity(satellite.getVelocity())
                .launchDate(satellite.getLaunchDate())
                .missionStatus(satellite.getMissionStatus())
                .country(satellite.getCountry())
                .purpose(satellite.getPurpose())
                .description(satellite.getDescription())
                .active(satellite.getActive())
                .createdAt(satellite.getCreatedAt())
                .updatedAt(satellite.getUpdatedAt())
                .build();
    }

    /**
     * Update existing entity from Update Request DTO
     */
    public void updateEntity(
            UpdateSatelliteRequest request,
            Satellite satellite) {

        if (request == null || satellite == null) {
            return;
        }

        satellite.setSatelliteName(request.getSatelliteName());
        satellite.setOperator(request.getOperator());
        satellite.setOrbitType(request.getOrbitType());
        satellite.setAltitude(request.getAltitude());
        satellite.setVelocity(request.getVelocity());
        satellite.setCountry(request.getCountry());
        satellite.setPurpose(request.getPurpose());
        satellite.setDescription(request.getDescription());
        satellite.setMissionStatus(request.getMissionStatus());
        satellite.setUpdatedAt(LocalDateTime.now());
    }

}