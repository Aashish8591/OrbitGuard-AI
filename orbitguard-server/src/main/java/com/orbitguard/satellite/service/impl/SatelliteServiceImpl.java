package com.orbitguard.satellite.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.DuplicateResourceException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.satellite.dto.request.CreateSatelliteRequest;
import com.orbitguard.satellite.dto.request.UpdateSatelliteRequest;
import com.orbitguard.satellite.dto.response.SatelliteResponse;
import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.mapper.SatelliteMapper;
import com.orbitguard.satellite.repository.SatelliteRepository;
import com.orbitguard.satellite.service.SatelliteService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import com.orbitguard.common.response.PagedResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;


@Service
@RequiredArgsConstructor
public class SatelliteServiceImpl implements SatelliteService {

    private final SatelliteRepository satelliteRepository;

    private final SatelliteMapper satelliteMapper;

    private static final List<String> ALLOWED_SORT_FIELDS = List.of(
            "satelliteName",
            "satelliteCode",
            "launchDate",
            "createdAt",
            "updatedAt",
            "missionStatus",
            "country"
    );

    @Override
    public SatelliteResponse createSatellite(CreateSatelliteRequest request) {

        if (satelliteRepository.existsBySatelliteCode(request.getSatelliteCode())) {
            throw new DuplicateResourceException("Satellite code already exists.");
        }

        Satellite satellite = satelliteMapper.toEntity(request);

        Satellite savedSatellite = satelliteRepository.save(satellite);

        return satelliteMapper.toResponse(savedSatellite);
    }

    @Override
    public SatelliteResponse getSatelliteById(String satelliteId) {

        Satellite satellite = satelliteRepository.findByIdAndActiveTrue(satelliteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Satellite not found."));

        return satelliteMapper.toResponse(satellite);
    }

    @Override
    public PagedResponse<SatelliteResponse> getAllSatellites(
            int page,
            int size,
            String sortBy,
            String direction,
            String keyword) {

        // Validate Sort Field
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BadRequestException(
                    "Invalid sort field: " + sortBy
            );
        }

        // Create Sort Direction
        if (!direction.equalsIgnoreCase("asc")
                && !direction.equalsIgnoreCase("desc")) {

            throw new BadRequestException(
                    "Sort direction must be 'asc' or 'desc'."
            );
        }

        Sort.Direction sortDirection =
                Sort.Direction.fromString(direction);

        // Create Sort
        Sort sort = Sort.by(sortDirection, sortBy);

        // Create Pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        // Fetch Data
        Page<Satellite> satellitePage;

        if (keyword != null && !keyword.isBlank()) {

            satellitePage = satelliteRepository
                    .findByActiveTrueAndSatelliteNameContainingIgnoreCase(
                            keyword,
                            pageable
                    );

        } else {

            satellitePage = satelliteRepository.findByActiveTrue(pageable);
        }

        // Convert Entity -> DTO
        List<SatelliteResponse> satelliteResponses =
                satellitePage.getContent()
                        .stream()
                        .map(satelliteMapper::toResponse)
                        .toList();

        // Build Custom Response
        return PagedResponse.<SatelliteResponse>builder()
                .content(satelliteResponses)
                .page(satellitePage.getNumber())
                .size(satellitePage.getSize())
                .totalElements(satellitePage.getTotalElements())
                .totalPages(satellitePage.getTotalPages())
                .last(satellitePage.isLast())
                .build();
    }

    @Override
    public SatelliteResponse updateSatellite(
            String satelliteId,
            UpdateSatelliteRequest request) {

        Satellite satellite = satelliteRepository.findById(satelliteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Satellite not found."));

        satelliteMapper.updateEntity(request, satellite);

        satellite.setUpdatedAt(LocalDateTime.now());

        Satellite updatedSatellite = satelliteRepository.save(satellite);

        return satelliteMapper.toResponse(updatedSatellite);
    }

    @Override
    public void deleteSatellite(String satelliteId) {

        Satellite satellite = satelliteRepository.findById(satelliteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Satellite not found."));

        satellite.setActive(false);

        satellite.setUpdatedAt(LocalDateTime.now());

        satelliteRepository.save(satellite);
    }

}