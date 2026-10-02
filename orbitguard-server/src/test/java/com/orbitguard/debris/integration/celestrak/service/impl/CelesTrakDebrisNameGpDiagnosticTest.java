package com.orbitguard.debris.integration.celestrak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;

class CelesTrakDebrisNameGpDiagnosticTest {

    private static final String BASE_URL =
            "https://celestrak.org";

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    private static final String DEBRIS_NAME =
            "DEB";

    private static final int MAX_SAMPLES = 15;

    private final RestClient restClient =
            RestClient.builder()
                    .baseUrl(BASE_URL)
                    .build();

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    @Test
    void diagnoseDebrisNameGpPopulation() throws Exception {

        System.out.println();
        System.out.println(
                "================================================================"
        );
        System.out.println(
                "CELESTRAK DEBRIS NAME -> GP POPULATION DIAGNOSTIC"
        );
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "SOURCE          : CelesTrak GP"
        );

        System.out.println(
                "QUERY           : NAME=DEB"
        );

        System.out.println(
                "FORMAT          : JSON"
        );

        System.out.println(
                "PURPOSE         : Determine whether NAME=DEB can provide"
        );

        System.out.println(
                "                  a large usable debris GP population"
        );

        System.out.println(
                "TARGET          : ~10,000 debris objects"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );


