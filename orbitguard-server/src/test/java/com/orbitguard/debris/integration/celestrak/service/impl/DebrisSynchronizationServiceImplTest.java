package com.orbitguard.debris.integration.celestrak.service.impl;

import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.enums.DebrisStatus;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.mapper.CelesTrakDebrisSyncMapper;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.debris.repository.DebrisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DebrisSynchronizationServiceImplTest {

    @Mock
    private CelesTrakDebrisService celesTrakService;

    @Mock
    private DebrisRepository debrisRepository;

    @Mock
    private CelesTrakDebrisSyncMapper syncMapper;

    @Mock
    private SequenceGeneratorService sequenceGeneratorService;

    @Mock
    private BusinessCodeGenerator businessCodeGenerator;

    @InjectMocks
    private DebrisSynchronizationServiceImpl synchronizationService;

    private CelesTrakDebrisResponse response;

    @BeforeEach
    void setUp() {

        response = new CelesTrakDebrisResponse();

        response.setObjectName("IRIDIUM 33 DEB");
        response.setNoradCatalogId(33773L);
    }

    @Test
    void shouldUpdateExistingDebris() {

        SpaceDebris existingDebris = SpaceDebris.builder()
                .id("debris-id")
                .debrisCode("DEB-000001")
                .debrisName("Old Name")
                .noradId(33773L)
                .isActive(false)
                .build();

        when(celesTrakService.fetchDebrisByGroup("DEBRIS"))
                .thenReturn(List.of(response));

        when(debrisRepository.findByNoradId(33773L))
                .thenReturn(Optional.of(existingDebris));

        synchronizationService.synchronizeDebris("DEBRIS");

        verify(debrisRepository).save(existingDebris);

        verifyNoInteractions(
                syncMapper,
                sequenceGeneratorService,
                businessCodeGenerator
        );
    }

    @Test
    void shouldInsertNewDebris() {

        SpaceDebris newDebris = SpaceDebris.builder()
                .debrisName("IRIDIUM 33 DEB")
                .noradId(33773L)
                .build();

        when(celesTrakService.fetchDebrisByGroup("DEBRIS"))
                .thenReturn(List.of(response));

        when(debrisRepository.findByNoradId(33773L))
                .thenReturn(Optional.empty());

        when(syncMapper.toEntity(response))
                .thenReturn(newDebris);

        when(sequenceGeneratorService.getNextSequence("debris_sequence"))
                .thenReturn(1L);

        when(businessCodeGenerator.generate("DEB", 1L))
                .thenReturn("DEB-000001");

        synchronizationService.synchronizeDebris("DEBRIS");

        verify(sequenceGeneratorService)
                .getNextSequence("debris_sequence");

        verify(businessCodeGenerator)
                .generate("DEB", 1L);

        verify(debrisRepository).save(newDebris);
    }

    @Test
    void shouldDoNothingWhenCelesTrakReturnsNoData() {

        when(celesTrakService.fetchDebrisByGroup("DEBRIS"))
                .thenReturn(List.of());

        synchronizationService.synchronizeDebris("DEBRIS");

        verify(debrisRepository, never())
                .save(any(SpaceDebris.class));

        verify(debrisRepository, never())
                .findByNoradId(anyLong());
    }

    @Test
    void shouldRejectBlankGroup() {

        assertThrows(
                IllegalArgumentException.class,
                () -> synchronizationService.synchronizeDebris(" ")
        );

        verifyNoInteractions(
                celesTrakService,
                debrisRepository,
                syncMapper,
                sequenceGeneratorService,
                businessCodeGenerator
        );
    }
}