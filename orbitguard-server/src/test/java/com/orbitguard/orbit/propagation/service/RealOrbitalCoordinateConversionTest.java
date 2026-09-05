package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.config.OrekitConfiguration;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RealOrbitalCoordinateConversionTest {

    private static OrbitalPropagationServiceImpl
            orbitalPropagationService;

    private static CoordinateConversionServiceImpl
            coordinateConversionService;

    @BeforeAll
    static void configureServices() {

        new OrekitConfiguration().configureOrekit();

        orbitalPropagationService =
                new OrbitalPropagationServiceImpl();

        coordinateConversionService =
                new CoordinateConversionServiceImpl();
    }

    @Test
    void shouldConvertRealIssPropagationToGeodeticPosition() {

        LocalDateTime epoch =
                LocalDateTime.of(
                        2026,
                        9,
                        3,
                        4,
                        13,
                        21,
                        864_000_000
                );

        OrbitalPropagationInput input =
                OrbitalPropagationInput.builder()
                        .noradCatalogId(25544L)
                        .classificationType("U")
                        .epoch(epoch)
                        .objectId("1998-067A")
                        .ephemerisType(0)
                        .meanMotion(15.48977273)
                        .meanMotionDot(0.00004078)
                        .meanMotionDdot(0.0)
                        .eccentricity(0.0005015)
                        .inclination(51.6312)
                        .rightAscensionOfAscendingNode(274.0958)
                        .argumentOfPericenter(102.3118)
                        .meanAnomaly(257.8432)
                        .bstar(0.000082215)
                        .elementSetNumber(999)
                        .revolutionAtEpoch(58384L)
                        .targetTime(epoch)
                        .build();

        PropagatedOrbitalState propagatedState =
                orbitalPropagationService.propagate(input);

        GeodeticPosition result =
                coordinateConversionService
                        .toGeodeticPosition(propagatedState);

        assertNotNull(propagatedState);
        assertNotNull(result);

        assertEquals(
                25544L,
                propagatedState.getNoradCatalogId()
        );

        assertEquals(
                "TEME",
                propagatedState.getFrame()
        );

        assertNotNull(result.getLatitude());
        assertNotNull(result.getLongitude());
        assertNotNull(result.getAltitude());

        assertTrue(
                Double.isFinite(result.getLatitude())
        );

        assertTrue(
                Double.isFinite(result.getLongitude())
        );

        assertTrue(
                Double.isFinite(result.getAltitude())
        );

        assertTrue(
                result.getLatitude() >= -90.0
                        && result.getLatitude() <= 90.0
        );

        assertTrue(
                result.getLongitude() >= -180.0
                        && result.getLongitude() <= 180.0
        );

        assertTrue(
                result.getAltitude() > 0.0
        );
    }
}