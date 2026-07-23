package com.orbitguard.satellite.dto.request;

import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSatelliteRequest {

    @NotBlank(message = "Satellite name is required")
    private String satelliteName;

    @NotBlank(message = "Operator is required")
    private String operator;

    @NotNull(message = "Orbit type is required")
    private OrbitType orbitType;

    @NotNull(message = "Altitude is required")
    @Positive(message = "Altitude must be greater than zero")
    private Double altitude;

    @NotNull(message = "Velocity is required")
    @DecimalMin(value = "0.1", message = "Velocity must be greater than zero")
    private Double velocity;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private String description;

    @NotNull(message = "Mission status is required")
    private MissionStatus missionStatus;
}