package com.orbitguard.risk.dto.request;

import com.orbitguard.risk.enums.RiskStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRiskStatusRequest {

    @NotNull(message = "Risk status is required.")
    private RiskStatus status;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters.")
    private String remarks;

}