        /*
         * ------------------------------------------------------------
         * Request CelesTrak GP data.
         * ------------------------------------------------------------
         *
         * IMPORTANT:
         *
         * GP supports NAME queries.
         *
         * We intentionally DO NOT use:
         *
         *     ONORBIT=1
         *
         * because that is a SATCAT flag, not a GP query parameter.
         *
         * We also DO NOT use:
         *
         *     GROUP=SATCAT
         *
         * because SATCAT is not a GP group.
         */
        String rawResponse =
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path(GP_ENDPOINT)
                                .queryParam("NAME", DEBRIS_NAME)
                                .queryParam("FORMAT", "JSON")
                                .build())
                        .retrieve()
                        .body(String.class);


        /*
         * ------------------------------------------------------------
         * Validate response.
         * ------------------------------------------------------------
         */

        assertFalse(
                rawResponse == null
                        || rawResponse.isBlank(),
                "CelesTrak returned an empty GP response."
        );


        System.out.println(
                "RAW RESPONSE RECEIVED : YES"
        );

        System.out.println(
                "RESPONSE SIZE          : "
                        + rawResponse.length()
                        + " characters"
        );


        /*
         * ------------------------------------------------------------
         * Detect obvious non-JSON response.
         * ------------------------------------------------------------
         */

        String trimmed =
                rawResponse.trim();

        if (!trimmed.startsWith("[")
                && !trimmed.startsWith("{")) {

            System.out.println();
            System.out.println(
                    "NON-JSON RESPONSE:"
            );

            System.out.println(
                    trimmed.substring(
                            0,
                            Math.min(
                                    500,
                                    trimmed.length()
                            )
                    )
            );

            throw new IllegalStateException(
                    "CelesTrak GP endpoint did not return JSON."
            );
        }


        /*
         * ------------------------------------------------------------
         * Parse JSON.
         * ------------------------------------------------------------
         */

        JsonNode root =
                objectMapper.readTree(
                        rawResponse
                );


        if (!root.isArray()) {

            System.out.println();
            System.out.println(
                    "UNEXPECTED JSON STRUCTURE:"
            );

            System.out.println(
                    root.toPrettyString()
            );

            throw new IllegalStateException(
                    "Expected GP JSON array."
            );
        }


        /*
         * ------------------------------------------------------------
         * Counters.
         * ------------------------------------------------------------
         */

        int totalRecords =
                root.size();

        int recordsWithNorad =
                0;

        int recordsWithoutNorad =
                0;

        int recordsWithEpoch =
                0;

        int recordsWithoutEpoch =
                0;

        int recordsWithMeanMotion =
                0;

        int recordsWithInclination =
                0;

        int recordsWithEccentricity =
                0;

        int recordsWithApogee =
                0;

        int recordsWithPerigee =
                0;

        Set<Long> uniqueNoradIds =
                new HashSet<>();


        /*
         * ------------------------------------------------------------
         * Sample records.
         * ------------------------------------------------------------
         */

        int samplePrinted =
                0;


        /*
         * ------------------------------------------------------------
         * Analyze every GP record.
         * ------------------------------------------------------------
         */

        for (JsonNode record : root) {

            Long noradId =
                    longValue(
                            record,
                            "NORAD_CAT_ID"
                    );

            String objectName =
                    textValue(
                            record,
                            "OBJECT_NAME"
                    );

            String objectId =
                    textValue(
                            record,
                            "OBJECT_ID"
                    );

            String epoch =
                    textValue(
                            record,
                            "EPOCH"
                    );


            /*
             * NORAD
             */
            if (noradId != null) {

                recordsWithNorad++;

                uniqueNoradIds.add(
                        noradId
                );

            } else {

                recordsWithoutNorad++;
            }


            /*
             * Epoch
             */
            if (epoch != null
                    && !epoch.isBlank()) {

                recordsWithEpoch++;

            } else {

                recordsWithoutEpoch++;
            }


            /*
             * Mean motion
             */
            if (hasValue(
                    record,
                    "MEAN_MOTION"
            )) {

                recordsWithMeanMotion++;
            }


            /*
             * Inclination
             */
            if (hasValue(
                    record,
                    "INCLINATION"
            )) {

                recordsWithInclination++;
            }


            /*
             * Eccentricity
             */
            if (hasValue(
                    record,
                    "ECCENTRICITY"
            )) {

                recordsWithEccentricity++;
            }


            /*
             * Apogee
             */
            if (hasValue(
                    record,
                    "APOGEE"
            )) {

                recordsWithApogee++;
            }


            /*
             * Perigee
             */
            if (hasValue(
                    record,
                    "PERIGEE"
            )) {

                recordsWithPerigee++;
            }


            /*
             * --------------------------------------------------------
             * Print representative samples.
             * --------------------------------------------------------
             */

            if (samplePrinted < MAX_SAMPLES) {

                System.out.println();
                System.out.println(
                        "SAMPLE #"
                                + (samplePrinted + 1)
                );

                System.out.println(
                        "  NORAD       : "
                                + noradId
                );

                System.out.println(
                        "  OBJECT NAME : "
                                + objectName
                );

                System.out.println(
                        "  OBJECT ID   : "
                                + objectId
                );

                System.out.println(
                        "  EPOCH       : "
                                + epoch
                );

                System.out.println(
                        "  INCLINATION : "
                                + textValue(
                                record,
                                "INCLINATION"
                        )
                );

                System.out.println(
                        "  ECCENTRICITY : "
                                + textValue(
                                record,
                                "ECCENTRICITY"
                        )
                );

                System.out.println(
                        "  APOGEE      : "
                                + textValue(
                                record,
                                "APOGEE"
                        )
                );

                System.out.println(
                        "  PERIGEE     : "
                                + textValue(
                                record,
                                "PERIGEE"
                        )
                );

                System.out.println(
                        "  MEAN MOTION : "
                                + textValue(
                                record,
                                "MEAN_MOTION"
                        )
                );

                samplePrinted++;
            }
        }


        /*
         * ------------------------------------------------------------
         * Final report.
         * ------------------------------------------------------------
         */

        System.out.println();
        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "DEBRIS NAME=DEB GP RESULT"
        );

        System.out.println(
                "================================================================"
        );

        System.out.println(
                "TOTAL GP RECORDS             : "
                        + totalRecords
        );

        System.out.println(
                "RECORDS WITH NORAD           : "
                        + recordsWithNorad
        );

        System.out.println(
                "RECORDS WITHOUT NORAD        : "
                        + recordsWithoutNorad
        );

        System.out.println(
                "UNIQUE NORAD IDS             : "
                        + uniqueNoradIds.size()
        );

        System.out.println();
        System.out.println(
                "ORBITAL DATA AVAILABILITY"
        );

        System.out.println(
                "  WITH EPOCH                 : "
                        + recordsWithEpoch
        );

        System.out.println(
                "  WITHOUT EPOCH              : "
                        + recordsWithoutEpoch
        );

        System.out.println(
                "  WITH MEAN MOTION           : "
                        + recordsWithMeanMotion
        );

        System.out.println(
                "  WITH INCLINATION           : "
                        + recordsWithInclination
        );

        System.out.println(
                "  WITH ECCENTRICITY          : "
                        + recordsWithEccentricity
        );

        System.out.println(
                "  WITH APOGEE                : "
                        + recordsWithApogee
        );

        System.out.println(
                "  WITH PERIGEE               : "
                        + recordsWithPerigee
        );

        System.out.println();
        System.out.println(
                "TARGET COMPARISON"
        );

        System.out.println(
                "  TARGET DATASET             : ~10,000"
        );

        System.out.println(
                "  AVAILABLE GP RECORDS       : "
                        + uniqueNoradIds.size()
        );

        System.out.println(
                "================================================================"
        );


        /*
         * ------------------------------------------------------------
         * Decision guidance.
         * ------------------------------------------------------------
         */

        if (uniqueNoradIds.size() >= 10_000) {

            System.out.println(
                    "RESULT : SUFFICIENT POPULATION FOR ~10K TARGET"
            );

        } else if (uniqueNoradIds.size() >= 5_000) {

            System.out.println(
                    "RESULT : LARGE POPULATION, BUT BELOW 10K TARGET"
            );

        } else {

            System.out.println(
                    "RESULT : NAME=DEB DOES NOT PROVIDE ENOUGH OBJECTS"
            );
        }


        System.out.println();
        System.out.println(
                "IMPORTANT:"
        );

        System.out.println(
                "NAME=DEB is a GP search, not an explicit SATCAT"
                        + " ONORBIT filter."
        );

        System.out.println(
                "Therefore the next validation step is to compare"
                        + " these NORAD IDs against SATCAT."
        );

        System.out.println(
                "Do NOT modify the production synchronization module"
                        + " until this diagnostic is evaluated."
        );

        System.out.println(
                "================================================================"
        );
    }


    /*
     * ------------------------------------------------------------
     * Safe text extraction.
     * ------------------------------------------------------------
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


    /*
     * ------------------------------------------------------------
     * Safe numeric extraction.
     * ------------------------------------------------------------
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


    /*
     * ------------------------------------------------------------
     * Check whether a field contains usable data.
     * ------------------------------------------------------------
     */

    private boolean hasValue(
            JsonNode node,
            String field) {

        JsonNode value =
                node.get(field);

        if (value == null
                || value.isNull()) {

            return false;
        }

        if (value.isTextual()) {

            return !value.asText()
                    .trim()
                    .isBlank();
        }

        return true;
    }
}