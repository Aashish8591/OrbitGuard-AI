package com.orbitguard.debris.integration.celestrak.client;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Client responsible for communicating with the CelesTrak
 * GP (General Perturbations) API for space debris data.
 *
 * <p>
 * This client is responsible only for external GP data retrieval.
 * It does not perform:
 * </p>
 *
 * <ul>
 *     <li>Debris validation</li>
 *     <li>SATCAT validation</li>
 *     <li>Database operations</li>
 *     <li>Business-code generation</li>
 *     <li>Orbital propagation</li>
 * </ul>
 *
 * <p>
 * Production debris synchronization uses:
 *
 * <pre>
 * CelesTrak GP
 * NAME=DEB
 * FORMAT=JSON
 * </pre>
 *
 * to obtain the current GP orbital elements for debris objects.
 */
@Component("debrisCelesTrakClient")
@RequiredArgsConstructor
public class CelesTrakClient {

    /**
     * CelesTrak GP endpoint.
     */
    private static final String GP_ENDPOINT =
            "/NORAD/elements/gp.php";

    /**
     * Production debris GP query.
     *
     * <p>
     * CelesTrak NAME queries search object names by name.
     * The final debris population validation established
     * NAME=DEB as the GP source for production debris
     * synchronization.
     * </p>
     */
    private static final String DEBRIS_NAME_QUERY =
            "DEB";

    private final RestClient celesTrakRestClient;


    /**
     * Fetches current GP orbital data for a single
     * debris object using its NORAD Catalog ID.
     *
     * @param noradId NORAD Catalog ID
     * @return GP orbital data for the requested object
     */
    public CelesTrakDebrisResponse[] fetchOrbitalData(
            Long noradId) {

        return celesTrakRestClient.get()
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
                .body(
                        CelesTrakDebrisResponse[].class
                );
    }


    /**
     * Fetches the production debris GP population
     * from CelesTrak.
     *
     * <p>
     * This method intentionally uses:
     *
     * <pre>
     * NAME=DEB
     * </pre>
     *
     * rather than relying on an arbitrary caller-supplied
     * group.
     *
     * <p>
     * SATCAT validation of the returned NORAD IDs and their
     * current on-orbit status is handled separately by the
     * synchronization layer.
     *
     * @return current GP records whose CelesTrak name
     *         matches debris
     */
    public CelesTrakDebrisResponse[] fetchDebrisByGroup(
            String group) {

        return celesTrakRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(GP_ENDPOINT)
                        .queryParam(
                                "NAME",
                                DEBRIS_NAME_QUERY
                        )
                        .queryParam(
                                "FORMAT",
                                "JSON"
                        )
                        .build())
                .retrieve()
                .body(
                        CelesTrakDebrisResponse[].class
                );
    }
}