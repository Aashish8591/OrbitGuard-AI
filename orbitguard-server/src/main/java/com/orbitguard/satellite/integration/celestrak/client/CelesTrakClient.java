package com.orbitguard.satellite.integration.celestrak.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CelesTrakClient {

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    private static final String FORMAT_JSON =
            "JSON";

    private final RestClient celesTrakRestClient;

    private final ObjectMapper objectMapper;


    /**
     * Fetches current GP orbital data from CelesTrak
     * using the NORAD catalog ID.
     *
     * CelesTrak GP JSON contains both orbital/TLE
     * information and additional GP metadata.
     *
     * @param noradCatalogId NORAD catalog identification number
     * @return current GP data returned by CelesTrak
     */
    public List<CelesTrakSatelliteResponse> getSatelliteByNoradId(
            Integer noradCatalogId) {

        validateNoradCatalogId(noradCatalogId);

        String requestDescription =
                "NORAD catalog ID: " + noradCatalogId;

        try {

            String responseBody =
                    celesTrakRestClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(GP_ENDPOINT)
                                    .queryParam(
                                            "CATNR",
                                            noradCatalogId
                                    )
                                    .queryParam(
                                            "FORMAT",
                                            FORMAT_JSON
                                    )
                                    .build())
                            .accept(
                                    MediaType.APPLICATION_JSON
                            )
                            .retrieve()
                            .onStatus(
                                    HttpStatusCode::isError,
                                    (request, response) -> {

                                        String errorBody =
                                                readErrorBody(
                                                        response
                                                );

                                        throw buildCelesTrakException(
                                                response.getStatusCode(),
                                                errorBody,
                                                requestDescription
                                        );
                                    }
                            )
                            .body(String.class);

            return parseSatelliteResponse(
                    responseBody,
                    requestDescription
            );

        } catch (RestClientException exception) {

            log.error(
                    "CelesTrak request failed for {}.",
                    requestDescription,
                    exception
            );

            throw new IllegalStateException(
                    "Failed to retrieve satellite orbital data "
                            + "from CelesTrak for "
                            + requestDescription,
                    exception
            );
        }
    }


    /**
     * Fetches current GP data for all satellites
     * belonging to a CelesTrak group.
     *
     * CelesTrak limits GP downloads according to
     * its update cycle and usage policy.
     *
     * Therefore this method does not retry requests.
     *
     * @param group CelesTrak group name
     * @return current GP data returned by CelesTrak
     */
    public List<CelesTrakSatelliteResponse> getSatellitesByGroup(
            String group) {

        validateGroup(group);

        String normalizedGroup =
                group.trim().toUpperCase();

        String requestDescription =
                "group: " + normalizedGroup;

        try {

            String responseBody =
                    celesTrakRestClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(GP_ENDPOINT)
                                    .queryParam(
                                            "GROUP",
                                            normalizedGroup
                                    )
                                    .queryParam(
                                            "FORMAT",
                                            FORMAT_JSON
                                    )
                                    .build())
                            .accept(
                                    MediaType.APPLICATION_JSON
                            )
                            .retrieve()
                            .onStatus(
                                    HttpStatusCode::isError,
                                    (request, response) -> {

                                        String errorBody =
                                                readErrorBody(
                                                        response
                                                );

                                        throw buildCelesTrakException(
                                                response.getStatusCode(),
                                                errorBody,
                                                requestDescription
                                        );
                                    }
                            )
                            .body(String.class);

            return parseSatelliteResponse(
                    responseBody,
                    requestDescription
            );

        } catch (RestClientException exception) {

            log.error(
                    "CelesTrak request failed for {}.",
                    requestDescription,
                    exception
            );

            throw new IllegalStateException(
                    "Failed to retrieve satellite data "
                            + "from CelesTrak for "
                            + requestDescription,
                    exception
            );
        }
    }


    /**
     * Reads the response body returned by CelesTrak
     * when an HTTP error occurs.
     */
    private String readErrorBody(
            org.springframework.http.client.ClientHttpResponse response) {

        try {

            if (response == null
                    || response.getBody() == null) {

                return "";
            }

            return new String(
                    response.getBody().readAllBytes(),
                    StandardCharsets.UTF_8
            ).trim();

        } catch (Exception exception) {

            log.warn(
                    "Could not read CelesTrak error response body.",
                    exception
            );

            return "";
        }
    }


    /**
     * Builds a descriptive exception for a CelesTrak
     * HTTP error response.
     *
     * CelesTrak may return HTTP 403 when the GP data
     * has already been downloaded during the current
     * update cycle and has not changed.
     */
    private IllegalStateException buildCelesTrakException(
            HttpStatusCode statusCode,
            String responseBody,
            String requestDescription) {

        String cleanResponse =
                responseBody == null
                        ? ""
                        : responseBody.trim();

        String lowerCaseResponse =
                cleanResponse.toLowerCase();

        /*
         * --------------------------------------------------
         * CelesTrak GP update-cycle protection
         * --------------------------------------------------
         */
        if (statusCode.value() == 403
                && lowerCaseResponse.contains(
                "gp data has not updated"
        )) {

            return new IllegalStateException(
                    "CelesTrak GP data for "
                            + requestDescription
                            + " has not updated since the last "
                            + "successful download. "
                            + "Do not retry this request until "
                            + "the next CelesTrak GP update cycle."
                            + (cleanResponse.isBlank()
                            ? ""
                            : " CelesTrak response: "
                            + cleanResponse)
            );
        }

        /*
         * --------------------------------------------------
         * Generic CelesTrak HTTP error
         * --------------------------------------------------
         */
        return new IllegalStateException(
                "CelesTrak returned HTTP "
                        + statusCode.value()
                        + " "
                        + statusCode
                        + " while fetching "
                        + requestDescription
                        + "."
                        + (cleanResponse.isBlank()
                        ? ""
                        : " Response: "
                        + cleanResponse)
        );
    }


    /**
     * Parses the raw CelesTrak JSON response into
     * the integration DTO.
     *
     * The DTO is responsible for representing the
     * external CelesTrak payload.
     *
     * This method does not perform:
     * - entity mapping
     * - business logic
     * - propagation
     * - database operations
     */
    private List<CelesTrakSatelliteResponse> parseSatelliteResponse(
            String responseBody,
            String requestDescription) {

        /*
         * --------------------------------------------------
         * Empty response
         * --------------------------------------------------
         */
        if (responseBody == null
                || responseBody.isBlank()) {

            log.warn(
                    "CelesTrak returned an empty response for {}.",
                    requestDescription
            );

            return Collections.emptyList();
        }

        String normalizedResponse =
                responseBody.trim();

        /*
         * --------------------------------------------------
         * JSON validation
         * --------------------------------------------------
         */
        if (!normalizedResponse.startsWith("[")
                || !normalizedResponse.endsWith("]")) {

            log.error(
                    "Unexpected CelesTrak response for {}: {}",
                    requestDescription,
                    normalizedResponse
            );

            throw new IllegalStateException(
                    "CelesTrak returned an invalid JSON array "
                            + "response for "
                            + requestDescription
            );
        }

        try {

            CelesTrakSatelliteResponse[] responses =
                    objectMapper.readValue(
                            normalizedResponse,
                            CelesTrakSatelliteResponse[].class
                    );

            if (responses == null
                    || responses.length == 0) {

                return Collections.emptyList();
            }

            return Arrays.asList(responses);

        } catch (JsonProcessingException exception) {

            log.error(
                    "Failed to deserialize CelesTrak JSON "
                            + "response for {}.",
                    requestDescription,
                    exception
            );

            throw new IllegalStateException(
                    "Failed to parse CelesTrak JSON response "
                            + "for "
                            + requestDescription,
                    exception
            );
        }
    }


    /**
     * Validates the NORAD catalog ID before making
     * an external CelesTrak request.
     */
    private void validateNoradCatalogId(
            Integer noradCatalogId) {

        if (noradCatalogId == null
                || noradCatalogId <= 0) {

            throw new BadRequestException(
                    "NORAD catalog ID must be greater than zero."
            );
        }
    }


    /**
     * Validates the CelesTrak group before making
     * an external request.
     */
    private void validateGroup(
            String group) {

        if (group == null
                || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }
    }
}