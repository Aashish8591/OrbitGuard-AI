package com.orbitguard.risk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeRiskRequest {

    @NotBlank(message = "Satellite ID is required.")
    private String satelliteId;

    @NotBlank(message = "Debris ID is required.")
    private String debrisId;

}