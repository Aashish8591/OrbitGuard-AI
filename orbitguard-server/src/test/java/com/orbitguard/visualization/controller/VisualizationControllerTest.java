package com.orbitguard.visualization.controller;

import com.orbitguard.common.response.ApiResponse;
import com.orbitguard.visualization.dto.VisualizationObjectResponse;
import com.orbitguard.visualization.dto.VisualizationResponse;
import com.orbitguard.visualization.service.VisualizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisualizationControllerTest {

    @Mock
    private VisualizationService visualizationService;

    @InjectMocks
    private VisualizationController visualizationController;

    @Test
    void shouldGetSatelliteVisualizationSuccessfully() {

        Integer noradCatalogId = 25544;

        LocalDateTime targetTime =
                LocalDateTime.of(
                        2026,
                        9,
                        9,
                        10,
                        30,
                        0
                );

        VisualizationObjectResponse object =
                VisualizationObjectResponse.builder()
                        .noradId(25544L)
                        .name("Satellite")
                        .objectType("SATELLITE")
                        .latitude(15.884353572888452)
                        .longitude(110.07435468856596)
                        .altitudeKm(419.59605975028893)
                        .timestamp(targetTime.toString())
                        .build();

        VisualizationResponse visualizationResponse =
                VisualizationResponse.builder()
                        .object(object)
                        .propagatedAt(targetTime.toString())
                        .build();

        when(
                visualizationService.getSatelliteVisualization(
                        noradCatalogId,
                        targetTime
                )
        ).thenReturn(visualizationResponse);

        ApiResponse<VisualizationResponse> response =
                visualizationController.getSatelliteVisualization(
                        noradCatalogId,
                        targetTime
                );

        assertNotNull(response);
        assertTrue(response.isSuccess());

        assertEquals(
                "Satellite visualization position retrieved successfully.",
                response.getMessage()
        );

        assertNotNull(response.getData());

        assertEquals(
                25544L,
                response.getData()
                        .getObject()
                        .getNoradId()
        );

        assertEquals(
                "SATELLITE",
                response.getData()
                        .getObject()
                        .getObjectType()
        );

        assertEquals(
                15.884353572888452,
                response.getData()
                        .getObject()
                        .getLatitude()
        );

        assertEquals(
                110.07435468856596,
                response.getData()
                        .getObject()
                        .getLongitude()
        );

        assertEquals(
                419.59605975028893,
                response.getData()
                        .getObject()
                        .getAltitudeKm()
        );

        assertEquals(
                targetTime.toString(),
                response.getData()
                        .getPropagatedAt()
        );

        verify(
                visualizationService,
                times(1)
        ).getSatelliteVisualization(
                noradCatalogId,
                targetTime
        );
    }

    @Test
    void shouldGetDebrisVisualizationSuccessfully() {

        Long noradId = 33773L;

        LocalDateTime targetTime =
                LocalDateTime.of(
                        2026,
                        9,
                        9,
                        10,
                        50,
                        58
                );

        VisualizationObjectResponse object =
                VisualizationObjectResponse.builder()
                        .noradId(33773L)
                        .name("Debris")
                        .objectType("DEBRIS")
                        .latitude(-82.15677611044599)
                        .longitude(1.6206448793178412)
                        .altitudeKm(774.0640937142141)
                        .timestamp(targetTime.toString())
                        .build();

        VisualizationResponse visualizationResponse =
                VisualizationResponse.builder()
                        .object(object)
                        .propagatedAt(targetTime.toString())
                        .build();

        when(
                visualizationService.getDebrisVisualization(
                        noradId,
                        targetTime
                )
        ).thenReturn(visualizationResponse);

        ApiResponse<VisualizationResponse> response =
                visualizationController.getDebrisVisualization(
                        noradId,
                        targetTime
                );

        assertNotNull(response);
        assertTrue(response.isSuccess());

        assertEquals(
                "Debris visualization position retrieved successfully.",
                response.getMessage()
        );

        assertNotNull(response.getData());

        assertEquals(
                33773L,
                response.getData()
                        .getObject()
                        .getNoradId()
        );

        assertEquals(
                "DEBRIS",
                response.getData()
                        .getObject()
                        .getObjectType()
        );

        assertEquals(
                -82.15677611044599,
                response.getData()
                        .getObject()
                        .getLatitude()
        );

        assertEquals(
                1.6206448793178412,
                response.getData()
                        .getObject()
                        .getLongitude()
        );

        assertEquals(
                774.0640937142141,
                response.getData()
                        .getObject()
                        .getAltitudeKm()
        );

        assertEquals(
                targetTime.toString(),
                response.getData()
                        .getPropagatedAt()
        );

        verify(
                visualizationService,
                times(1)
        ).getDebrisVisualization(
                noradId,
                targetTime
        );
    }

    @Test
    void shouldUseCurrentTimeWhenSatelliteTargetTimeIsNotProvided() {

        Integer noradCatalogId = 25544;

        LocalDateTime beforeCall = LocalDateTime.now();

        VisualizationResponse visualizationResponse =
                VisualizationResponse.builder()
                        .object(
                                VisualizationObjectResponse.builder()
                                        .noradId(25544L)
                                        .name("Satellite")
                                        .objectType("SATELLITE")
                                        .latitude(15.0)
                                        .longitude(110.0)
                                        .altitudeKm(420.0)
                                        .timestamp(beforeCall.toString())
                                        .build()
                        )
                        .propagatedAt(beforeCall.toString())
                        .build();

        when(
                visualizationService.getSatelliteVisualization(
                        eq(noradCatalogId),
                        any(LocalDateTime.class)
                )
        ).thenReturn(visualizationResponse);

        ApiResponse<VisualizationResponse> response =
                visualizationController.getSatelliteVisualization(
                        noradCatalogId,
                        null
                );

        LocalDateTime afterCall = LocalDateTime.now();

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());

        verify(
                visualizationService,
                times(1)
        ).getSatelliteVisualization(
                eq(noradCatalogId),
                argThat(time ->
                        time != null
                                && !time.isBefore(beforeCall)
                                && !time.isAfter(afterCall)
                )
        );
    }

    @Test
    void shouldUseCurrentTimeWhenDebrisTargetTimeIsNotProvided() {

        Long noradId = 33773L;

        LocalDateTime beforeCall = LocalDateTime.now();

        VisualizationResponse visualizationResponse =
                VisualizationResponse.builder()
                        .object(
                                VisualizationObjectResponse.builder()
                                        .noradId(33773L)
                                        .name("Debris")
                                        .objectType("DEBRIS")
                                        .latitude(-82.0)
                                        .longitude(1.6)
                                        .altitudeKm(774.0)
                                        .timestamp(beforeCall.toString())
                                        .build()
                        )
                        .propagatedAt(beforeCall.toString())
                        .build();

        when(
                visualizationService.getDebrisVisualization(
                        eq(noradId),
                        any(LocalDateTime.class)
                )
        ).thenReturn(visualizationResponse);

        ApiResponse<VisualizationResponse> response =
                visualizationController.getDebrisVisualization(
                        noradId,
                        null
                );

        LocalDateTime afterCall = LocalDateTime.now();

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());

        verify(
                visualizationService,
                times(1)
        ).getDebrisVisualization(
                eq(noradId),
                argThat(time ->
                        time != null
                                && !time.isBefore(beforeCall)
                                && !time.isAfter(afterCall)
                )
        );
    }
}