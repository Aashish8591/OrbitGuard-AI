package com.orbitguard.debris.integration.celestrak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;

/**
 * Diagnostic test only.
 *
 * Purpose:
 * 1. Find currently-on-orbit debris from CelesTrak SATCAT.
 * 2. Collect their NORAD catalog IDs.
 * 3. Check whether those debris objects have usable GP orbital data.
 *
 * This test DOES NOT:
 * - modify production code
 * - write to MongoDB
 * - synchronize debris
 * - create/update SpaceDebris entities
 * - call SGP4/Orekit
 */
class CelesTrakActiveDebrisGpAvailabilityDiagnosticTest {

    private static final String BASE_URL =
            "https://celestrak.org";

    private static final String SATCAT_ENDPOINT =
            "/satcat/records.php";

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    /**
     * Number of debris objects for which we will test GP availability.
     *
     * We intentionally do not call GP for thousands of objects
     * in a diagnostic test.
     */
    private static final int GP_SAMPLE_SIZE = 100;

    private final RestClient restClient =
            RestClient.builder()
                    .baseUrl(BASE_URL)
                    .build();

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    @Test
    void diagnoseActiveDebrisGpAvailability() throws Exception {

        System.out.println();
        System.out.println("================================================================");
        System.out.println("CELESTRAK ACTIVE DEBRIS -> GP AVAILABILITY DIAGNOSTIC");
        System.out.println("================================================================");

        System.out.println("SOURCE          : CelesTrak SATCAT");
        System.out.println("SATCAT FILTER   : ONORBIT=1");
        System.out.println("TARGET TYPE     : DEB");
        System.out.println("GP SOURCE       : /NORAD/elements/gp.php");
        System.out.println("GP SAMPLE SIZE  : " + GP_SAMPLE_SIZE);

        System.out.println("----------------------------------------------------------------");


        /*
         * ==========================================================
         * STEP 1
         * Fetch SATCAT on-orbit population.
         * ==========================================================
         */

        String rawSatcatResponse =
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path(SATCAT_ENDPOINT)
                                .queryParam("ONORBIT", "1")
                                .build())
                        .retrieve()
                        .body(String.class);


        assertFalse(
                rawSatcatResponse == null
                        || rawSatcatResponse.isBlank(),
                "CelesTrak SATCAT returned an empty response."
        );


        System.out.println();
        System.out.println(
                "SATCAT RESPONSE RECEIVED : YES"
        );

        System.out.println(
                "SATCAT RESPONSE SIZE     : "
                        + rawSatcatResponse.length()
                        + " characters"
        );


        /*
         * ==========================================================
         * STEP 2
         * Determine response format.
         * ==========================================================
         */

        String satcatContent =
                rawSatcatResponse.trim();


        /*
         * SATCAT can return a CSV-style response depending
         * on the endpoint/query.
         *
         * We therefore inspect the first character instead
         * of blindly assuming JSON.
         */

        if (!satcatContent.startsWith("[")
                && !satcatContent.startsWith("{")) {

            System.out.println();
            System.out.println(
                    "SATCAT RESPONSE IS NOT JSON."
            );

            System.out.println(
                    "FIRST 500 CHARACTERS:"
            );

            System.out.println(
                    satcatContent.substring(
                            0,
                            Math.min(
                                    500,
                                    satcatContent.length()
                            )
                    )
            );

            System.out.println();
            System.out.println(
                    "The endpoint returned a non-JSON response."
            );

            System.out.println(
                    "This diagnostic therefore stops before GP testing."
            );

            return;
        }


        /*
         * ==========================================================
         * STEP 3
         * Parse SATCAT JSON.
         * ==========================================================
         */

        JsonNode root =
                objectMapper.readTree(
                        satcatContent
                );


        if (!root.isArray()) {

            System.out.println();
            System.out.println(
                    "UNEXPECTED SATCAT RESPONSE:"
            );

            System.out.println(
                    root.toPrettyString()
            );

            throw new IllegalStateException(
                    "Expected SATCAT response to be a JSON array."
            );
        }


        /*
         * ==========================================================
         * STEP 4
         * Find on-orbit debris.
         * ==========================================================
         */

        int totalSatcatRecords =
                root.size();

        int totalDebris =
                0;

        int debrisWithNorad =
                0;

        int debrisWithoutNorad =
                0;

        Set<Long> uniqueDebrisNoradIds =
                new HashSet<>();


        List<DebrisRecord> debrisRecords =
                new ArrayList<>();


        for (JsonNode record : root) {

            String objectType =
                    textValue(
                            record,
                            "OBJECT_TYPE"
                    );


            /*
             * Only CelesTrak DEB records.
             */
            if (!"DEB".equalsIgnoreCase(objectType)) {
                continue;
            }


            totalDebris++;


            Long noradId =
                    longValue(
                            record,
                            "NORAD_CAT_ID"
                    );


            if (noradId == null
                    || noradId <= 0) {

                debrisWithoutNorad++;

                continue;
            }


            debrisWithNorad++;


            if (!uniqueDebrisNoradIds.add(noradId)) {
                continue;
            }


            debrisRecords.add(
                    new DebrisRecord(
                            noradId,
                            textValue(
                                    record,
                                    "OBJECT_NAME"
                            ),
                            textValue(
                                    record,
                                    "OBJECT_ID"
                            ),
                            textValue(
                                    record,
                                    "DATA_STATUS_CODE"
                            ),
                            textValue(
                                    record,
                                    "DECAY_DATE"
                            )
                    )
            );
        }


