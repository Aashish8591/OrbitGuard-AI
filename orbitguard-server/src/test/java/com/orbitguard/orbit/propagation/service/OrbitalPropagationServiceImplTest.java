package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.config.OrekitConfiguration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class OrbitalPropagationServiceImplTest {

    private final OrbitalPropagationServiceImpl service =
            new OrbitalPropagationServiceImpl();

    @BeforeAll
    static void configureOrekit() {
        new OrekitConfiguration().configureOrekit();
    }

    @Test
    void shouldPropagateIssOrbitalState() {

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

        PropagatedOrbitalState result =
                service.propagate(input);

        assertNotNull(result);

        assertEquals(25544L, result.getNoradCatalogId());
        assertEquals(epoch, result.getTimestamp());

        assertNotNull(result.getPositionX());
        assertNotNull(result.getPositionY());
        assertNotNull(result.getPositionZ());

        assertNotNull(result.getVelocityX());
        assertNotNull(result.getVelocityY());
        assertNotNull(result.getVelocityZ());

        assertTrue(Double.isFinite(result.getPositionX()));
        assertTrue(Double.isFinite(result.getPositionY()));
        assertTrue(Double.isFinite(result.getPositionZ()));

        assertTrue(Double.isFinite(result.getVelocityX()));
        assertTrue(Double.isFinite(result.getVelocityY()));
        assertTrue(Double.isFinite(result.getVelocityZ()));

        assertEquals("TEME", result.getFrame());
    }
}