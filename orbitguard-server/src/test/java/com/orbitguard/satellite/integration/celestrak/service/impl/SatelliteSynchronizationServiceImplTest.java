package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteSyncMapper;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import com.orbitguard.satellite.repository.SatelliteRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

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

    @Test
    void shouldUpdateExistingSatellite() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        Satellite existingSatellite =
                Satellite.builder()
                        .id("sat-001")
                        .satelliteName("Old ISS Name")
                        .satelliteCode("ISS-001")
                        .noradCatalogId(25544)
                        .operator("NASA")
                        .country("USA")
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.of(existingSatellite));

        synchronizationService.synchronizeSatellites("STATIONS");

        assertEquals(
                "ISS (ZARYA)",
                existingSatellite.getSatelliteName()
        );

        assertEquals(
                25544,
                existingSatellite.getNoradCatalogId()
        );

        assertEquals(
                "ISS-001",
                existingSatellite.getSatelliteCode()
        );

        assertEquals(
                "NASA",
                existingSatellite.getOperator()
        );

        verify(satelliteRepository).save(existingSatellite);
        verify(syncMapper, never()).toSatellite(any());
    }

    @Test
    void shouldInsertNewSatellite() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        Satellite newSatellite =
                Satellite.builder()
                        .satelliteName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of(response));

        when(satelliteRepository.findByNoradCatalogId(25544))
                .thenReturn(Optional.empty());

        when(syncMapper.toSatellite(response))
                .thenReturn(newSatellite);

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(syncMapper).toSatellite(response);
        verify(satelliteRepository).save(newSatellite);
    }

    @Test
    void shouldDoNothingWhenCelesTrakReturnsNoData() {

        when(celesTrakService.fetchSatellitesByGroup("STATIONS"))
                .thenReturn(List.of());

        synchronizationService.synchronizeSatellites("STATIONS");

        verify(satelliteRepository, never())
                .findByNoradCatalogId(anyInt());

        verify(satelliteRepository, never())
                .save(any(Satellite.class));
    }

    @Test
    void shouldRejectBlankGroup() {

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> synchronizationService.synchronizeSatellites(" ")
        );

        verifyNoInteractions(
                celesTrakService,
                satelliteRepository,
                syncMapper
        );
    }
}