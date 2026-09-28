package com.orbitguard.satellite.integration.celestrak.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import static org.springframework.http.HttpMethod.GET;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;

import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class CelesTrakClientTest {

    private CelesTrakClient celesTrakClient;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {

        RestClient.Builder restClientBuilder =
                RestClient.builder()
                        .baseUrl("https://celestrak.org");

        mockServer =
                MockRestServiceServer.bindTo(restClientBuilder)
                        .build();

        RestClient restClient =
                restClientBuilder.build();

        celesTrakClient =
                new CelesTrakClient(
                        restClient,
                        new ObjectMapper()
                );
    }

    @AfterEach
    void tearDown() {
        mockServer.reset();
    }

    // =========================================================================
    // getSatelliteByNoradId()
    // =========================================================================

    @Test
    void getSatelliteByNoradId_shouldReturnSatelliteData() {

        String jsonResponse = """
                [
                  {
                    "OBJECT_NAME": "ISS (ZARYA)",
                    "OBJECT_ID": "1998-067A",
                    "EPOCH": "2026-09-25T12:30:00.000000",
                    "MEAN_MOTION": 15.49312345,
                    "ECCENTRICITY": 0.0004123,
                    "INCLINATION": 51.6412,
                    "RA_OF_ASC_NODE": 120.1234,
                    "ARG_OF_PERICENTER": 250.5678,
                    "MEAN_ANOMALY": 110.1234,
                    "EPHEMERIS_TYPE": 0,
                    "CLASSIFICATION_TYPE": "U",
                    "NORAD_CAT_ID": 25544,
                    "ELEMENT_SET_NO": 999,
                    "REV_AT_EPOCH": 12345,
                    "BSTAR": 0.00012345,
                    "MEAN_MOTION_DOT": 0.00000123,
                    "MEAN_MOTION_DDOT": 0.00000001
                  }
                ]
                """;

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?CATNR=25544&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                jsonResponse,
                                MediaType.TEXT_PLAIN
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakClient.getSatelliteByNoradId(25544);

        assertNotNull(result);

        assertEquals(1, result.size());

        CelesTrakSatelliteResponse satellite =
                result.get(0);

        assertEquals(
                "ISS (ZARYA)",
                satellite.getObjectName()
        );

        assertEquals(
                "1998-067A",
                satellite.getObjectId()
        );

        assertEquals(
                25544,
                satellite.getNoradCatalogId()
        );

        assertEquals(
                15.49312345,
                satellite.getMeanMotion()
        );

        assertEquals(
                0.0004123,
                satellite.getEccentricity()
        );

        assertEquals(
                51.6412,
                satellite.getInclination()
        );

        assertEquals(
                "U",
                satellite.getClassificationType()
        );

        mockServer.verify();
    }

    @Test
    void getSatelliteByNoradId_shouldReturnEmptyList_whenCelesTrakReturnsEmptyArray() {

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?CATNR=99999&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                "[]",
                                MediaType.TEXT_PLAIN
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakClient.getSatelliteByNoradId(99999);

        assertNotNull(result);

        assertTrue(result.isEmpty());

        mockServer.verify();
    }

    @Test
    void getSatelliteByNoradId_shouldRejectNullNoradId() {

        assertThrows(
                BadRequestException.class,
                () -> celesTrakClient.getSatelliteByNoradId(null)
        );
    }

    @Test
    void getSatelliteByNoradId_shouldRejectZeroNoradId() {

        assertThrows(
                BadRequestException.class,
                () -> celesTrakClient.getSatelliteByNoradId(0)
        );
    }

    @Test
    void getSatelliteByNoradId_shouldRejectNegativeNoradId() {

        assertThrows(
                BadRequestException.class,
                () -> celesTrakClient.getSatelliteByNoradId(-25544)
        );
    }

    // =========================================================================
    // getSatellitesByGroup()
    // =========================================================================

    @Test
    void getSatellitesByGroup_shouldReturnMultipleSatellites() {

        String jsonResponse = """
                [
                  {
                    "OBJECT_NAME": "ISS (ZARYA)",
                    "OBJECT_ID": "1998-067A",
                    "EPOCH": "2026-09-25T12:30:00.000000",
                    "MEAN_MOTION": 15.49312345,
                    "ECCENTRICITY": 0.0004123,
                    "INCLINATION": 51.6412,
                    "RA_OF_ASC_NODE": 120.1234,
                    "ARG_OF_PERICENTER": 250.5678,
                    "MEAN_ANOMALY": 110.1234,
                    "NORAD_CAT_ID": 25544
                  },
                  {
                    "OBJECT_NAME": "HUBBLE SPACE TELESCOPE",
                    "OBJECT_ID": "1990-037B",
                    "EPOCH": "2026-09-25T12:30:00.000000",
                    "MEAN_MOTION": 15.09234567,
                    "ECCENTRICITY": 0.0002789,
                    "INCLINATION": 28.4698,
                    "RA_OF_ASC_NODE": 100.4567,
                    "ARG_OF_PERICENTER": 200.1234,
                    "MEAN_ANOMALY": 90.4567,
                    "NORAD_CAT_ID": 20580
                  }
                ]
                """;

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?GROUP=STATIONS&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                jsonResponse,
                                MediaType.TEXT_PLAIN
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakClient.getSatellitesByGroup("stations");

        assertNotNull(result);

        assertEquals(2, result.size());

        assertEquals(
                "ISS (ZARYA)",
                result.get(0).getObjectName()
        );

        assertEquals(
                25544,
                result.get(0).getNoradCatalogId()
        );

        assertEquals(
                "HUBBLE SPACE TELESCOPE",
                result.get(1).getObjectName()
        );

        assertEquals(
                20580,
                result.get(1).getNoradCatalogId()
        );

        mockServer.verify();
    }

    @Test
    void getSatellitesByGroup_shouldNormalizeGroupToUpperCase() {

        String jsonResponse = """
                [
                  {
                    "OBJECT_NAME": "ISS (ZARYA)",
                    "OBJECT_ID": "1998-067A",
                    "NORAD_CAT_ID": 25544
                  }
                ]
                """;

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?GROUP=CUBESATS&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                jsonResponse,
                                MediaType.TEXT_PLAIN
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakClient.getSatellitesByGroup(
                        "  cubesats  "
                );

        assertNotNull(result);

        assertEquals(1, result.size());

        assertEquals(
                25544,
                result.get(0).getNoradCatalogId()
        );

        mockServer.verify();
    }

    @Test
    void getSatellitesByGroup_shouldReturnEmptyList_whenResponseIsEmpty() {

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?GROUP=STATIONS&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                "[]",
                                MediaType.TEXT_PLAIN
                        )
                );

        List<CelesTrakSatelliteResponse> result =
                celesTrakClient.getSatellitesByGroup("STATIONS");

        assertNotNull(result);

        assertTrue(result.isEmpty());

        mockServer.verify();
    }

    @Test
    void getSatellitesByGroup_shouldRejectNullGroup() {

        assertThrows(
                BadRequestException.class,
                () -> celesTrakClient.getSatellitesByGroup(null)
        );
    }

    @Test
    void getSatellitesByGroup_shouldRejectBlankGroup() {

        assertThrows(
                BadRequestException.class,
                () -> celesTrakClient.getSatellitesByGroup("   ")
        );
    }

    // =========================================================================
    // Error handling
    // =========================================================================

    @Test
    void getSatelliteByNoradId_shouldThrowException_whenCelesTrakReturnsServerError() {

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?CATNR=25544&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withServerError()
                );

        assertThrows(
                IllegalStateException.class,
                () -> celesTrakClient.getSatelliteByNoradId(25544)
        );

        mockServer.verify();
    }

    @Test
    void getSatellitesByGroup_shouldThrowException_whenResponseIsNotJson() {

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?GROUP=STATIONS&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                "No GP data available.",
                                MediaType.TEXT_PLAIN
                        )
                );

        assertThrows(
                IllegalStateException.class,
                () -> celesTrakClient.getSatellitesByGroup("STATIONS")
        );

        mockServer.verify();
    }

    @Test
    void getSatelliteByNoradId_shouldThrowException_whenJsonIsMalformed() {

        String malformedJson = """
                [
                  {
                    "OBJECT_NAME": "ISS (ZARYA)",
                    "NORAD_CAT_ID": 25544
                """;

        mockServer.expect(
                        requestTo(
                                "https://celestrak.org/NORAD/elements/gp.php"
                                        + "?CATNR=25544&FORMAT=JSON"
                        )
                )
                .andExpect(method(GET))
                .andRespond(
                        withSuccess(
                                malformedJson,
                                MediaType.TEXT_PLAIN
                        )
                );

        assertThrows(
                IllegalStateException.class,
                () -> celesTrakClient.getSatelliteByNoradId(25544)
        );

        mockServer.verify();
    }
}