package com.orbitguard.satellite.integration.celestrak.client;

import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CelesTrakClient {

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    private final RestClient celesTrakRestClient;



    /**
     * Fetch current GP orbital data from CelesTrak
     * using the NORAD catalog ID.
     */
    public List<CelesTrakSatelliteResponse> getSatelliteByNoradId(
            Integer noradCatalogId) {

        if (noradCatalogId == null || noradCatalogId <= 0) {
            throw new IllegalArgumentException(
                    "NORAD catalog ID must be greater than zero."
            );
        }

        CelesTrakSatelliteResponse[] response =
                celesTrakRestClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path(GP_ENDPOINT)
                                .queryParam("CATNR", noradCatalogId)
                                .queryParam("FORMAT", "JSON")
                                .build())
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .body(CelesTrakSatelliteResponse[].class);

        if (response == null) {
            return Collections.emptyList();
        }

        return Arrays.asList(response);
    }

    public List<CelesTrakSatelliteResponse> getSatellitesByGroup(String group) {

        if (group == null || group.isBlank()) {
            throw new IllegalArgumentException("CelesTrak group must not be blank.");
        }

        CelesTrakSatelliteResponse[] response =
                celesTrakRestClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path(GP_ENDPOINT)
                                .queryParam("GROUP", group)
                                .queryParam("FORMAT", "JSON")
                                .build())
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .body(CelesTrakSatelliteResponse[].class);

        if (response == null) {
            return Collections.emptyList();
        }

        return Arrays.asList(response);
    }
}