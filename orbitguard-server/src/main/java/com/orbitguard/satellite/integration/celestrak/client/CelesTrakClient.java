package com.orbitguard.satellite.integration.celestrak.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CelesTrakClient {

    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    private static final String FORMAT_JSON =
            "JSON";

    private final RestClient celesTrakRestClient;

    private final ObjectMapper objectMapper;

    /**
     * Fetch current GP orbital data from CelesTrak
     * using the NORAD catalog ID.
     *
     * Flow:
     *
     * CelesTrak
     *      ↓
     * RestClient
     *      ↓
     * Raw response body
     *      ↓
     * ObjectMapper
     *      ↓
     * CelesTrakSatelliteResponse[]
     *      ↓
     * List<CelesTrakSatelliteResponse>
     *
     * @param noradCatalogId NORAD catalog identification number
     * @return current GP orbital data returned by CelesTrak
     */
    public List<CelesTrakSatelliteResponse> getSatelliteByNoradId(
            Integer noradCatalogId) {

        validateNoradCatalogId(noradCatalogId);

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
                            .accept(MediaType.APPLICATION_JSON)
                            .retrieve()
                            .onStatus(
                                    HttpStatusCode::isError,
                                    (request, response) -> {
                                        throw new IllegalStateException(
                                                "CelesTrak returned HTTP "
                                                        + response.getStatusCode()
                                                        + " while fetching "
                                                        + "NORAD catalog ID: "
                                                        + noradCatalogId
                                        );
                                    }
                            )
                            .body(String.class);

            return parseSatelliteResponse(
                    responseBody,
                    "NORAD catalog ID: " + noradCatalogId
            );

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Failed to retrieve satellite orbital data from CelesTrak "
                            + "for NORAD catalog ID: "
                            + noradCatalogId,
                    exception
            );
        }
    }

    /**
     * Fetch current GP orbital data for all satellites
     * belonging to a CelesTrak group.
     *
     * Examples:
     *
     * GROUP=CUBESATS
     * GROUP=STATIONS
     * GROUP=STARLINK
     *
     * The response is intentionally read as String first
     * because CelesTrak may return JSON with a text/plain
     * content type.
     *
     * @param group CelesTrak group name
     * @return current GP orbital data returned by CelesTrak
     */
    public List<CelesTrakSatelliteResponse> getSatellitesByGroup(
            String group) {

        validateGroup(group);

        String normalizedGroup =
                group.trim().toUpperCase();

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
                            .accept(MediaType.APPLICATION_JSON)
                            .retrieve()
                            .onStatus(
                                    HttpStatusCode::isError,
                                    (request, response) -> {
                                        throw new IllegalStateException(
                                                "CelesTrak returned HTTP "
                                                        + response.getStatusCode()
                                                        + " while fetching "
                                                        + "group: "
                                                        + normalizedGroup
                                        );
                                    }
                            )
                            .body(String.class);

            return parseSatelliteResponse(
                    responseBody,
                    "group: " + normalizedGroup
            );

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Failed to retrieve satellite data from CelesTrak "
                            + "for group: "
                            + normalizedGroup,
                    exception
            );
        }
    }

    /**
     * Parse the raw CelesTrak response into the external
     * CelesTrak response DTO.
     *
     * CelesTrak may return a JSON payload with a content type
     * that is not application/json, therefore the response is
     * deliberately received as String and parsed manually.
     *
     * @param responseBody raw response body
     * @param requestDescription description of the originating request
     * @return parsed CelesTrak satellite responses
     */
    private List<CelesTrakSatelliteResponse> parseSatelliteResponse(
            String responseBody,
            String requestDescription) {

        if (responseBody == null
                || responseBody.isBlank()) {

            return Collections.emptyList();
        }

        String normalizedResponse =
                responseBody.trim();

        /*
         * CelesTrak can return a plain-text message instead
         * of a JSON payload when data is unavailable or the
         * request cannot be fulfilled.
         */
        if (!normalizedResponse.startsWith("[")) {

            throw new IllegalStateException(
                    "CelesTrak returned a non-JSON response for "
                            + requestDescription
                            + ": "
                            + normalizedResponse
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

            throw new IllegalStateException(
                    "Failed to parse CelesTrak JSON response for "
                            + requestDescription,
                    exception
            );
        }
    }

    /**
     * Validate NORAD catalog ID before making
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
     * Validate CelesTrak group before making
     * an external request.
     */
    private void validateGroup(String group) {

        if (group == null
                || group.isBlank()) {

            throw new BadRequestException(
                    "CelesTrak group must not be blank."
            );
        }
    }
}