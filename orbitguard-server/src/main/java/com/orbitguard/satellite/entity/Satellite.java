package com.orbitguard.satellite.entity;

import com.orbitguard.satellite.enums.MissionStatus;
import com.orbitguard.satellite.enums.OrbitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "satellites")
public class Satellite {

    @Id
    private String id;

    /**
     * Example:
     * International Space Station
     */
    private String satelliteName;

    /**
     * Example:
     * ISS-001
     */
    private String satelliteCode;

    /**
     * NORAD catalog identification number.
     * Example:
     * 25544 = ISS (ZARYA)
     *
     * Used to identify and synchronize the satellite
     * with external orbital data providers such as CelesTrak.
     */
    private Integer noradCatalogId;

    /**
     * Example:
     * NASA
     * ISRO
     * SpaceX
     */
    private String operator;

    /**
     * LEO
     * MEO
     * GEO
     */
    private OrbitType orbitType;

    /**
     * Height from Earth (KM)
     */
    private Double altitude;

    /**
     * KM/s
     */
    private Double velocity;

    /**
     * Launch Date
     */
    private LocalDate launchDate;

    /**
     * ACTIVE
     * INACTIVE
     * DECOMMISSIONED
     */
    @Builder.Default
    private MissionStatus missionStatus = MissionStatus.ACTIVE;

    @Builder.Default
    private Boolean active = true;

    /**
     * India
     * USA
     * Japan
     */
    private String country;

    /**
     * Communication
     * Navigation
     * Weather
     * Military
     */
    private String purpose;

    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}