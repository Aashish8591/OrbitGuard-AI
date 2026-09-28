package com.orbitguard.satellite.integration.celestrak.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CelesTrakRestClientConfig {

    private static final String CELESTRAK_BASE_URL =
            "https://celestrak.org";

    /**
     * Creates the RestClient used for communication
     * with the CelesTrak API.
     *
     * The base URL is configured here so that individual
     * client methods only need to provide the API path.
     *
     * Example:
     *
     * Base URL:
     * https://celestrak.org
     *
     * Endpoint:
     * /NORAD/elements/gp.php
     *
     * Final request:
     * https://celestrak.org/NORAD/elements/gp.php
     */
    @Bean
    public RestClient celesTrakRestClient() {

        return RestClient.builder()
                .baseUrl(CELESTRAK_BASE_URL)
                .build();
    }
}