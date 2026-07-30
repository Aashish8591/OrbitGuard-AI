package com.orbitguard.debris.service.impl;

import com.orbitguard.common.exception.DuplicateResourceException;
import com.orbitguard.common.exception.ResourceNotFoundException;
import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.common.response.PagedResponse;
import com.orbitguard.common.util.ResponseBuilder;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.debris.dto.request.CreateDebrisRequest;
import com.orbitguard.debris.dto.request.UpdateDebrisRequest;
import com.orbitguard.debris.dto.response.DebrisResponse;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.mapper.DebrisMapper;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.debris.service.DebrisService;
import com.orbitguard.debris.specification.DebrisQueryBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class DebrisServiceImpl implements DebrisService {

    private static final String DEBRIS_PREFIX = "DEB";
    private static final String DEBRIS_SEQUENCE = "debris_sequence";

    private final DebrisRepository debrisRepository;
    private final DebrisMapper debrisMapper;
    private final BusinessCodeGenerator businessCodeGenerator;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final MongoTemplate mongoTemplate;
    private final DebrisQueryBuilder debrisQueryBuilder;

    /**
     * Creates a new Space Debris.
     */
    @Override
    public ApiResponse<DebrisResponse> createDebris(CreateDebrisRequest request) {

        validateNoradId(request.getNoradId());

        SpaceDebris debris = debrisMapper.toEntity(request);

        long sequence =
                sequenceGeneratorService.getNextSequence(DEBRIS_SEQUENCE);

        debris.setDebrisCode(
                businessCodeGenerator.generate(DEBRIS_PREFIX, sequence)
        );

        debris.setStatus(DebrisStatus.ACTIVE);
        debris.setIsActive(true);

        SpaceDebris savedDebris =
                debrisRepository.save(debris);

        DebrisResponse response =
                debrisMapper.toResponse(savedDebris);

        return ResponseBuilder.success(
                "Space debris created successfully.",
                response
        );
    }

    /**
     * Checks duplicate NORAD ID.
     */
    private void validateNoradId(Long noradId) {

        if (debrisRepository.existsByNoradId(noradId)) {
            throw new DuplicateResourceException(
                    "NORAD ID already exists."
            );
        }
    }

    /**
     * Returns active debris or throws exception.
     */
    private SpaceDebris getActiveDebris(String id) {

        return debrisRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Space debris not found."
                        ));
    }



    /**
     * Updates an existing active Space Debris.
     */
    @Override
    public ApiResponse<DebrisResponse> updateDebris(
            String id,
            UpdateDebrisRequest request) {

        SpaceDebris debris = getActiveDebris(id);

        debrisMapper.updateEntity(request, debris);

        SpaceDebris updatedDebris =
                debrisRepository.save(debris);

        DebrisResponse response =
                debrisMapper.toResponse(updatedDebris);

        return ResponseBuilder.success(
                "Space debris updated successfully.",
                response
        );
    }

    /**
     * Returns Space Debris details by ID.
     */
    @Override
    public ApiResponse<DebrisResponse> getDebrisById(String id) {

        SpaceDebris debris =
                getActiveDebris(id);

        DebrisResponse response =
                debrisMapper.toResponse(debris);

        return ResponseBuilder.success(
                "Space debris retrieved successfully.",
                response
        );
    }

    @Override
    public ApiResponse<PagedResponse<DebrisResponse>> getAllDebris(
            String search,
            Pageable pageable) {

        Query query = debrisQueryBuilder.buildSearchQuery(search);

        long totalElements = mongoTemplate.count(query, SpaceDebris.class);

        query.with(pageable);

        List<SpaceDebris> debrisList =
                mongoTemplate.find(query, SpaceDebris.class);

        List<DebrisResponse> responses =
                debrisList.stream()
                        .map(debrisMapper::toResponse)
                        .toList();

        Page<DebrisResponse> page = new PageImpl<>(
                responses,
                pageable,
                totalElements
        );

        PagedResponse<DebrisResponse> pagedResponse =
                PagedResponse.from(page);

        return ResponseBuilder.success(
                "Space debris retrieved successfully.",
                pagedResponse
        );
    }

    @Override
    public ApiResponse<Void> deleteDebris(String id) {

        SpaceDebris debris = getActiveDebris(id);

        debris.setIsActive(false);

        debrisRepository.save(debris);

        return ResponseBuilder.success(
                "Space debris deleted successfully.",
                null
        );
    }

}