package com.orbitguard.debris.integration.celestrak.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CelesTrakOrbitalData {

    private String objectName;

    private String objectId;

    private Long noradCatalogId;

    private LocalDateTime epoch;

    private Double meanMotion;

    private Double eccentricity;

    private Double inclination;

    private Double rightAscensionOfAscendingNode;

    private Double argumentOfPericenter;

    private Double meanAnomaly;

    private Double bstar;

    private Double meanMotionDot;

    private Double meanMotionDdot;

    private Integer elementSetNumber;

    private Long revolutionAtEpoch;

    private String classificationType;

    private Integer ephemerisType;
}