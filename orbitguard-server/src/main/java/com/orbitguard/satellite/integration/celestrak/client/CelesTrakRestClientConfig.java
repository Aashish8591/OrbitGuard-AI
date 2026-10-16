
package com.orbitguard.satellite.integration.celestrak.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class CelesTrakRestClientConfig {

    private static final String CELESTRAK_BASE_URL =
            "https://celestrak.org";

    private static final Duration CONNECT_TIMEOUT =
            Duration.ofSeconds(5);

    private static final Duration READ_TIMEOUT =
            Duration.ofSeconds(15);

    @Bean
    public RestClient celesTrakRestClient() {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(CONNECT_TIMEOUT);
        requestFactory.setReadTimeout(READ_TIMEOUT);

        return RestClient.builder()
                .baseUrl(CELESTRAK_BASE_URL)
                .requestFactory(requestFactory)
                .build();
    }
}
