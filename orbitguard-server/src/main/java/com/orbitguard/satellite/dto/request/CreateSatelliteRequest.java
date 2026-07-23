package com.orbitguard.satellite.dto.request;

import com.orbitguard.satellite.enums.OrbitType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSatelliteRequest {

    @NotBlank(message = "Satellite name is required")
    private String satelliteName;

    @NotBlank(message = "Satellite code is required")
    private String satelliteCode;

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

    @NotNull(message = "Launch date is required")
    @PastOrPresent(message = "Launch date cannot be in the future")
    private LocalDate launchDate;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private String description;
}