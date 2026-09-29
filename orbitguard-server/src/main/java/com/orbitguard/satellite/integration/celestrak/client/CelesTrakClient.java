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
     * Fetch current GP orbital data from CelesTrak
     * using the NORAD catalog ID.
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

                                        String errorBody =
                                                readErrorBody(response);

                                        throw buildCelesTrakException(
                                                response.getStatusCode(),
                                                errorBody,
                                                "NORAD catalog ID: "
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
     * IMPORTANT:
     *
     * CelesTrak limits GP group downloads to one successful
     * download per data update cycle. The ACTIVE group is
     * currently updated approximately every two hours.
     *
     * Therefore this method does NOT retry failed requests.
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

                                        String errorBody =
                                                readErrorBody(response);

                                        throw buildCelesTrakException(
                                                response.getStatusCode(),
                                                errorBody,
                                                "group: "
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
     * Read the response body returned by CelesTrak
     * when an HTTP error occurs.
     */
    private String readErrorBody(
            org.springframework.http.client.ClientHttpResponse response) {

        try {

            java.io.InputStream inputStream =
                    response.getBody();

            if (inputStream == null) {
                return "";
            }

            return new String(
                    inputStream.readAllBytes(),
                    java.nio.charset.StandardCharsets.UTF_8
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
     * Builds an exception containing the actual CelesTrak
     * HTTP status and response message.
     *
     * This is especially important for CelesTrak HTTP 403
     * responses because the response body explains whether
     * the request was blocked because the GP data has not
     * changed yet.
     */
    private IllegalStateException buildCelesTrakException(
            HttpStatusCode statusCode,
            String responseBody,
            String requestDescription) {

        String cleanResponse =
                responseBody == null
                        ? ""
                        : responseBody.trim();

        /*
         * CelesTrak uses HTTP 403 for the specific situation
         * where the requested GP group has already been
         * downloaded and the underlying data has not updated.
         */
        if (statusCode.value() == 403
                && cleanResponse.toLowerCase()
                .contains("gp data has not updated")) {

            return new IllegalStateException(
                    "CelesTrak GP data for "
                            + requestDescription
                            + " has not updated since the last "
                            + "successful download. "
                            + "CelesTrak allows GP data downloads "
                            + "only once per update cycle. "
                            + "Do not retry this request until the "
                            + "next CelesTrak GP update.\n"
                            + "CelesTrak response: "
                            + cleanResponse
            );
        }

        /*
         * Generic CelesTrak error.
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
                        : " Response: " + cleanResponse)
        );
    }


    /**
     * Parse the raw CelesTrak response into the external
     * CelesTrak response DTO.
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
         * CelesTrak should return a JSON array when
         * FORMAT=JSON is requested.
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