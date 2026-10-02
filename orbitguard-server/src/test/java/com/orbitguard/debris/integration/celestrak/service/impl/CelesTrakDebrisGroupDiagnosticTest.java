package com.orbitguard.debris.integration.celestrak.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CelesTrakDebrisGroupDiagnosticTest {

    private final RestClient restClient =
            RestClient.builder()
                    .baseUrl("https://celestrak.org")
                    .build();

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    @Test
    void inspectLast30DaysGroup() {

        String group = "last-30-days";

        CelesTrakDebrisResponse[] responses =
                fetchGroup(group);

        assertNotNull(responses);

        System.out.println();
        System.out.println("==============================================");
        System.out.println("CELESTRAK GROUP DIAGNOSTIC");
        System.out.println("==============================================");
        System.out.println("GROUP          : " + group);
        System.out.println("TOTAL RESPONSE : " + responses.length);
        System.out.println("----------------------------------------------");

        long validNoradCount =
                Arrays.stream(responses)
                        .filter(response ->
                                response != null
                                        && response.getNoradCatalogId() != null
                                        && response.getNoradCatalogId() > 0
                        )
                        .count();

        long invalidNoradCount =
                responses.length - validNoradCount;

        Set<Long> uniqueNoradIds =
                new HashSet<>();

        Arrays.stream(responses)
                .filter(response ->
                        response != null
                                && response.getNoradCatalogId() != null
                )
                .forEach(response ->
                        uniqueNoradIds.add(
                                response.getNoradCatalogId()
                        )
                );

        System.out.println(
                "VALID NORAD    : " + validNoradCount
        );

        System.out.println(
                "INVALID NORAD  : " + invalidNoradCount
        );

        System.out.println(
                "UNIQUE NORAD   : " + uniqueNoradIds.size()
        );

        System.out.println("==============================================");
        System.out.println();

        assertFalse(
                responses.length == 0,
                "CelesTrak returned zero objects for last-30-days"
        );
    }


    @Test
    void inspectLast90DaysGroup() {

        String group = "last-90-days";

        System.out.println();
        System.out.println("==============================================");
        System.out.println("CELESTRAK GROUP DIAGNOSTIC");
        System.out.println("==============================================");
        System.out.println("GROUP : " + group);
        System.out.println("----------------------------------------------");

        try {

            CelesTrakDebrisResponse[] responses =
                    fetchGroup(group);

            System.out.println(
                    "REQUEST SUCCESSFUL"
            );

            System.out.println(
                    "RESPONSE COUNT : "
                            + (responses == null
                            ? 0
                            : responses.length)
            );

            if (responses != null) {

                long validNoradCount =
                        Arrays.stream(responses)
                                .filter(response ->
                                        response != null
                                                && response.getNoradCatalogId() != null
                                                && response.getNoradCatalogId() > 0
                                )
                                .count();

                System.out.println(
                        "VALID NORAD : "
                                + validNoradCount
                );
            }

        } catch (Exception exception) {

            System.out.println(
                    "REQUEST FAILED"
            );

            System.out.println(
                    "EXCEPTION TYPE : "
                            + exception.getClass().getName()
            );

            System.out.println(
                    "ERROR MESSAGE  : "
                            + exception.getMessage()
            );

            System.out.println(
                    "ROOT CAUSE     : "
                            + getRootCauseMessage(exception)
            );

            System.out.println(
                    "=============================================="
            );

            /*
             * This test is diagnostic.
             *
             * We intentionally do not assert failure here.
             * The purpose is to capture exactly what
             * CelesTrak does with the requested group.
             */
        }

        System.out.println();
    }


    private CelesTrakDebrisResponse[] fetchGroup(
            String group) {

        return restClient.get()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/NORAD/elements/gp.php")
                                .queryParam(
                                        "GROUP",
                                        group
                                )
                                .queryParam(
                                        "FORMAT",
                                        "JSON"
                                )
                                .build()
                )
                .retrieve()
                .body(
                        CelesTrakDebrisResponse[].class
                );
    }


    private String getRootCauseMessage(
            Throwable throwable) {

        Throwable rootCause = throwable;

        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        return rootCause.getMessage();
    }
}