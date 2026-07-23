package com.orbitguard.satellite.service.impl;

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
import java.util.List;

@Service
@RequiredArgsConstructor
public class SatelliteServiceImpl implements SatelliteService {

    private final SatelliteRepository satelliteRepository;

    private final SatelliteMapper satelliteMapper;

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

        Satellite satellite = satelliteRepository.findById(satelliteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Satellite not found."));

        return satelliteMapper.toResponse(satellite);
    }

    @Override
    public List<SatelliteResponse> getAllSatellites() {

        return satelliteRepository.findByActiveTrue()
                .stream()
                .map(satelliteMapper::toResponse)
                .toList();
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