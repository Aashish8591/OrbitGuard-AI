package com.orbitguard.satellite.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.satellite.integration.celestrak.client.CelesTrakClient;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import com.orbitguard.satellite.integration.celestrak.mapper.CelesTrakSatelliteMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
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

    private CelesTrakServiceImpl celesTrakService;

    @BeforeEach
    void setUp() {

        celesTrakService =
                new CelesTrakServiceImpl(
                        celesTrakClient,
                        celesTrakSatelliteMapper
                );
    }

    // =========================================================================
    // fetchSatelliteOrbitalData()
    // =========================================================================

    @Test
    void fetchSatelliteOrbitalData_shouldReturnMappedOrbitalData() {

        CelesTrakSatelliteResponse response =
                mock(CelesTrakSatelliteResponse.class);

        CelesTrakOrbitalData orbitalData =
                CelesTrakOrbitalData.builder()
                        .satelliteName("ISS (ZARYA)")
                        .objectId("1998-067A")
                        .noradCatalogId(25544)
                        .meanMotion(15.49312345)
                        .eccentricity(0.0004123)
                        .inclination(51.6412)
                        .classificationType("U")
                        .build();

        when(celesTrakClient.getSatelliteByNoradId(25544))
                .thenReturn(List.of(response));

        when(celesTrakSatelliteMapper.toOrbitalData(response))
                .thenReturn(orbitalData);

        List<CelesTrakOrbitalData> result =
                celesTrakService.fetchSatelliteOrbitalData(25544);

        assertNotNull(result);

        assertEquals(1, result.size());

        CelesTrakOrbitalData resultData =
                result.get(0);

        assertEquals(
                "ISS (ZARYA)",
                resultData.getSatelliteName()
        );

        assertEquals(
                "1998-067A",
                resultData.getObjectId()
        );

        assertEquals(
                25544,
                resultData.getNoradCatalogId()
        );

        assertEquals(
                15.49312345,
                resultData.getMeanMotion()
        );

        assertEquals(
                0.0004123,
                resultData.getEccentricity()
        );

        assertEquals(
                51.6412,
                resultData.getInclination()
        );

        assertEquals(
                "U",
                resultData.getClassificationType()
        );

        verify(celesTrakClient)
                .getSatelliteByNoradId(25544);

        verify(celesTrakSatelliteMapper)
                .toOrbitalData(response);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldReturnEmptyList_whenClientReturnsNull() {

        when(celesTrakClient.getSatelliteByNoradId(25544))
                .thenReturn(null);

        List<CelesTrakOrbitalData> result =
                celesTrakService.fetchSatelliteOrbitalData(25544);

        assertNotNull(result);

        assertTrue(result.isEmpty());

        verify(celesTrakClient)
                .getSatelliteByNoradId(25544);

        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldReturnEmptyList_whenClientReturnsEmptyList() {

        when(celesTrakClient.getSatelliteByNoradId(25544))
                .thenReturn(List.of());

        List<CelesTrakOrbitalData> result =
                celesTrakService.fetchSatelliteOrbitalData(25544);

        assertNotNull(result);

        assertTrue(result.isEmpty());

        verify(celesTrakClient)
                .getSatelliteByNoradId(25544);

        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldIgnoreNullResponses() {

        CelesTrakSatelliteResponse response =
                mock(CelesTrakSatelliteResponse.class);

        CelesTrakOrbitalData orbitalData =
                CelesTrakOrbitalData.builder()
                        .satelliteName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        when(celesTrakClient.getSatelliteByNoradId(25544))
                .thenReturn(
                        java.util.Arrays.asList(
                                null,
                                response
                        )
                );

        when(celesTrakSatelliteMapper.toOrbitalData(response))
                .thenReturn(orbitalData);

        List<CelesTrakOrbitalData> result =
                celesTrakService.fetchSatelliteOrbitalData(25544);

        assertNotNull(result);

        assertEquals(1, result.size());

        assertEquals(
                "ISS (ZARYA)",
                result.get(0).getSatelliteName()
        );

        verify(celesTrakSatelliteMapper)
                .toOrbitalData(response);

        verifyNoMoreInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldIgnoreNullMappedData() {

        CelesTrakSatelliteResponse response =
                mock(CelesTrakSatelliteResponse.class);

        when(celesTrakClient.getSatelliteByNoradId(25544))
                .thenReturn(List.of(response));

        when(celesTrakSatelliteMapper.toOrbitalData(response))
                .thenReturn(null);

        List<CelesTrakOrbitalData> result =
                celesTrakService.fetchSatelliteOrbitalData(25544);

        assertNotNull(result);

        assertTrue(result.isEmpty());

        verify(celesTrakClient)
                .getSatelliteByNoradId(25544);

        verify(celesTrakSatelliteMapper)
                .toOrbitalData(response);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldRejectNullNoradCatalogId() {

        assertThrows(
                BadRequestException.class,
                () ->
                        celesTrakService
                                .fetchSatelliteOrbitalData(null)
        );

        verifyNoInteractions(celesTrakClient);
        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldRejectZeroNoradCatalogId() {

        assertThrows(
                BadRequestException.class,
                () ->
                        celesTrakService
                                .fetchSatelliteOrbitalData(0)
        );

        verifyNoInteractions(celesTrakClient);
        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatelliteOrbitalData_shouldRejectNegativeNoradCatalogId() {

        assertThrows(
                BadRequestException.class,
                () ->
                        celesTrakService
                                .fetchSatelliteOrbitalData(-25544)
        );

        verifyNoInteractions(celesTrakClient);
        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    // =========================================================================
    // fetchSatellitesByGroup()
    // =========================================================================

    @Test
    void fetchSatellitesByGroup_shouldReturnSatellites() {

        CelesTrakSatelliteResponse firstResponse =
                mock(CelesTrakSatelliteResponse.class);

        CelesTrakSatelliteResponse secondResponse =
                mock(CelesTrakSatelliteResponse.class);

        when(celesTrakClient.getSatellitesByGroup("STATIONS"))
                .thenReturn(
                        List.of(
                                firstResponse,
                                secondResponse
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup(
                        "stations"
                );

        assertNotNull(result);

        assertEquals(2, result.size());

        assertSame(
                firstResponse,
                result.get(0)
        );

        assertSame(
                secondResponse,
                result.get(1)
        );

        verify(celesTrakClient)
                .getSatellitesByGroup("STATIONS");

        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatellitesByGroup_shouldNormalizeGroupBeforeCallingClient() {

        when(celesTrakClient.getSatellitesByGroup("CUBESATS"))
                .thenReturn(List.of());

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup(
                        "  cubesats  "
                );

        assertNotNull(result);

        assertTrue(result.isEmpty());

        verify(celesTrakClient)
                .getSatellitesByGroup("CUBESATS");
    }

    @Test
    void fetchSatellitesByGroup_shouldReturnEmptyList_whenClientReturnsNull() {

        when(celesTrakClient.getSatellitesByGroup("STATIONS"))
                .thenReturn(null);

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup(
                        "STATIONS"
                );

        assertNotNull(result);

        assertTrue(result.isEmpty());

        verify(celesTrakClient)
                .getSatellitesByGroup("STATIONS");
    }

    @Test
    void fetchSatellitesByGroup_shouldReturnEmptyList_whenClientReturnsEmptyList() {

        when(celesTrakClient.getSatellitesByGroup("STATIONS"))
                .thenReturn(List.of());

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup(
                        "STATIONS"
                );

        assertNotNull(result);

        assertTrue(result.isEmpty());

        verify(celesTrakClient)
                .getSatellitesByGroup("STATIONS");
    }

    @Test
    void fetchSatellitesByGroup_shouldIgnoreNullResponses() {

        CelesTrakSatelliteResponse response =
                mock(CelesTrakSatelliteResponse.class);

        when(celesTrakClient.getSatellitesByGroup("STATIONS"))
                .thenReturn(
                        java.util.Arrays.asList(
                                null,
                                response
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakService.fetchSatellitesByGroup(
                        "STATIONS"
                );

        assertNotNull(result);

        assertEquals(1, result.size());

        assertSame(
                response,
                result.get(0)
        );

        verify(celesTrakClient)
                .getSatellitesByGroup("STATIONS");
    }

    @Test
    void fetchSatellitesByGroup_shouldRejectNullGroup() {

        assertThrows(
                BadRequestException.class,
                () ->
                        celesTrakService
                                .fetchSatellitesByGroup(null)
        );

        verifyNoInteractions(celesTrakClient);
        verifyNoInteractions(celesTrakSatelliteMapper);
    }

    @Test
    void fetchSatellitesByGroup_shouldRejectBlankGroup() {

        assertThrows(
                BadRequestException.class,
                () ->
                        celesTrakService
                                .fetchSatellitesByGroup("   ")
        );

        verifyNoInteractions(celesTrakClient);
        verifyNoInteractions(celesTrakSatelliteMapper);
    }
}