package com.orbitguard.debris.integration.celestrak.client;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component("debrisCelesTrakClient")
@RequiredArgsConstructor
public class CelesTrakClient {

    private static final String GP_ENDPOINT = "/NORAD/elements/gp.php";

    private final RestClient celesTrakRestClient;

    public CelesTrakDebrisResponse[] fetchOrbitalData(Long noradId) {

        return celesTrakRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(GP_ENDPOINT)
                        .queryParam("CATNR", noradId)
                        .queryParam("FORMAT", "JSON")
                        .build())
                .retrieve()
                .body(CelesTrakDebrisResponse[].class);
    }

    public CelesTrakDebrisResponse[] fetchDebrisByGroup(String group) {

        return celesTrakRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(GP_ENDPOINT)
                        .queryParam("GROUP", group)
                        .queryParam("FORMAT", "JSON")
                        .build())
                .retrieve()
                .body(CelesTrakDebrisResponse[].class);
    }
}