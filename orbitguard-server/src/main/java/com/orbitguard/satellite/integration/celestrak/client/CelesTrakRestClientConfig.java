package com.orbitguard.satellite.integration.celestrak.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CelesTrakRestClientConfig {

    @Bean
    public RestClient celesTrakRestClient() {
        return RestClient.builder()
                .baseUrl("https://celestrak.org")
                .build();
    }
}