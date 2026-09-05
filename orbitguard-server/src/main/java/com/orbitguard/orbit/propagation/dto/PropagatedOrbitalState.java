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
public class PropagatedOrbitalState {

    private Long noradCatalogId;

    private LocalDateTime timestamp;

    /**
     * Position coordinates in kilometers.
     */
    private Double positionX;

    private Double positionY;

    private Double positionZ;

    /**
     * Velocity components in kilometers per second.
     */
    private Double velocityX;

    private Double velocityY;

    private Double velocityZ;

    /**
     * Reference frame used for the propagated state.
     */
    private String frame;
}