package com.orbitguard.visualization.service.impl;

import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationFacade;
import com.orbitguard.visualization.constants.VisualizationApiConstants;
import com.orbitguard.visualization.dto.VisualizationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisualizationServiceImplTest {

    @Mock
    private OrbitalPropagationFacade orbitalPropagationFacade;

    @InjectMocks
    private VisualizationServiceImpl visualizationService;

    private LocalDateTime targetTime;

    @BeforeEach
    void setUp() {
        targetTime = LocalDateTime.of(
                2026,
                9,
                9,
                10,
                30,
                0
        );
    }

    @Test
    void shouldGetSatelliteVisualizationSuccessfully() {

        Long noradCatalogId = 25544L;

        PropagatedOrbitalState orbitalState =
                PropagatedOrbitalState.builder()
                        .noradCatalogId(noradCatalogId)
                        .timestamp(targetTime)
                        .positionX(4000.0)
                        .positionY(3000.0)
                        .positionZ(5000.0)
                        .velocityX(1.0)
                        .velocityY(5.0)
                        .velocityZ(3.0)
                        .frame("TEME")
                        .build();

        GeodeticPosition geodeticPosition =
                GeodeticPosition.builder()
                        .latitude(12.50)
                        .longitude(73.80)
                        .altitude(408.20)
                        .build();

        PropagatedOrbitalData propagatedData =
                PropagatedOrbitalData.builder()
                        .orbitalState(orbitalState)
                        .geodeticPosition(geodeticPosition)
                        .build();

        when(
                orbitalPropagationFacade.propagateSatelliteWithPosition(
                        25544,
                        targetTime
                )
        ).thenReturn(propagatedData);

        VisualizationResponse response =
                visualizationService.getSatelliteVisualization(
                        25544,
                        targetTime
                );

        assertNotNull(response);
        assertNotNull(response.getObject());

        assertEquals(
                25544L,
                response.getObject().getNoradId()
        );

        assertEquals(
                "Satellite",
                response.getObject().getName()
        );

        assertEquals(
                VisualizationApiConstants.SATELLITE_OBJECT_TYPE,
                response.getObject().getObjectType()
        );

        assertEquals(
                12.50,
                response.getObject().getLatitude()
        );

        assertEquals(
                73.80,
                response.getObject().getLongitude()
        );

        assertEquals(
                408.20,
                response.getObject().getAltitudeKm()
        );

        assertEquals(
                targetTime.toString(),
                response.getObject().getTimestamp()
        );

        assertEquals(
                targetTime.toString(),
                response.getPropagatedAt()
        );

        verify(
                orbitalPropagationFacade,
                times(1)
        ).propagateSatelliteWithPosition(
                25544,
                targetTime
        );
    }

    @Test
    void shouldGetDebrisVisualizationSuccessfully() {

        Long noradId = 33773L;

        PropagatedOrbitalState orbitalState =
                PropagatedOrbitalState.builder()
                        .noradCatalogId(noradId)
                        .timestamp(targetTime)
                        .positionX(3786.328)
                        .positionY(-5170.579)
                        .positionZ(-3109.914)
                        .velocityX(2.341)
                        .velocityY(-2.314)
                        .velocityZ(6.719)
                        .frame("TEME")
                        .build();

        GeodeticPosition geodeticPosition =
                GeodeticPosition.builder()
                        .latitude(-20.25)
                        .longitude(42.75)
                        .altitude(780.50)
                        .build();

        PropagatedOrbitalData propagatedData =
                PropagatedOrbitalData.builder()
                        .orbitalState(orbitalState)
                        .geodeticPosition(geodeticPosition)
                        .build();

        when(
                orbitalPropagationFacade.propagateDebrisWithPosition(
                        noradId,
                        targetTime
                )
        ).thenReturn(propagatedData);

        VisualizationResponse response =
                visualizationService.getDebrisVisualization(
                        noradId,
                        targetTime
                );

        assertNotNull(response);
        assertNotNull(response.getObject());

        assertEquals(
                noradId,
                response.getObject().getNoradId()
        );

        assertEquals(
                "Debris",
                response.getObject().getName()
        );

        assertEquals(
                VisualizationApiConstants.DEBRIS_OBJECT_TYPE,
                response.getObject().getObjectType()
        );

        assertEquals(
                -20.25,
                response.getObject().getLatitude()
        );

        assertEquals(
                42.75,
                response.getObject().getLongitude()
        );

        assertEquals(
                780.50,
                response.getObject().getAltitudeKm()
        );

        assertEquals(
                targetTime.toString(),
                response.getObject().getTimestamp()
        );

        assertEquals(
                targetTime.toString(),
                response.getPropagatedAt()
        );

        verify(
                orbitalPropagationFacade,
                times(1)
        ).propagateDebrisWithPosition(
                noradId,
                targetTime
        );
    }
}