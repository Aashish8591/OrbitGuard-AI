package com.orbitguard.debris.integration.celestrak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;

class CelesTrakFinalDebrisPopulationValidationTest {

    private static final String BASE_URL =
            "https://celestrak.org";

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    private static final String SATCAT_ENDPOINT =
            "/satcat/records.php";

    private static final int MAX_SAMPLES = 20;

    private final RestClient restClient =
            RestClient.builder()
                    .baseUrl(BASE_URL)
                    .build();

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    @Test
    void validateFinalDebrisPopulation() throws Exception {

        printHeader();

        /*
         * ============================================================
         * STEP 1
         * ============================================================
         *
         * Fetch current GP debris population.
         *
         * This is the population we already proved contains
         * approximately 10K objects.
         */
        System.out.println();
        System.out.println(
                "STEP 1 : FETCH GP NAME=DEB"
        );

        String gpResponse =
                fetchGpDebris();

        JsonNode gpRoot =
                parseJsonArray(
                        gpResponse,
                        "GP NAME=DEB"
                );

        System.out.println(
                "GP RESPONSE RECEIVED : YES"
        );

        System.out.println(
                "GP RECORD COUNT      : "
                        + gpRoot.size()
        );


        /*
         * ============================================================
         * Build GP NORAD population.
         * ============================================================
         */

        Set<Long> gpNoradIds =
                new HashSet<>();

        Map<Long, JsonNode> gpRecords =
                new HashMap<>();


        for (JsonNode record : gpRoot) {

            Long noradId =
                    longValue(
                            record,
                            "NORAD_CAT_ID"
                    );

            if (noradId == null) {
                continue;
            }

            gpNoradIds.add(
                    noradId
            );

            gpRecords.put(
                    noradId,
                    record
            );
        }


        /*
         * ============================================================
         * STEP 2
         * ============================================================
         *
         * Fetch ALL SATCAT debris.
         *
         * This gives us the complete debris identity population,
         * including objects that are no longer on orbit.
         */
        System.out.println();
        System.out.println(
                "STEP 2 : FETCH SATCAT NAME=DEB"
        );

        String satcatAllResponse =
                fetchSatcatDebris(false);

        JsonNode satcatAllRoot =
                parseJsonArray(
                        satcatAllResponse,
                        "SATCAT NAME=DEB"
                );

        System.out.println(
                "SATCAT ALL DEBRIS COUNT : "
                        + satcatAllRoot.size()
        );


        /*
         * Store all SATCAT debris records by NORAD ID.
         */

        Map<Long, JsonNode> satcatDebrisRecords =
                new HashMap<>();


        for (JsonNode record : satcatAllRoot) {

            Long noradId =
                    longValue(
                            record,
                            "NORAD_CAT_ID"
                    );

            if (noradId != null) {

                satcatDebrisRecords.put(
                        noradId,
                        record
                );
            }
        }


        /*
         * ============================================================
         * STEP 3
         * ============================================================
         *
         * Fetch ONLY currently-on-orbit debris.
         *
         * IMPORTANT:
         *
         * ONORBIT=1 must be combined with a valid SATCAT query.
         *
         * We are using:
         *
         * NAME=DEB
         * ONORBIT=1
         *
         * This is the correct SATCAT usage.
         */
        System.out.println();
        System.out.println(
                "STEP 3 : FETCH SATCAT NAME=DEB + ONORBIT=1"
        );

        String satcatOnOrbitResponse =
                fetchSatcatDebris(true);

        JsonNode satcatOnOrbitRoot =
                parseJsonArray(
                        satcatOnOrbitResponse,
                        "SATCAT NAME=DEB + ONORBIT=1"
                );

        System.out.println(
                "SATCAT ON-ORBIT DEBRIS COUNT : "
                        + satcatOnOrbitRoot.size()
        );


        /*
         * Build currently-on-orbit debris NORAD set.
         */

        Set<Long> onOrbitDebrisNoradIds =
                new HashSet<>();

        Map<Long, JsonNode> onOrbitDebrisRecords =
                new HashMap<>();


        for (JsonNode record : satcatOnOrbitRoot) {

            Long noradId =
                    longValue(
                            record,
                            "NORAD_CAT_ID"
                    );

            if (noradId == null) {
                continue;
            }

            onOrbitDebrisNoradIds.add(
                    noradId
            );

            onOrbitDebrisRecords.put(
                    noradId,
                    record
            );
        }


        /*
         * ============================================================
         * STEP 4
         * ============================================================
         *
         * Compare GP population with current SATCAT population.
         * ============================================================
         */

        Set<Long> gpAndOnOrbit =
                new HashSet<>(
                        gpNoradIds
                );

        gpAndOnOrbit.retainAll(
                onOrbitDebrisNoradIds
        );


        /*
         * GP records that are NOT currently on orbit.
         */
        Set<Long> gpNotOnOrbit =
                new HashSet<>(
                        gpNoradIds
                );

        gpNotOnOrbit.removeAll(
                onOrbitDebrisNoradIds
        );


        /*
         * Current on-orbit debris that has NO GP data.
         */
        Set<Long> onOrbitWithoutGp =
                new HashSet<>(
                        onOrbitDebrisNoradIds
                );

        onOrbitWithoutGp.removeAll(
                gpNoradIds
        );


        /*
         * GP records that cannot even be found in SATCAT debris.
         */
        Set<Long> gpMissingFromSatcat =
                new HashSet<>(
                        gpNoradIds
                );

        gpMissingFromSatcat.removeAll(
                satcatDebrisRecords.keySet()
        );


        /*
         * ============================================================
         * STEP 5
         * ============================================================
         *
         * Calculate percentages.
         * ============================================================
         */

        double gpCurrentPercentage =
                percentage(
                        gpAndOnOrbit.size(),
                        gpNoradIds.size()
                );

        double gpNotCurrentPercentage =
                percentage(
                        gpNotOnOrbit.size(),
                        gpNoradIds.size()
                );

        double onOrbitGpCoveragePercentage =
                percentage(
                        gpAndOnOrbit.size(),
                        onOrbitDebrisNoradIds.size()
                );


        /*
         * ============================================================
         * STEP 6
         * ============================================================
         *
         * Analyze GP orbital data completeness.
         * ============================================================
         */

        int gpWithEpoch = 0;
        int gpWithMeanMotion = 0;
        int gpWithInclination = 0;
        int gpWithEccentricity = 0;


        for (JsonNode record : gpRoot) {

            if (hasValue(
                    record,
                    "EPOCH"
            )) {
                gpWithEpoch++;
            }

            if (hasValue(
                    record,
                    "MEAN_MOTION"
            )) {
                gpWithMeanMotion++;
            }

            if (hasValue(
                    record,
                    "INCLINATION"
            )) {
                gpWithInclination++;
            }

            if (hasValue(
                    record,
                    "ECCENTRICITY"
            )) {
                gpWithEccentricity++;
            }
        }


        /*
         * ============================================================
         * FINAL REPORT
         * ============================================================
         */

        System.out.println();
        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "FINAL CELESTRAK DEBRIS POPULATION VALIDATION"
        );

