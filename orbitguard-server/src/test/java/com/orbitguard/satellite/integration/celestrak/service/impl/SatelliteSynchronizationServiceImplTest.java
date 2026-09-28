package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteSyncMapper;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import com.orbitguard.satellite.repository.SatelliteRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SatelliteSynchronizationServiceImplTest {

    @Mock
    private CelesTrakService celesTrakService;

    @Mock
    private SatelliteRepository satelliteRepository;

    @Mock
    private CelesTrakSatelliteSyncMapper syncMapper;

    @InjectMocks
    private SatelliteSynchronizationServiceImpl synchronizationService;

    private CelesTrakSatelliteResponse response;

    @BeforeEach
    void setUp() {

        response = CelesTrakSatelliteResponse.builder()
                .objectName("ISS (ZARYA)")
                .noradCatalogId(25544)
                .build();
    }

    // -------------------------------------------------------------------------
    // synchronizeSatellites()
    // -------------------------------------------------------------------------

    @Test
    void synchronizeSatellites_shouldInsertNewSatellite() {

        Satellite satellite =
                Satellite.builder()
                        .satelliteName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.empty());

        when(syncMapper.toSatellite(response))
                .thenReturn(satellite);

        when(satelliteRepository.save(any(Satellite.class)))
                .thenReturn(satellite);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(celesTrakService)
                .fetchSatellitesByGroup("STATIONS");

        verify(satelliteRepository)
                .findByNoradCatalogId(25544);

        verify(syncMapper)
                .toSatellite(response);

        verify(satelliteRepository)
                .save(satellite);
    }

    @Test
    void synchronizeSatellites_shouldUpdateExistingSatellite() {

        Satellite existingSatellite =
                Satellite.builder()
                        .satelliteName("OLD NAME")
                        .noradCatalogId(25544)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.of(existingSatellite));

        when(satelliteRepository.save(any(Satellite.class)))
                .thenReturn(existingSatellite);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(celesTrakService)
                .fetchSatellitesByGroup("STATIONS");

        verify(satelliteRepository)
                .findByNoradCatalogId(25544);

        verify(satelliteRepository)
                .save(existingSatellite);

        verify(syncMapper, never())
                .toSatellite(any(CelesTrakSatelliteResponse.class));
    }

    @Test
    void synchronizeSatellites_shouldNormalizeGroup() {

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of());

        synchronizationService.synchronizeSatellites(
                "  stations  "
        );

        verify(celesTrakService)
                .fetchSatellitesByGroup("STATIONS");

        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldDoNothingWhenCelesTrakReturnsEmptyList() {

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of());

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(celesTrakService)
                .fetchSatellitesByGroup("STATIONS");

        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldDoNothingWhenCelesTrakReturnsNull() {

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(null);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(celesTrakService)
                .fetchSatellitesByGroup("STATIONS");

        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldSkipNullResponse() {

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(
                        java.util.Arrays.asList(
                                null,
                                response
                        )
                );

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.empty());

        Satellite satellite =
                Satellite.builder()
                        .satelliteName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        when(syncMapper.toSatellite(response))
                .thenReturn(satellite);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(satelliteRepository)
                .findByNoradCatalogId(25544);

        verify(syncMapper)
                .toSatellite(response);

        verify(satelliteRepository)
                .save(satellite);
    }

    @Test
    void synchronizeSatellites_shouldSkipInvalidNoradId() {

        CelesTrakSatelliteResponse invalidResponse =
                CelesTrakSatelliteResponse.builder()
                        .objectName("INVALID SATELLITE")
                        .noradCatalogId(0)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(invalidResponse));

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(celesTrakService)
                .fetchSatellitesByGroup("STATIONS");

        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldSkipNegativeNoradId() {

        CelesTrakSatelliteResponse invalidResponse =
                CelesTrakSatelliteResponse.builder()
                        .objectName("INVALID SATELLITE")
                        .noradCatalogId(-25544)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(invalidResponse));

        synchronizationService.synchronizeSatellites("STATIONS");

        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldSkipNullNoradId() {

        CelesTrakSatelliteResponse invalidResponse =
                CelesTrakSatelliteResponse.builder()
                        .objectName("INVALID SATELLITE")
                        .noradCatalogId(null)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(invalidResponse));

        synchronizationService.synchronizeSatellites("STATIONS");

        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldRejectNullGroup() {

        assertThrows(
                RuntimeException.class,
                () ->
                        synchronizationService
                                .synchronizeSatellites(null)
        );

        verifyNoInteractions(celesTrakService);
        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldRejectBlankGroup() {

        assertThrows(
                RuntimeException.class,
                () ->
                        synchronizationService
                                .synchronizeSatellites("   ")
        );

        verifyNoInteractions(celesTrakService);
        verifyNoInteractions(satelliteRepository);
        verifyNoInteractions(syncMapper);
    }

    @Test
    void synchronizeSatellites_shouldNotSaveWhenMapperReturnsNull() {

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.empty());

        when(syncMapper.toSatellite(response))
                .thenReturn(null);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(satelliteRepository)
                .findByNoradCatalogId(25544);

        verify(syncMapper)
                .toSatellite(response);

        verify(satelliteRepository, never())
                .save(any(Satellite.class));
    }

    @Test
    void synchronizeSatellites_shouldNotInsertWhenMapperProducesInvalidNoradId() {

        Satellite invalidSatellite =
                Satellite.builder()
                        .satelliteName("INVALID")
                        .noradCatalogId(0)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.empty());

        when(syncMapper.toSatellite(response))
                .thenReturn(invalidSatellite);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(syncMapper)
                .toSatellite(response);

        verify(satelliteRepository, never())
                .save(any(Satellite.class));
    }

    @Test
    void synchronizeSatellites_shouldProcessMultipleSatellites() {

        CelesTrakSatelliteResponse satelliteResponse1 =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        CelesTrakSatelliteResponse satelliteResponse2 =
                CelesTrakSatelliteResponse.builder()
                        .objectName("HUBBLE SPACE TELESCOPE")
                        .noradCatalogId(20580)
                        .build();

        Satellite satellite1 =
                Satellite.builder()
                        .satelliteName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        Satellite satellite2 =
                Satellite.builder()
                        .satelliteName("HUBBLE SPACE TELESCOPE")
                        .noradCatalogId(20580)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(
                        List.of(
                                satelliteResponse1,
                                satelliteResponse2
                        )
                );

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.empty());

        when(satelliteRepository.findByNoradCatalogId(20580))
                .thenReturn(Optional.empty());

        when(syncMapper.toSatellite(satelliteResponse1))
                .thenReturn(satellite1);

        when(syncMapper.toSatellite(satelliteResponse2))
                .thenReturn(satellite2);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(satelliteRepository)
                .findByNoradCatalogId(25544);

        verify(satelliteRepository)
                .findByNoradCatalogId(20580);

        verify(syncMapper)
                .toSatellite(satelliteResponse1);

        verify(syncMapper)
                .toSatellite(satelliteResponse2);

        verify(satelliteRepository)
                .save(satellite1);

        verify(satelliteRepository)
                .save(satellite2);
    }

    @Test
    void synchronizeSatellites_shouldNotCallMapperForExistingSatellite() {

        Satellite existingSatellite =
                Satellite.builder()
                        .satelliteName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.of(existingSatellite));

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(satelliteRepository)
                .findByNoradCatalogId(25544);

        verify(satelliteRepository)
                .save(existingSatellite);

        verifyNoInteractions(syncMapper);
    }
}