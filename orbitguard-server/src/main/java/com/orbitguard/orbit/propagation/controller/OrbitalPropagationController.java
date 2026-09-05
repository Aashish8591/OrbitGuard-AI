package com.orbitguard.orbit.propagation.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationFacade;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/orbit/propagation")
public class OrbitalPropagationController {

    private final OrbitalPropagationFacade orbitalPropagationFacade;

    @GetMapping("/satellite/{noradCatalogId}")
    public ApiResponse<PropagatedOrbitalState> propagateSatellite(
            @PathVariable
            @Min(
                    value = 1,
                    message = "NORAD catalog ID must be greater than zero."
            )
            Integer noradCatalogId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime targetTime) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now();

        PropagatedOrbitalState result =
                orbitalPropagationFacade.propagateSatellite(
                        noradCatalogId,
                        propagationTime
                );

        return ResponseBuilder.success(
                "Satellite orbital state propagated successfully.",
                result
        );
    }

    @GetMapping("/debris/{noradId}")
    public ApiResponse<PropagatedOrbitalState> propagateDebris(
            @PathVariable
            @Min(
                    value = 1,
                    message = "NORAD ID must be greater than zero."
            )
            Long noradId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime targetTime) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now();

        PropagatedOrbitalState result =
                orbitalPropagationFacade.propagateDebris(
                        noradId,
                        propagationTime
                );

        return ResponseBuilder.success(
                "Debris orbital state propagated successfully.",
                result
        );
    }

    @GetMapping("/satellite/{noradCatalogId}/position")
    public ApiResponse<PropagatedOrbitalData> propagateSatelliteWithPosition(
            @PathVariable
            @Min(
                    value = 1,
                    message = "NORAD catalog ID must be greater than zero."
            )
            Integer noradCatalogId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime targetTime) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now();

        PropagatedOrbitalData result =
                orbitalPropagationFacade.propagateSatelliteWithPosition(
                        noradCatalogId,
                        propagationTime
                );

        return ResponseBuilder.success(
                "Satellite orbital data propagated successfully.",
                result
        );
    }

    @GetMapping("/debris/{noradId}/position")
    public ApiResponse<PropagatedOrbitalData> propagateDebrisWithPosition(
            @PathVariable
            @Min(
                    value = 1,
                    message = "NORAD ID must be greater than zero."
            )
            Long noradId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime targetTime) {

        LocalDateTime propagationTime =
                targetTime != null
                        ? targetTime
                        : LocalDateTime.now();

        PropagatedOrbitalData result =
                orbitalPropagationFacade.propagateDebrisWithPosition(
                        noradId,
                        propagationTime
                );

        return ResponseBuilder.success(
                "Debris orbital data propagated successfully.",
                result
        );
    }
}