        /*
         * ==========================================================
         * STEP 5
         * Print SATCAT population result.
         * ==========================================================
         */

        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "SATCAT ACTIVE DEBRIS RESULT"
        );

        System.out.println(
                "================================================================"
        );

        System.out.println(
                "TOTAL SATCAT RECORDS         : "
                        + totalSatcatRecords
        );

        System.out.println(
                "TOTAL OBJECT_TYPE=DEB        : "
                        + totalDebris
        );

        System.out.println(
                "DEBRIS WITH NORAD            : "
                        + debrisWithNorad
        );

        System.out.println(
                "DEBRIS WITHOUT NORAD         : "
                        + debrisWithoutNorad
        );

        System.out.println(
                "UNIQUE DEBRIS NORAD IDS      : "
                        + uniqueDebrisNoradIds.size()
        );


        /*
         * ==========================================================
         * STEP 6
         * Stop if there is no debris population.
         * ==========================================================
         */

        if (debrisRecords.isEmpty()) {

            System.out.println();
            System.out.println(
                    "NO DEBRIS RECORDS AVAILABLE."
            );

            return;
        }


        /*
         * ==========================================================
         * STEP 7
         * Select GP diagnostic sample.
         * ==========================================================
         */

        int sampleSize =
                Math.min(
                        GP_SAMPLE_SIZE,
                        debrisRecords.size()
                );


        System.out.println();
        System.out.println(
                "----------------------------------------------------------------"
        );

        System.out.println(
                "GP AVAILABILITY TEST"
        );

        System.out.println(
                "TESTING FIRST "
                        + sampleSize
                        + " UNIQUE DEBRIS NORAD IDS"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );


        int gpAvailable =
                0;

        int gpUnavailable =
                0;

        int gpInvalidResponse =
                0;


        List<Long> gpAvailableIds =
                new ArrayList<>();

        List<Long> gpUnavailableIds =
                new ArrayList<>();


        /*
         * ==========================================================
         * STEP 8
         * Query GP for debris sample.
         * ==========================================================
         */

        for (int index = 0;
             index < sampleSize;
             index++) {

            DebrisRecord debris =
                    debrisRecords.get(index);


            Long noradId =
                    debris.noradId;


            System.out.println();
            System.out.println(
                    "GP CHECK #"
                            + (index + 1)
            );

            System.out.println(
                    "NORAD       : "
                            + noradId
            );

            System.out.println(
                    "NAME        : "
                            + debris.objectName
            );

            System.out.println(
                    "OBJECT ID   : "
                            + debris.objectId
            );


            try {

                String rawGpResponse =
                        restClient.get()
                                .uri(uriBuilder -> uriBuilder
                                        .path(GP_ENDPOINT)
                                        .queryParam(
                                                "CATNR",
                                                noradId
                                        )
                                        .queryParam(
                                                "FORMAT",
                                                "JSON"
                                        )
                                        .build())
                                .retrieve()
                                .body(String.class);


                if (rawGpResponse == null
                        || rawGpResponse.isBlank()) {

                    gpUnavailable++;

                    gpUnavailableIds.add(
                            noradId
                    );

                    System.out.println(
                            "GP RESULT   : EMPTY"
                    );

                    continue;
                }


                String gpContent =
                        rawGpResponse.trim();


                /*
                 * CelesTrak can return an error message
                 * rather than JSON.
                 */
                if (!gpContent.startsWith("[")
                        && !gpContent.startsWith("{")) {

                    gpInvalidResponse++;

                    gpUnavailableIds.add(
                            noradId
                    );

                    System.out.println(
                            "GP RESULT   : NON-JSON RESPONSE"
                    );

                    System.out.println(
                            "GP RESPONSE : "
                                    + gpContent.substring(
                                    0,
                                    Math.min(
                                            150,
                                            gpContent.length()
                                    )
                            )
                    );

                    continue;
                }


                JsonNode gpRoot =
                        objectMapper.readTree(
                                gpContent
                        );


                /*
                 * A valid GP response should contain
                 * at least one orbital record.
                 */
                if (!gpRoot.isArray()
                        || gpRoot.isEmpty()) {

                    gpUnavailable++;

                    gpUnavailableIds.add(
                            noradId
                    );

                    System.out.println(
                            "GP RESULT   : NO GP RECORD"
                    );

                    continue;
                }


                JsonNode gpRecord =
                        gpRoot.get(0);


                Long gpNorad =
                        longValue(
                                gpRecord,
                                "NORAD_CAT_ID"
                        );

                String epoch =
                        textValue(
                                gpRecord,
                                "EPOCH"
                        );

                Double meanMotion =
                        doubleValue(
                                gpRecord,
                                "MEAN_MOTION"
                        );

                Double eccentricity =
                        doubleValue(
                                gpRecord,
                                "ECCENTRICITY"
                        );


                /*
                 * We consider GP usable only when the
                 * essential identity and orbital fields
                 * are present.
                 */
                boolean usableGp =
                        gpNorad != null
                                && gpNorad.equals(noradId)
                                && epoch != null
                                && !epoch.isBlank()
                                && meanMotion != null
                                && eccentricity != null;


                if (usableGp) {

                    gpAvailable++;

                    gpAvailableIds.add(
                            noradId
                    );

                    System.out.println(
                            "GP RESULT   : AVAILABLE"
                    );

                    System.out.println(
                            "GP NORAD    : "
                                    + gpNorad
                    );

                    System.out.println(
                            "EPOCH       : "
                                    + epoch
                    );

                    System.out.println(
                            "MEAN MOTION : "
                                    + meanMotion
                    );

                    System.out.println(
                            "ECCENTRICITY: "
                                    + eccentricity
                    );

                } else {

                    gpUnavailable++;

                    gpUnavailableIds.add(
                            noradId
                    );

                    System.out.println(
                            "GP RESULT   : INCOMPLETE"
                    );
                }


            } catch (Exception exception) {

                gpInvalidResponse++;

                gpUnavailableIds.add(
                        noradId
                );

                System.out.println(
                        "GP RESULT   : REQUEST FAILED"
                );

                System.out.println(
                        "EXCEPTION   : "
                                + exception.getClass()
                                .getSimpleName()
                );

                System.out.println(
                        "MESSAGE     : "
                                + exception.getMessage()
                );
            }
        }


        /*
         * ==========================================================
         * STEP 9
         * Calculate GP availability percentage.
         * ==========================================================
         */

        double gpAvailabilityPercentage =
                sampleSize == 0
                        ? 0.0
                        : (
                        gpAvailable
                                * 100.0
                                / sampleSize
                );


        /*
         * ==========================================================
         * STEP 10
         * Final report.
         * ==========================================================
         */

        System.out.println();
        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "FINAL DEBRIS -> GP RESULT"
        );

        System.out.println(
                "================================================================"
        );

        System.out.println(
                "ACTIVE/ON-ORBIT DEBRIS      : "
                        + uniqueDebrisNoradIds.size()
        );

        System.out.println(
                "GP SAMPLE TESTED            : "
                        + sampleSize
        );

        System.out.println(
                "GP AVAILABLE                : "
                        + gpAvailable
        );

        System.out.println(
                "GP UNAVAILABLE              : "
                        + gpUnavailable
        );

        System.out.println(
                "GP INVALID/REQUEST FAILURE  : "
                        + gpInvalidResponse
        );

        System.out.printf(
                "GP AVAILABILITY             : %.2f%%%n",
                gpAvailabilityPercentage
        );


        /*
         * ==========================================================
         * Print unavailable sample IDs.
         * ==========================================================
         */

        if (!gpUnavailableIds.isEmpty()) {

            System.out.println();
            System.out.println(
                    "SAMPLE GP-UNAVAILABLE NORAD IDS:"
            );

            gpUnavailableIds
                    .stream()
                    .limit(20)
                    .forEach(
                            id -> System.out.println(
                                    "  " + id
                            )
                    );
        }


        /*
         * ==========================================================
         * Final interpretation.
         * ==========================================================
         */

        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "INTERPRETATION"
        );

        System.out.println(
                "================================================================"
        );

        System.out.println(
                "SATCAT tells us WHICH objects are classified as DEB."
        );

        System.out.println(
                "GP tells us WHETHER orbital element data is available."
        );

        System.out.println(
                "The production debris synchronization should use"
        );

        System.out.println(
                "SATCAT classification + GP orbital data together."
        );

        System.out.println(
                "================================================================"
        );

        System.out.println();
    }


    /*
     * ==============================================================
     * Helper methods
     * ==============================================================
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


    private Double doubleValue(
            JsonNode node,
            String field) {

        JsonNode value =
                node.get(field);

        if (value == null
                || value.isNull()) {

            return null;
        }

        if (value.isNumber()) {

            return value.doubleValue();
        }

        try {

            return Double.parseDouble(
                    value.asText().trim()
            );

        } catch (NumberFormatException exception) {

            return null;
        }
    }


    /*
     * ==============================================================
     * Small internal diagnostic model
     * ==============================================================
     */

    private static class DebrisRecord {

        private final Long noradId;

        private final String objectName;

        private final String objectId;

        private final String dataStatus;

        private final String decayDate;


        private DebrisRecord(
                Long noradId,
                String objectName,
                String objectId,
                String dataStatus,
                String decayDate) {

            this.noradId =
                    noradId;

            this.objectName =
                    objectName;

            this.objectId =
                    objectId;

            this.dataStatus =
                    dataStatus;

            this.decayDate =
                    decayDate;
        }
    }
}