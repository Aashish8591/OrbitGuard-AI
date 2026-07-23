package com.orbitguard.satellite.dto.response;

import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SatelliteResponse {

    private String id;

    private String satelliteName;

    private String satelliteCode;

    private String operator;

    private OrbitType orbitType;

    private Double altitude;

    private Double velocity;

    private LocalDate launchDate;

    private MissionStatus missionStatus;

    private String country;

    private String purpose;

    private String description;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}