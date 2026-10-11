
package com.orbitguard.debris.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.sequence.SequenceGeneratorService;
import com.orbitguard.common.util.BusinessCodeGenerator;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.mapper.CelesTrakDebrisSyncMapper;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

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

    @Mock
    private OrbitalPropagationService orbitalPropagationService;

    @InjectMocks
    private DebrisSynchronizationServiceImpl synchronizationService;

    private CelesTrakDebrisResponse response;

    @BeforeEach
    void setUp() {
        // Keep shared setup free of stubbing.
        // Each test configures only the behavior it needs.
        response = org.mockito.Mockito.mock(
                CelesTrakDebrisResponse.class
        );
    }

    @Test
    void synchronizeDebris_shouldInsertNewDebris() {

        when(celesTrakService.fetchDebrisByGroup("DEB"))
                .thenReturn(List.of(response));

        when(response.getNoradCatalogId())
                .thenReturn(36238L);

        SpaceDebris newDebris = SpaceDebris.builder()
                .noradId(36238L)
                .build();

        when(syncMapper.toEntity(response))
                .thenReturn(newDebris);

        when(sequenceGeneratorService.getNextSequence("debris_sequence"))
                .thenReturn(1L);

        when(businessCodeGenerator.generate("DEB", 1L))
                .thenReturn("DEB-000001");

        when(debrisRepository.findByNoradId(36238L))
                .thenReturn(Optional.empty());

        when(debrisRepository.save(any(SpaceDebris.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> synchronizationService.synchronizeDebris("DEB")
        );

        verify(syncMapper).toEntity(response);
        verify(debrisRepository).save(newDebris);

        org.junit.jupiter.api.Assertions.assertEquals(
                "DEB-000001",
                newDebris.getDebrisCode()
        );

        org.junit.jupiter.api.Assertions.assertEquals(
                true,
                newDebris.getIsActive()
        );
    }

    @Test
    void synchronizeDebris_shouldUpdateExistingDebris() {

        when(celesTrakService.fetchDebrisByGroup("DEB"))
                .thenReturn(List.of(response));

        when(response.getNoradCatalogId())
                .thenReturn(36238L);

        SpaceDebris existingDebris = SpaceDebris.builder()
                .id("existing-debris-id")
                .debrisCode("DEB-000100")
                .noradId(36238L)
                .isActive(false)
                .build();

        when(debrisRepository.findByNoradId(36238L))
                .thenReturn(Optional.of(existingDebris));

        when(debrisRepository.save(any(SpaceDebris.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> synchronizationService.synchronizeDebris("DEB")
        );

        verify(syncMapper).updateEntity(existingDebris, response);
        verify(debrisRepository).save(existingDebris);

        org.junit.jupiter.api.Assertions.assertEquals(
                true,
                existingDebris.getIsActive()
        );

        // Existing business identity must be preserved.
        org.junit.jupiter.api.Assertions.assertEquals(
                "DEB-000100",
                existingDebris.getDebrisCode()
        );

        verify(sequenceGeneratorService, never())
                .getNextSequence("debris_sequence");
    }

    @Test
    void synchronizeDebris_shouldDoNothingWhenProviderReturnsNoRecords() {

        when(celesTrakService.fetchDebrisByGroup("DEB"))
                .thenReturn(List.of());

        assertDoesNotThrow(
                () -> synchronizationService.synchronizeDebris("DEB")
        );

        verify(celesTrakService).fetchDebrisByGroup("DEB");

        verifyNoInteractions(
                debrisRepository,
                syncMapper,
                sequenceGeneratorService,
                businessCodeGenerator,
                orbitalPropagationService
        );
    }

    @Test
    void synchronizeDebris_shouldSkipInvalidNoradId() {

        when(celesTrakService.fetchDebrisByGroup("DEB"))
                .thenReturn(List.of(response));

        when(response.getNoradCatalogId())
                .thenReturn(0L);

        assertDoesNotThrow(
                () -> synchronizationService.synchronizeDebris("DEB")
        );

        verify(debrisRepository, never())
                .findByNoradId(any());

        verify(debrisRepository, never())
                .save(any(SpaceDebris.class));

        verifyNoInteractions(
                syncMapper,
                sequenceGeneratorService,
                businessCodeGenerator,
                orbitalPropagationService
        );
    }

    @Test
    void synchronizeDebris_shouldSkipNullResponse() {

        when(celesTrakService.fetchDebrisByGroup("DEB"))
                .thenReturn(Arrays.asList(
                        (CelesTrakDebrisResponse) null
                ));

        assertDoesNotThrow(
                () -> synchronizationService.synchronizeDebris("DEB")
        );

        verify(debrisRepository, never())
                .findByNoradId(any());

        verify(debrisRepository, never())
                .save(any(SpaceDebris.class));

        verifyNoInteractions(
                syncMapper,
                sequenceGeneratorService,
                businessCodeGenerator,
                orbitalPropagationService
        );
    }

    @Test
    void synchronizeDebris_shouldContinueAfterOneRecordFails() {

        CelesTrakDebrisResponse failingResponse =
                org.mockito.Mockito.mock(
                        CelesTrakDebrisResponse.class
                );

        CelesTrakDebrisResponse validResponse =
                org.mockito.Mockito.mock(
                        CelesTrakDebrisResponse.class
                );

        when(celesTrakService.fetchDebrisByGroup("DEB"))
                .thenReturn(List.of(
                        failingResponse,
                        validResponse
                ));

        when(failingResponse.getNoradCatalogId())
                .thenReturn(36238L);

        when(validResponse.getNoradCatalogId())
                .thenReturn(99999L);

        when(debrisRepository.findByNoradId(36238L))
                .thenThrow(
                        new IllegalStateException(
                                "Simulated record failure"
                        )
                );

        when(debrisRepository.findByNoradId(99999L))
                .thenReturn(Optional.empty());

        SpaceDebris validDebris = SpaceDebris.builder()
                .noradId(99999L)
                .build();

        when(syncMapper.toEntity(validResponse))
                .thenReturn(validDebris);

        when(sequenceGeneratorService.getNextSequence("debris_sequence"))
                .thenReturn(2L);

        when(businessCodeGenerator.generate("DEB", 2L))
                .thenReturn("DEB-000002");

        when(debrisRepository.save(any(SpaceDebris.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(
                () -> synchronizationService.synchronizeDebris("DEB")
        );

        // The first record failed, but the second was processed.
        verify(debrisRepository).findByNoradId(36238L);
        verify(debrisRepository).findByNoradId(99999L);
        verify(syncMapper).toEntity(validResponse);
        verify(debrisRepository).save(validDebris);
    }

    @Test
    void synchronizeDebris_shouldRejectBlankGroup() {

        assertThrows(
                BadRequestException.class,
                () -> synchronizationService.synchronizeDebris("   ")
        );

        verifyNoInteractions(
                celesTrakService,
                debrisRepository,
                syncMapper,
                sequenceGeneratorService,
                businessCodeGenerator,
                orbitalPropagationService
        );
    }
}
