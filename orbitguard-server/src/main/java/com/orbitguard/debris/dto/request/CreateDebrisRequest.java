package com.orbitguard.debris.dto.request;

import com.orbitguard.debris.enums.ObjectType;
import com.orbitguard.debris.enums.OrbitType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO used to create a new Space Debris.
 *
 * This DTO is exposed to API consumers and therefore
 * contains validation rules to ensure only valid
 * data enters the system.
 *
 * Entity objects should never be exposed directly.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request object for creating a new Space Debris")
public class CreateDebrisRequest {

    @NotBlank(message = "Debris name is required.")
    @Size(max = 100, message = "Debris name cannot exceed 100 characters.")
    @Schema(
            description = "Official debris name",
            example = "COSMOS 2251 Fragment"
    )
    private String debrisName;

    @NotNull(message = "NORAD ID is required.")
    @Positive(message = "NORAD ID must be positive.")
    @Schema(
            description = "Unique NORAD Catalog ID",
            example = "33757"
    )
    private Long noradId;

    @NotNull(message = "Object type is required.")
    @Schema(
            description = "Category of debris",
            example = "FRAGMENT"
    )
    private ObjectType objectType;

    @NotNull(message = "Orbit type is required.")
    @Schema(
            description = "Orbit classification",
            example = "LEO"
    )
    private OrbitType orbitType;

    @NotBlank(message = "Country is required.")
    @Size(max = 50)
    @Schema(
            description = "Country responsible for launch",
            example = "Russia"
    )
    private String country;

    @NotNull(message = "Size is required.")
    @Positive(message = "Size must be greater than zero.")
    @Schema(
            description = "Approximate object size in meters",
            example = "1.45"
    )
    private Double size;

    @NotNull(message = "Mass is required.")
    @Positive(message = "Mass must be greater than zero.")
    @Schema(
            description = "Approximate object mass in kilograms",
            example = "15.2"
    )
    private Double mass;

    @NotNull(message = "Velocity is required.")
    @Positive(message = "Velocity must be greater than zero.")
    @Schema(
            description = "Orbital velocity in km/s",
            example = "7.8"
    )
    private Double velocity;

    @NotNull(message = "Altitude is required.")
    @Positive(message = "Altitude must be greater than zero.")
    @Schema(
            description = "Average orbital altitude in kilometers",
            example = "850"
    )
    private Double altitude;

    @NotNull(message = "Inclination is required.")
    @DecimalMin(value = "0.0", message = "Inclination cannot be negative.")
    @DecimalMax(value = "180.0", message = "Inclination cannot exceed 180 degrees.")
    @Schema(
            description = "Orbital inclination in degrees",
            example = "74.0"
    )
    private Double inclination;

    @NotNull(message = "Eccentricity is required.")
    @DecimalMin(value = "0.0", message = "Eccentricity cannot be negative.")
    @Schema(
            description = "Orbital eccentricity",
            example = "0.002"
    )
    private Double eccentricity;

    @NotNull(message = "Launch date is required.")
    @PastOrPresent(message = "Launch date cannot be in the future.")
    @Schema(
            description = "Original launch date",
            example = "2009-02-10"
    )
    private LocalDate launchDate;

    @Size(max = 500, message = "Description cannot exceed 500 characters.")
    @Schema(
            description = "Additional information about the debris",
            example = "Created after the Iridium 33 and Cosmos 2251 collision."
    )
    private String description;
}