        System.out.println(
                "================================================================"
        );


        System.out.println();
        System.out.println(
                "POPULATION"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );

        System.out.println(
                "GP NAME=DEB RECORDS              : "
                        + gpNoradIds.size()
        );

        System.out.println(
                "SATCAT ALL DEBRIS                : "
                        + satcatDebrisRecords.size()
        );

        System.out.println(
                "SATCAT ON-ORBIT DEBRIS           : "
                        + onOrbitDebrisNoradIds.size()
        );


        System.out.println();
        System.out.println(
                "GP -> SATCAT MATCH"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );

        System.out.println(
                "GP + CURRENT ON-ORBIT DEBRIS     : "
                        + gpAndOnOrbit.size()
        );

        System.out.println(
                "GP + NOT CURRENTLY ON ORBIT      : "
                        + gpNotOnOrbit.size()
        );

        System.out.println(
                "GP MISSING FROM SATCAT DEBRIS    : "
                        + gpMissingFromSatcat.size()
        );

        System.out.println(
                "ON-ORBIT DEBRIS WITHOUT GP       : "
                        + onOrbitWithoutGp.size()
        );


        System.out.println();
        System.out.println(
                "PERCENTAGES"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );

        System.out.printf(
                "GP CURRENT / ON-ORBIT            : %.2f%%%n",
                gpCurrentPercentage
        );

        System.out.printf(
                "GP NOT CURRENT / ON-ORBIT        : %.2f%%%n",
                gpNotCurrentPercentage
        );

        System.out.printf(
                "ON-ORBIT DEBRIS WITH GP COVERAGE : %.2f%%%n",
                onOrbitGpCoveragePercentage
        );


        System.out.println();
        System.out.println(
                "GP ORBITAL DATA COMPLETENESS"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );

