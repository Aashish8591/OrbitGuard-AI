package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.config.OrekitConfiguration;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RealDebrisCoordinateConversionTest {

    private static CoordinateConversionServiceImpl
            coordinateConversionService;

    @BeforeAll
    static void configureServices() {

        new OrekitConfiguration().configureOrekit();

        coordinateConversionService =
                new CoordinateConversionServiceImpl();
    }

    @Test
    void shouldConvertRealDebrisTemeStateToGeodeticPosition() {

        /*
         * Real verified SGP4 output for:
         *
         * IRIDIUM 33 DEB
         * NORAD ID: 33773
         *
         * The values below come directly from the
         * verified orbital propagation API response.
         */

        LocalDateTime timestamp =
                LocalDateTime.of(
                        2026,
                        9,
                        4,
                        11,
                        24,
                        50,
                        907_656_700
                );

        PropagatedOrbitalState propagatedState =
                PropagatedOrbitalState.builder()
                        .noradCatalogId(33773L)
                        .timestamp(timestamp)

                        /*
                         * Position in kilometers.
                         */
                        .positionX(3786.3284960337032)
                        .positionY(-5170.579083183626)
                        .positionZ(-3109.9145306969835)

                        /*
                         * Velocity in kilometers per second.
                         */
                        .velocityX(2.3415141117013234)
                        .velocityY(-2.3143410953738326)
                        .velocityZ(6.719030164089742)

                        /*
                         * Orekit SGP4 output reference frame.
                         */
                        .frame("TEME")

                        .build();

        GeodeticPosition result =
                coordinateConversionService
                        .toGeodeticPosition(propagatedState);

        assertNotNull(result);

        /*
         * Basic null checks.
         */
        assertNotNull(result.getLatitude());
        assertNotNull(result.getLongitude());
        assertNotNull(result.getAltitude());

        /*
         * Ensure calculated values are valid numbers.
         */
        assertTrue(
                Double.isFinite(result.getLatitude())
        );

        assertTrue(
                Double.isFinite(result.getLongitude())
        );

        assertTrue(
                Double.isFinite(result.getAltitude())
        );

        /*
         * Validate geographic ranges.
         */
        assertTrue(
                result.getLatitude() >= -90.0
                        && result.getLatitude() <= 90.0
        );

        assertTrue(
                result.getLongitude() >= -180.0
                        && result.getLongitude() <= 180.0
        );

        /*
         * A debris object in orbit should have
         * a positive altitude above the Earth
         * reference ellipsoid.
         */
        assertTrue(
                result.getAltitude() > 0.0
        );

        /*
         * Print the real calculated result so we can
         * inspect it during development.
         */
        System.out.println(
                "Real debris geodetic position:"
        );

        System.out.println(
                "Latitude  : "
                        + result.getLatitude()
                        + "°"
        );

        System.out.println(
                "Longitude : "
                        + result.getLongitude()
                        + "°"
        );

        System.out.println(
                "Altitude  : "
                        + result.getAltitude()
                        + " km"
        );
    }
}