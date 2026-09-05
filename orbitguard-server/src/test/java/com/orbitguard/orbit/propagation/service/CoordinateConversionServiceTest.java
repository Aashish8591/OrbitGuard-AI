package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.config.OrekitConfiguration;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class CoordinateConversionServiceTest {

    private static CoordinateConversionService coordinateConversionService;

    @BeforeAll
    static void setUp() {

        new OrekitConfiguration().configureOrekit();

        coordinateConversionService =
                new CoordinateConversionServiceImpl();
    }

    @Test
    void shouldConvertTemePositionToGeodeticPosition() {

        PropagatedOrbitalState propagatedState =
                PropagatedOrbitalState.builder()
                        .noradCatalogId(25544L)
                        .timestamp(
                                LocalDateTime.of(
                                        2026,
                                        9,
                                        4,
                                        9,
                                        0,
                                        0
                                )
                        )
                        .positionX(4000.0)
                        .positionY(3000.0)
                        .positionZ(5000.0)
                        .velocityX(1.0)
                        .velocityY(5.0)
                        .velocityZ(3.0)
                        .frame("TEME")
                        .build();

        GeodeticPosition result =
                coordinateConversionService
                        .toGeodeticPosition(propagatedState);

        assertNotNull(result);

        assertNotNull(result.getLatitude());
        assertNotNull(result.getLongitude());
        assertNotNull(result.getAltitude());

        assertTrue(
                result.getLatitude() >= -90.0
                        && result.getLatitude() <= 90.0
        );

        assertTrue(
                result.getLongitude() >= -180.0
                        && result.getLongitude() <= 180.0
        );

        assertTrue(result.getAltitude() > 0.0);
    }
}