        System.out.println(
                "WITH EPOCH                        : "
                        + gpWithEpoch
        );

        System.out.println(
                "WITH MEAN MOTION                  : "
                        + gpWithMeanMotion
        );

        System.out.println(
                "WITH INCLINATION                  : "
                        + gpWithInclination
        );

        System.out.println(
                "WITH ECCENTRICITY                 : "
                        + gpWithEccentricity
        );


        /*
         * ============================================================
         * SAMPLE CURRENT DEBRIS
         * ============================================================
         */

        printSamples(
                gpAndOnOrbit,
                gpRecords,
                MAX_SAMPLES
        );


        /*
         * ============================================================
         * SAMPLE GP OBJECTS NOT CURRENTLY ON ORBIT
         * ============================================================
         */

        printNonCurrentSamples(
                gpNotOnOrbit,
                gpRecords,
                satcatDebrisRecords,
                MAX_SAMPLES
        );


        /*
         * ============================================================
         * FINAL ENGINEERING DECISION
         * ============================================================
         */

        System.out.println();
        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "ENGINEERING DECISION"
        );

        System.out.println(
                "================================================================"
        );


        if (gpAndOnOrbit.size() >= 10_000) {

            System.out.println(
                    "STATUS : SUFFICIENT CURRENT DEBRIS DATA"
            );

            System.out.println(
                    "DECISION : GP NAME=DEB + SATCAT ONORBIT"
                            + " is suitable for production synchronization."
            );

        } else {

            System.out.println(
                    "STATUS : CURRENT DEBRIS DATA BELOW 10K"
            );

            System.out.println(
                    "DECISION : DO NOT MODIFY PRODUCTION"
                            + " synchronization yet."
            );
        }


        System.out.println();
        System.out.println(
                "IMPORTANT:"
        );

        System.out.println(
                "The production module must not blindly treat"
                        + " NAME=DEB GP results as active debris."
        );

        System.out.println(
                "SATCAT is used to validate the debris identity"
                        + " and current on-orbit status."
        );

        System.out.println(
                "GP provides the current orbital elements."
        );

        System.out.println(
                "================================================================"
        );
    }


    /*
     * ================================================================
     * GP REQUEST
     * ================================================================
     */

    private String fetchGpDebris() {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(GP_ENDPOINT)
                        .queryParam(
                                "NAME",
                                "DEB"
                        )
                        .queryParam(
                                "FORMAT",
                                "JSON"
                        )
                        .build())
                .retrieve()
                .body(String.class);
    }


    /*
     * ================================================================
     * SATCAT REQUEST
     * ================================================================
     */

    private String fetchSatcatDebris(
            boolean onOrbit) {

        return restClient.get()
                .uri(uriBuilder -> {

                    var builder =
                            uriBuilder
                                    .path(
                                            SATCAT_ENDPOINT
                                    )
                                    .queryParam(
                                            "NAME",
                                            "DEB"
                                    )
                                    .queryParam(
                                            "FORMAT",
                                            "JSON"
                                    );

                    if (onOrbit) {

                        builder.queryParam(
                                "ONORBIT",
                                "1"
                        );
                    }

                    return builder.build();
                })
                .retrieve()
                .body(String.class);
    }


    /*
     * ================================================================
     * JSON PARSER
     * ================================================================
     */

    private JsonNode parseJsonArray(
            String rawResponse,
            String source)
            throws Exception {

        assertFalse(
                rawResponse == null
                        || rawResponse.isBlank(),
                source
                        + " returned an empty response."
        );


        String trimmed =
                rawResponse.trim();


        if (!trimmed.startsWith("[")
                && !trimmed.startsWith("{")) {

            System.out.println();
            System.out.println(
                    "NON-JSON RESPONSE FROM : "
                            + source
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
                    source
                            + " did not return JSON."
            );
        }


        JsonNode root =
                objectMapper.readTree(
                        trimmed
                );


        if (!root.isArray()) {

            throw new IllegalStateException(
                    source
                            + " returned JSON but not an array."
            );
        }


        return root;
    }


    /*
     * ================================================================
     * SAMPLE CURRENT DEBRIS
     * ================================================================
     */

    private void printSamples(
            Set<Long> ids,
            Map<Long, JsonNode> gpRecords,
            int maximum) {

        System.out.println();
        System.out.println(
                "CURRENT ON-ORBIT DEBRIS SAMPLES"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );

        int count = 0;

        for (Long id : ids) {

            if (count >= maximum) {
                break;
            }

            JsonNode record =
                    gpRecords.get(id);

            if (record == null) {
                continue;
            }

            System.out.println();

            System.out.println(
                    "SAMPLE #"
                            + (count + 1)
            );

            System.out.println(
                    "  NORAD       : "
                            + id
            );

            System.out.println(
                    "  NAME        : "
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
                    "  EPOCH       : "
                            + textValue(
                            record,
                            "EPOCH"
                    )
            );

            System.out.println(
                    "  INCLINATION : "
                            + textValue(
                            record,
                            "INCLINATION"
                    )
            );

            System.out.println(
                    "  ECCENTRICITY: "
                            + textValue(
                            record,
                            "ECCENTRICITY"
                    )
            );

            System.out.println(
                    "  MEAN MOTION : "
                            + textValue(
                            record,
                            "MEAN_MOTION"
                    )
            );

            count++;
        }
    }


    /*
     * ================================================================
     * SAMPLE GP RECORDS NOT CURRENTLY ON ORBIT
     * ================================================================
     */

    private void printNonCurrentSamples(
            Set<Long> ids,
            Map<Long, JsonNode> gpRecords,
            Map<Long, JsonNode> satcatRecords,
            int maximum) {

        System.out.println();
        System.out.println(
                "GP DEBRIS NOT CURRENTLY ON-ORBIT SAMPLES"
        );

        System.out.println(
                "----------------------------------------------------------------"
        );

        int count = 0;

        for (Long id : ids) {

            if (count >= maximum) {
                break;
            }

            JsonNode gpRecord =
                    gpRecords.get(id);

            JsonNode satcatRecord =
                    satcatRecords.get(id);

            System.out.println();

            System.out.println(
                    "SAMPLE #"
                            + (count + 1)
            );

            System.out.println(
                    "  NORAD       : "
                            + id
            );

            System.out.println(
                    "  GP NAME     : "
                            + textValue(
                            gpRecord,
                            "OBJECT_NAME"
                    )
            );

            if (satcatRecord != null) {

                System.out.println(
                        "  SATCAT TYPE : "
                                + textValue(
                                satcatRecord,
                                "OBJECT_TYPE"
                        )
                );

                System.out.println(
                        "  DECAY DATE  : "
                                + textValue(
                                satcatRecord,
                                "DECAY_DATE"
                        )
                );

                System.out.println(
                        "  DATA STATUS : "
                                + textValue(
                                satcatRecord,
                                "DATA_STATUS_CODE"
                        )
                );

            } else {

                System.out.println(
                        "  SATCAT      : NOT FOUND"
                );
            }

            count++;
        }
    }


    /*
     * ================================================================
     * TEXT VALUE
     * ================================================================
     */

    private String textValue(
            JsonNode node,
            String field) {

        if (node == null) {
            return null;
        }

        JsonNode value =
                node.get(field);

        if (value == null
                || value.isNull()) {

            return null;
        }

        return value.asText();
    }


    /*
     * ================================================================
     * LONG VALUE
     * ================================================================
     */

    private Long longValue(
            JsonNode node,
            String field) {

        if (node == null) {
            return null;
        }

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
     * ================================================================
     * HAS VALUE
     * ================================================================
     */

    private boolean hasValue(
            JsonNode node,
            String field) {

        if (node == null) {
            return false;
        }

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


    /*
     * ================================================================
     * PERCENTAGE
     * ================================================================
     */

    private double percentage(
            int numerator,
            int denominator) {

        if (denominator == 0) {
            return 0.0;
        }

        return (
                numerator * 100.0
        ) / denominator;
    }


    /*
     * ================================================================
     * HEADER
     * ================================================================
     */

    private void printHeader() {

        System.out.println();
        System.out.println(
                "================================================================"
        );

        System.out.println(
                "CELESTRAK FINAL DEBRIS POPULATION VALIDATION"
        );

        System.out.println(
                "================================================================"
        );

        System.out.println(
                "PURPOSE : Final validation before production"
        );

        System.out.println(
                "          CelesTrak debris synchronization changes"
        );

        System.out.println();

        System.out.println(
                "DATA SOURCES:"
        );

        System.out.println(
                "  1. GP NAME=DEB"
        );

        System.out.println(
                "  2. SATCAT NAME=DEB"
        );

        System.out.println(
                "  3. SATCAT NAME=DEB + ONORBIT=1"
        );

        System.out.println();

        System.out.println(
                "TARGET : Approximately 10,000 current debris"
        );

        System.out.println(
                "================================================================"
        );
    }
}