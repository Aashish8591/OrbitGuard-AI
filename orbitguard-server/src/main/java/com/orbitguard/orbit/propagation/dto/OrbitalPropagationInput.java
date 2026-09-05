package com.orbitguard.orbit.propagation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrbitalPropagationInput {

    private Long noradCatalogId;

    private String classificationType;

    private LocalDateTime epoch;

    private String objectId;

    private Integer ephemerisType;

    private Double meanMotion;

    private Double meanMotionDot;

    private Double meanMotionDdot;

    private Double eccentricity;

    private Double inclination;

    private Double rightAscensionOfAscendingNode;

    private Double argumentOfPericenter;

    private Double meanAnomaly;

    private Double bstar;

    private Integer elementSetNumber;

    private Long revolutionAtEpoch;

    /**
     * Target time for orbit propagation.
     */
    private LocalDateTime targetTime;
}