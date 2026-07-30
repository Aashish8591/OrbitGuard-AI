package com.orbitguard.debris.dto.response;

import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.enums.ObjectType;
import com.orbitguard.debris.enums.OrbitType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO returned to API consumers after
 * retrieving or manipulating Space Debris data.
 *
 * This DTO hides internal entity implementation
 * and provides a clean API contract.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response object representing a Space Debris")
public class DebrisResponse {

    @Schema(
            description = "MongoDB document ID",
            example = "6888e7b49af3d13dbac91a21"
    )
    private String id;

    @Schema(
            description = "Unique business identifier",
            example = "DEB-000001"
    )
    private String debrisCode;

    @Schema(
            description = "Official debris name",
            example = "COSMOS 2251 Fragment"
    )
    private String debrisName;

    @Schema(
            description = "NORAD Catalog ID",
            example = "33757"
    )
    private Long noradId;

    @Schema(
            description = "Debris category",
            example = "FRAGMENT"
    )
    private ObjectType objectType;

    @Schema(
            description = "Orbit classification",
            example = "LEO"
    )
    private OrbitType orbitType;

    @Schema(
            description = "Country responsible for launch",
            example = "Russia"
    )
    private String country;

    @Schema(
            description = "Approximate size in meters",
            example = "1.45"
    )
    private Double size;

    @Schema(
            description = "Approximate mass in kilograms",
            example = "15.20"
    )
    private Double mass;

    @Schema(
            description = "Orbital velocity in km/s",
            example = "7.80"
    )
    private Double velocity;

    @Schema(
            description = "Average orbital altitude in kilometers",
            example = "850.0"
    )
    private Double altitude;

    @Schema(
            description = "Orbital inclination in degrees",
            example = "74.0"
    )
    private Double inclination;

    @Schema(
            description = "Orbital eccentricity",
            example = "0.002"
    )
    private Double eccentricity;

    @Schema(
            description = "Original launch date",
            example = "2009-02-10"
    )
    private LocalDate launchDate;

    @Schema(
            description = "Additional information",
            example = "Created after the Iridium-Cosmos collision."
    )
    private String description;

    @Schema(
            description = "Current tracking status",
            example = "ACTIVE"
    )
    private DebrisStatus status;

    @Schema(
            description = "Soft delete flag",
            example = "true"
    )
    private Boolean isActive;

    @Schema(
            description = "Record creation timestamp",
            example = "2026-07-29T14:30:15"
    )
    private LocalDateTime createdAt;

    @Schema(
            description = "Last updated timestamp",
            example = "2026-07-30T09:45:10"
    )
    private LocalDateTime updatedAt;
}