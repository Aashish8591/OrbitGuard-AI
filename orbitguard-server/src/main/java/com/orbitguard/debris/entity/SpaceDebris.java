package com.orbitguard.debris.entity;

import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.enums.ObjectType;
import com.orbitguard.debris.enums.OrbitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MongoDB document representing a tracked space debris object.
 *
 * <p>
 * This entity is the core of the Debris Module and is designed
 * to support:
 * <ul>
 *     <li>CRUD Operations</li>
 *     <li>Searching</li>
 *     <li>Sorting</li>
 *     <li>Pagination</li>
 *     <li>Soft Delete</li>
 *     <li>Collision Prediction</li>
 *     <li>AI Risk Assessment</li>
 *     <li>Orbit Analytics</li>
 * </ul>
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "space_debris")
public class SpaceDebris {

    @Id
    private String id;

    /**
     * Business identifier.
     * Example: DEB-000001
     */
    @Indexed(unique = true)
    private String debrisCode;

    /**
     * Official debris name.
     */
    @Indexed
    private String debrisName;

    /**
     * NORAD Catalog ID.
     */
    @Indexed(unique = true)
    private Long noradId;

    /**
     * Debris category.
     */
    private ObjectType objectType;

    /**
     * Orbital region.
     */
    private OrbitType orbitType;

    /**
     * Country responsible for launch.
     */
    private String country;

    /**
     * Approximate size (meters).
     */
    private Double size;

    /**
     * Approximate mass (kilograms).
     */
    private Double mass;

    /**
     * Orbital velocity (km/s).
     */
    private Double velocity;

    /**
     * Average altitude (km).
     */
    private Double altitude;

    /**
     * Orbital inclination (degrees).
     */
    private Double inclination;

    /**
     * Orbital eccentricity.
     */
    private Double eccentricity;

    /**
     * Original launch date.
     */
    private LocalDate launchDate;

    /**
     * Additional description.
     */
    private String description;

    /**
     * Current tracking status.
     */
    private DebrisStatus status;

    /**
     * Soft Delete flag.
     */
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Record creation timestamp.
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Last modification timestamp.
     */
    @LastModifiedDate
    private LocalDateTime updatedAt;
}