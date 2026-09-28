package com.orbitguard.satellite.integration.celestrak.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CelesTrakClientIntegrationTest {

    private final CelesTrakClient celesTrakClient =
            new CelesTrakClient(
                    RestClient.builder()
                            .baseUrl("https://celestrak.org")
                            .build(),
                    new ObjectMapper()
            );

    @Test
    void shouldFetchSatellitesByGroupFromCelesTrak() {

        List<CelesTrakSatelliteResponse> result =
                celesTrakClient.getSatellitesByGroup("STATIONS");

        assertNotNull(result);

        assertFalse(
                result.isEmpty(),
                "CelesTrak STATIONS group should return satellite data."
        );
    }
}