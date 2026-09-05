package com.orbitguard.debris.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.debris.constants.DebrisApiConstants;
import com.orbitguard.debris.dto.request.CreateDebrisRequest;
import com.orbitguard.debris.dto.response.DebrisResponse;
import com.orbitguard.debris.service.DebrisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;

import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.debris.dto.request.UpdateDebrisRequest;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.orbitguard.debris.integration.celestrak.service.DebrisSynchronizationService;

@RestController
@RequiredArgsConstructor
@RequestMapping(DebrisApiConstants.BASE_URL)
@Tag(
        name = "Space Debris Management",
        description = "REST APIs for managing space debris records."
)
public class DebrisController {

    private final DebrisService debrisService;
    private final CelesTrakDebrisService celesTrakDebrisService;
    private final DebrisSynchronizationService debrisSynchronizationService;

    /**
     * Creates a new Space Debris.
     */
    @Operation(
            summary = "Create Space Debris",
            description = "Creates a new space debris record."
    )
    @PostMapping
    public ApiResponse<DebrisResponse> createDebris(
            @Valid @RequestBody CreateDebrisRequest request) {

        return debrisService.createDebris(request);
    }

    /**
     * Returns Space Debris details by ID.
     */
    @Operation(
            summary = "Get Space Debris By ID",
            description = "Returns an active space debris using its ID."
    )
    @GetMapping("/{id}")
    public ApiResponse<DebrisResponse> getDebrisById(
            @PathVariable String id) {

        return debrisService.getDebrisById(id);
    }

    /**
     * Returns all active space debris with
     * pagination, sorting and optional search.
     */
    @Operation(
            summary = "Get All Space Debris",
            description = "Returns paginated space debris records with optional search."
    )
    @GetMapping
    public ApiResponse<PagedResponse<DebrisResponse>> getAllDebris(

            @Parameter(description = "Search by Debris Name, Debris Code or NORAD ID")
            @RequestParam(required = false)
            String search,

            @ParameterObject
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "debrisName"
            )
            Pageable pageable
    ) {

        return debrisService.getAllDebris(
                search,
                pageable
        );
    }

    /**
     * Updates an existing Space Debris.
     */
    @Operation(
            summary = "Update Space Debris",
            description = "Updates an existing active space debris."
    )
    @PutMapping("/{id}")
    public ApiResponse<DebrisResponse> updateDebris(

            @PathVariable
            String id,

            @Valid
            @RequestBody
            UpdateDebrisRequest request
    ) {

        return debrisService.updateDebris(
                id,
                request
        );
    }

    /**
     * Soft deletes a Space Debris.
     */
    @Operation(
            summary = "Delete Space Debris",
            description = "Soft deletes an existing space debris."
    )
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDebris(

            @PathVariable
            String id
    ) {

        return debrisService.deleteDebris(id);
    }


    /**
     * Returns current orbital data for a debris object
     * using its NORAD catalog ID.
     */
    @Operation(
            summary = "Get Debris Orbital Data",
            description = "Retrieves the latest available orbital data for a space debris object from CelesTrak using its NORAD catalog ID."
    )
    @GetMapping("/norad/{noradId}/orbital-data")
    public ApiResponse<CelesTrakOrbitalData> getOrbitalData(
            @PathVariable Long noradId) {

        CelesTrakOrbitalData orbitalData =
                celesTrakDebrisService.fetchOrbitalData(noradId);

        return ResponseBuilder.success(
                "Debris orbital data retrieved successfully.",
                orbitalData
        );
    }

    /**
     * Synchronizes space debris data from CelesTrak
     * with the local MongoDB database.
     */
    @Operation(
            summary = "Synchronize Space Debris",
            description = "Fetches space debris data from CelesTrak for the specified group and synchronizes it with the local database."
    )
    @PostMapping("/synchronize")
    public ApiResponse<Void> synchronizeDebris(
            @RequestParam String group) {

        debrisSynchronizationService.synchronizeDebris(group);

        return ResponseBuilder.success(
                "Space debris synchronization completed successfully.",
                null
        );
    }

}