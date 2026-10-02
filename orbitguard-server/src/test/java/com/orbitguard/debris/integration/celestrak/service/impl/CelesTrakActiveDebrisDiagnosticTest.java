package com.orbitguard.debris.integration.celestrak.service.impl;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class CelesTrakActiveDebrisDiagnosticTest {

    private static final String BASE_URL =
            "https://celestrak.org";

    private static final String SATCAT_ENDPOINT =
            "/satcat/records.php";

    private final RestClient restClient =
            RestClient.builder()
                    .baseUrl(BASE_URL)
                    .build();


    @Test
    void diagnoseActiveDebrisHttpResponse() {

        System.out.println();
        System.out.println("==================================================");
        System.out.println("CELESTRAK SATCAT HTTP DIAGNOSTIC");
        System.out.println("==================================================");

        System.out.println(
                "URL : https://celestrak.org/satcat/records.php"
        );

        System.out.println(
                "QUERY : ONORBIT=1&FORMAT=JSON"
        );

        System.out.println("--------------------------------------------------");


        ResponseEntity<String> response;

        try {

            response =
                    restClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(SATCAT_ENDPOINT)
                                    .queryParam("ONORBIT", "1")
                                    .queryParam("FORMAT", "JSON")
                                    .build())
                            .exchange(
                                    (request, clientResponse) -> {

                                        HttpStatusCode status =
                                                clientResponse.getStatusCode();

                                        HttpHeaders headers =
                                                clientResponse.getHeaders();

                                        String body =
                                                new String(
                                                        clientResponse
                                                                .getBody()
                                                                .readAllBytes()
                                                );

                                        return ResponseEntity
                                                .status(status)
                                                .headers(headers)
                                                .body(body);
                                    }
                            );

        } catch (Exception exception) {

            System.out.println();
            System.out.println(
                    "REQUEST EXCEPTION"
            );

            System.out.println(
                    "TYPE : "
                            + exception.getClass().getName()
            );

            System.out.println(
                    "MESSAGE : "
                            + exception.getMessage()
            );

            System.out.println(
                    "=================================================="
            );

            return;
        }


        assertNotNull(response);


        System.out.println(
                "HTTP STATUS : "
                        + response.getStatusCode()
        );

        System.out.println(
                "HTTP STATUS CODE : "
                        + response.getStatusCode().value()
        );

        System.out.println(
                "CONTENT TYPE : "
                        + response.getHeaders()
                        .getFirst(HttpHeaders.CONTENT_TYPE)
        );

        System.out.println(
                "CONTENT LENGTH : "
                        + response.getHeaders()
                        .getFirst(HttpHeaders.CONTENT_LENGTH)
        );

        System.out.println();
        System.out.println("--------------------------------------------------");
        System.out.println("RESPONSE BODY");
        System.out.println("--------------------------------------------------");


        String body =
                response.getBody();

        if (body == null) {

            System.out.println(
                    "BODY : NULL"
            );

        } else {

            System.out.println(
                    body.length() > 1000
                            ? body.substring(0, 1000)
                            : body
            );
        }


        System.out.println();
        System.out.println("--------------------------------------------------");

        if (response.getStatusCode().is2xxSuccessful()) {

            System.out.println(
                    "RESULT : HTTP 200 SUCCESS"
            );

        } else {

            System.out.println(
                    "RESULT : HTTP REQUEST FAILED"
            );
        }

        System.out.println(
                "=================================================="
        );

        System.out.println();
    }
}