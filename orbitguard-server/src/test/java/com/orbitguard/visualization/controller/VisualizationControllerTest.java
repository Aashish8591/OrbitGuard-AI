package com.orbitguard.visualization.controller;

import com.orbitguard.visualization.dto.VisualizationObjectResponse;
import com.orbitguard.visualization.dto.VisualizationResponse;
import com.orbitguard.visualization.service.VisualizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ================================================================
 * OrbitGuard AI - Visualization Controller Test
 * ================================================================
 *
 * This test intentionally does NOT start the Spring Boot
 * ApplicationContext.
 *
 * It tests only:
 *
 *     VisualizationController
 *             ↓
 *     ResponseBuilder
 *             ↓
 *     Jackson serialization
 *             ↓
 *     HTTP JSON response
 *
 * MongoDB, Security, JWT, Orekit, CelesTrak and the orbital
 * propagation infrastructure are intentionally excluded.
 */
@ExtendWith(MockitoExtension.class)
class VisualizationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VisualizationService visualizationService;

    @BeforeEach
    void setUp() {

        VisualizationController controller =
                new VisualizationController(
                        visualizationService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(controller)
                        .build();
    }

    /**
     * ================================================================
     * TEST 1
     * ================================================================
     *
     * Verifies the normal visualization endpoint response using
     * a small dataset.
     */
    @Test
    void shouldReturnVisualizationObjectsSuccessfully()
            throws Exception {

        LocalDateTime targetTime =
                LocalDateTime.of(
                        2026,
                        10,
                        7,
                        15,
                        0
                );

        VisualizationObjectResponse satellite =
                createVisualizationObject(
                        49271L,
                        "FREGAT DEB",
                        "SATELLITE"
                );

        VisualizationObjectResponse debris =
                createVisualizationObject(
                        13753L,
                        "1976-023 DEB",
                        "DEBRIS"
                );

        VisualizationResponse response =
                VisualizationResponse.builder()
                        .objects(
                                List.of(
                                        satellite,
                                        debris
                                )
                        )
                        .propagatedAt(
                                targetTime.toString()
                        )
                        .build();

        when(
                visualizationService
                        .getAllVisualizationObjects(
                                any(LocalDateTime.class)
                        )
        ).thenReturn(response);

        mockMvc.perform(
                        get(
                                "/api/visualization/objects"
                        )
                                .param(
                                        "targetTime",
                                        "2026-10-07T15:00:00"
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        content()
                                .contentTypeCompatibleWith(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        jsonPath(
                                "$.success"
                        ).value(true)
                )
                .andExpect(
                        jsonPath(
                                "$.message"
                        ).value(
                                "Satellite and debris visualization data retrieved successfully."
                        )
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects"
                        ).isArray()
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects.length()"
                        ).value(2)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[0].noradId"
                        ).value(49271)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[0].name"
                        ).value("FREGAT DEB")
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[0].objectType"
                        ).value("SATELLITE")
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[1].noradId"
                        ).value(13753)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[1].name"
                        ).value("1976-023 DEB")
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[1].objectType"
                        ).value("DEBRIS")
                )
                .andExpect(
                        jsonPath(
                                "$.data.propagatedAt"
                        ).value(
                                "2026-10-07T15:00"
                        )
                );

        verify(
                visualizationService
        ).getAllVisualizationObjects(
                targetTime
        );
    }

    /**
     * ================================================================
     * TEST 2 - PRODUCTION-SIZED RESPONSE
     * ================================================================
     *
     * Simulates the exact number of objects currently returned by
     * the backend:
     *
     *     16,619 satellites
     *     11,752 debris
     *     ----------------
     *     28,371 objects
     *
     * This test checks whether Spring MVC + Jackson can serialize
     * the complete visualization response.
     */
    @Test
    void shouldSerializeAll28371VisualizationObjects()
            throws Exception {

        LocalDateTime targetTime =
                LocalDateTime.of(
                        2026,
                        10,
                        7,
                        15,
                        0
                );

        final int satelliteCount =
                16619;

        final int debrisCount =
                11752;

        final int totalObjects =
                satelliteCount + debrisCount;

        List<VisualizationObjectResponse> objects =
                IntStream.range(
                                0,
                                totalObjects
                        )
                        .mapToObj(
                                index -> {

                                    boolean satellite =
                                            index < satelliteCount;

                                    long noradId =
                                            index + 1L;

                                    String objectType =
                                            satellite
                                                    ? "SATELLITE"
                                                    : "DEBRIS";

                                    String name =
                                            satellite
                                                    ? "Satellite-" + index
                                                    : "Debris-" + index;

                                    return createVisualizationObject(
                                            noradId,
                                            name,
                                            objectType
                                    );
                                }
                        )
                        .toList();

        assertEquals(
                28371,
                objects.size()
        );

        VisualizationResponse response =
                VisualizationResponse.builder()
                        .objects(objects)
                        .propagatedAt(
                                targetTime.toString()
                        )
                        .build();

        when(
                visualizationService
                        .getAllVisualizationObjects(
                                any(LocalDateTime.class)
                        )
        ).thenReturn(response);

        mockMvc.perform(
                        get(
                                "/api/visualization/objects"
                        )
                                .param(
                                        "targetTime",
                                        "2026-10-07T15:00:00"
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        content()
                                .contentTypeCompatibleWith(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        jsonPath(
                                "$.success"
                        ).value(true)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects"
                        ).isArray()
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects.length()"
                        ).value(totalObjects)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[0].noradId"
                        ).value(1)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[16618].noradId"
                        ).value(16619)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[16619].noradId"
                        ).value(16620)
                )
                .andExpect(
                        jsonPath(
                                "$.data.objects[28370].noradId"
                        ).value(28371)
                )
                .andExpect(
                        jsonPath(
                                "$.data.propagatedAt"
                        ).value(
                                "2026-10-07T15:00"
                        )
                );

        verify(
                visualizationService
        ).getAllVisualizationObjects(
                targetTime
        );
    }

    /**
     * ================================================================
     * TEST DATA FACTORY
     * ================================================================
     */
    private VisualizationObjectResponse
    createVisualizationObject(
            Long noradId,
            String name,
            String objectType
    ) {

        return VisualizationObjectResponse.builder()
                .noradId(
                        noradId
                )
                .name(
                        name
                )
                .objectType(
                        objectType
                )
                .latitude(
                        10.5
                )
                .longitude(
                        20.5
                )
                .altitudeKm(
                        500.0
                )
                .xKm(
                        1000.0
                )
                .yKm(
                        2000.0
                )
                .zKm(
                        3000.0
                )
                .frame(
                        "ITRF"
                )
                .timestamp(
                        "2026-10-07T15:00:00"
                )
                .build();
    }
}