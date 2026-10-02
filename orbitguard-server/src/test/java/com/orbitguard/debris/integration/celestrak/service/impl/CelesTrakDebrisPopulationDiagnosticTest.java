package com.orbitguard.debris.integration.celestrak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;

class CelesTrakDebrisPopulationDiagnosticTest {

    private static final String BASE_URL =
            "https://celestrak.org";

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    private final RestClient restClient =
            RestClient.builder()
                    .baseUrl(BASE_URL)
                    .build();

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    @Test
    void diagnoseDebrisPopulationSources() {

        System.out.println();
        System.out.println("==============================================================");
        System.out.println("CELESTRAK DEBRIS POPULATION DIAGNOSTIC");
        System.out.println("==============================================================");

        System.out.println(
                "Purpose : Identify valid CelesTrak GP populations"
        );

        System.out.println(
                "Goal    : Find a suitable source for a large current debris dataset"
        );

        System.out.println(
                "=============================================================="
        );

        /*
         * ----------------------------------------------------------
         * IMPORTANT
         * ----------------------------------------------------------
         *
         * We intentionally test the existing known-valid
         * last-30-days group first.
         *
         * We also test the documented Active Satellites group.
         *
         * We do NOT use ONORBIT=1 here because our previous
         * diagnostic already proved that SATCAT query is invalid.
         */

        testGroup(
                "last-30-days",
                "Recent launches"
        );

        testGroup(
                "active",
                "Active Satellites"
        );


        System.out.println();
        System.out.println("==============================================================");
        System.out.println("DIAGNOSTIC COMPLETED");
        System.out.println("==============================================================");

        System.out.println();
        System.out.println(
                "Next step: compare the returned populations before modifying"
                        + " the production debris synchronization module."
        );

        System.out.println();
    }


    /**
     * Tests one CelesTrak GP group.
     */
    private void testGroup(
            String group,
            String description) {

        System.out.println();
        System.out.println("--------------------------------------------------------------");

        System.out.println(
                "GROUP       : "
                        + group
        );

        System.out.println(
                "DESCRIPTION : "
                        + description
        );

        System.out.println("--------------------------------------------------------------");


        String rawResponse;

        try {

            rawResponse =
                    restClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(GP_ENDPOINT)
                                    .queryParam(
                                            "GROUP",
                                            group
                                    )
                                    .queryParam(
                                            "FORMAT",
                                            "JSON"
                                    )
                                    .build())
                            .retrieve()
                            .body(String.class);

        } catch (Exception exception) {

            System.out.println(
                    "REQUEST RESULT : FAILED"
            );

            System.out.println(
                    "EXCEPTION TYPE : "
                            + exception.getClass().getName()
            );

            System.out.println(
                    "ERROR MESSAGE  : "
                            + exception.getMessage()
            );

            return;
        }


        /*
         * ----------------------------------------------------------
         * Validate raw response
         * ----------------------------------------------------------
         */

        if (rawResponse == null
                || rawResponse.isBlank()) {

            System.out.println(
                    "REQUEST RESULT : EMPTY RESPONSE"
            );

            return;
        }


        System.out.println(
                "RAW RESPONSE   : RECEIVED"
        );

        System.out.println(
                "RESPONSE SIZE  : "
                        + rawResponse.length()
                        + " characters"
        );


        /*
         * ----------------------------------------------------------
         * Parse JSON
         * ----------------------------------------------------------
         *
         * CelesTrak may return HTTP 200 with a plain-text
         * "Invalid query" response.
         *
         * Therefore we NEVER assume that HTTP 200 means
         * valid JSON.
         */

        JsonNode root;

        try {

            root =
                    objectMapper.readTree(
                            rawResponse
                    );

        } catch (Exception exception) {

            System.out.println(
                    "JSON RESULT    : INVALID"
            );

            System.out.println(
                    "RAW RESPONSE   : "
                            + shorten(
                            rawResponse,
                            500
                    )
            );

            return;
        }


        /*
         * ----------------------------------------------------------
         * Verify array
         * ----------------------------------------------------------
         */

        if (!root.isArray()) {

            System.out.println(
                    "JSON RESULT    : VALID JSON"
            );

            System.out.println(
                    "JSON TYPE      : "
                            + root.getNodeType()
            );

            System.out.println(
                    "UNEXPECTED JSON:"
            );

            System.out.println(
                    shorten(
                            root.toPrettyString(),
                            1000
                    )
            );

            return;
        }


        /*
         * ----------------------------------------------------------
         * Population statistics
         * ----------------------------------------------------------
         */

        int totalRecords =
                root.size();

        int recordsWithNorad =
                0;

