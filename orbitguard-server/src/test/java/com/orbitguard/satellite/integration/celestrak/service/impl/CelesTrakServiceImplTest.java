package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.satellite.integration.celestrak.client.CelesTrakClient;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CelesTrakServiceImplTest {

    @Mock
    private CelesTrakClient celesTrakClient;

    @Mock
    private CelesTrakSatelliteMapper celesTrakSatelliteMapper;

    @InjectMocks
    private CelesTrakServiceImpl celesTrakService;

    @Test
    void shouldFetchSatellitesByGroup() {

        CelesTrakSatelliteResponse response =
                new CelesTrakSatelliteResponse();

        List<CelesTrakSatelliteResponse> expected =
                List.of(response);

        when(celesTrakClient.getSatellitesByGroup("STATIONS"))
                .thenReturn(expected);

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup("STATIONS");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertSame(response, result.get(0));

        verify(celesTrakClient, times(1))
                .getSatellitesByGroup("STATIONS");
    }

    @Test
    void shouldRejectBlankGroup() {

        assertThrows(
                IllegalArgumentException.class,
                () -> celesTrakService.fetchSatellitesByGroup(" ")
        );

        verifyNoInteractions(celesTrakClient);
    }

    @Test
    void shouldRejectNullGroup() {

        assertThrows(
                IllegalArgumentException.class,
                () -> celesTrakService.fetchSatellitesByGroup(null)
        );

        verifyNoInteractions(celesTrakClient);
    }

    @Test
    void shouldReturnEmptyListWhenClientReturnsEmptyList() {

        when(celesTrakClient.getSatellitesByGroup("STATIONS"))
                .thenReturn(List.of());

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup("STATIONS");

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(celesTrakClient, times(1))
                .getSatellitesByGroup("STATIONS");
    }
}