        int recordsWithoutNorad =
                0;

        Set<Long> uniqueNoradIds =
                new HashSet<>();


        /*
         * ----------------------------------------------------------
         * Object-type statistics
         * ----------------------------------------------------------
         */

        int debrisCount =
                0;

        int payloadCount =
                0;

        int rocketBodyCount =
                0;

        int unknownObjectTypeCount =
                0;


        /*
         * ----------------------------------------------------------
         * Sample records
         * ----------------------------------------------------------
         */

        final int MAX_SAMPLES = 5;

        int sampleCount = 0;


        /*
         * ----------------------------------------------------------
         * Analyze records
         * ----------------------------------------------------------
         */

        for (JsonNode record : root) {

            if (record == null
                    || !record.isObject()) {

                continue;
            }


            /*
             * NORAD ID
             */

            Long noradId =
                    longValue(
                            record,
                            "NORAD_CAT_ID"
                    );

            if (noradId == null) {

                recordsWithoutNorad++;

            } else {

                recordsWithNorad++;

                uniqueNoradIds.add(
                        noradId
                );
            }


            /*
             * Object type
             */

            String objectType =
                    textValue(
                            record,
                            "OBJECT_TYPE"
                    );


            if ("DEB".equalsIgnoreCase(
                    objectType)) {

                debrisCount++;

            } else if ("PAY".equalsIgnoreCase(
                    objectType)) {

                payloadCount++;

            } else if ("R/B".equalsIgnoreCase(
                    objectType)) {

                rocketBodyCount++;

            } else {

                unknownObjectTypeCount++;
            }


            /*
             * Print a few samples.
             */

            if (sampleCount < MAX_SAMPLES) {

                System.out.println();

                System.out.println(
                        "SAMPLE #"
                                + (sampleCount + 1)
                );

                System.out.println(
                        "  NORAD       : "
                                + noradId
                );

                System.out.println(
                        "  OBJECT NAME : "
                                + textValue(
                                record,
                                "OBJECT_NAME"
                        )
                );

                System.out.println(
                        "  OBJECT ID   : "
                                + textValue(
                                record,
                                "OBJECT_ID"
                        )
                );

                System.out.println(
                        "  OBJECT TYPE : "
                                + objectType
                );

                System.out.println(
                        "  EPOCH       : "
                                + textValue(
                                record,
                                "EPOCH"
                        )
                );

                sampleCount++;
            }
        }


        /*
         * ----------------------------------------------------------
         * Print result
         * ----------------------------------------------------------
         */

        System.out.println();
        System.out.println(
                "GROUP RESULT"
        );

        System.out.println(
                "--------------------------------------------------------------"
        );

        System.out.println(
                "TOTAL RECORDS              : "
                        + totalRecords
        );

        System.out.println(
                "RECORDS WITH NORAD         : "
                        + recordsWithNorad
        );

        System.out.println(
                "RECORDS WITHOUT NORAD      : "
                        + recordsWithoutNorad
        );

        System.out.println(
                "UNIQUE NORAD IDS           : "
                        + uniqueNoradIds.size()
        );

        System.out.println();

        System.out.println(
                "OBJECT TYPE BREAKDOWN"
        );

        System.out.println(
                "  DEBRIS (DEB)             : "
                        + debrisCount
        );

        System.out.println(
                "  PAYLOAD (PAY)            : "
                        + payloadCount
        );

        System.out.println(
                "  ROCKET BODY (R/B)        : "
                        + rocketBodyCount
        );

        System.out.println(
                "  UNKNOWN / OTHER          : "
                        + unknownObjectTypeCount
        );

        System.out.println(
                "--------------------------------------------------------------"
        );
    }


    /**
     * Safely reads a JSON text field.
     */
    private String textValue(
            JsonNode node,
            String field) {

        JsonNode value =
                node.get(field);

        if (value == null
                || value.isNull()) {

            return null;
        }

        return value.asText();
    }


    /**
     * Safely reads a JSON Long field.
     */
    private Long longValue(
            JsonNode node,
            String field) {

        JsonNode value =
                node.get(field);

        if (value == null
                || value.isNull()) {

            return null;
        }

        if (value.isNumber()) {

            return value.longValue();
        }

        try {

            return Long.parseLong(
                    value.asText().trim()
            );

        } catch (NumberFormatException exception) {

            return null;
        }
    }


    /**
     * Prevents a huge invalid response from flooding
     * the Maven console.
     */
    private String shorten(
            String value,
            int maxLength) {

        if (value == null) {
            return null;
        }

        if (value.length() <= maxLength) {
            return value;
        }

        return value.substring(
                0,
                maxLength
        ) + "...";
    }
}