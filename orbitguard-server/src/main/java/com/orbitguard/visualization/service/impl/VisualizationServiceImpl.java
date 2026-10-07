package com.orbitguard.visualization.service.impl;

import com.orbitguard.orbit.propagation.dto.EarthFixedPosition;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationFacade;
import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.repository.SatelliteRepository;
import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.visualization.constants.VisualizationApiConstants;
import com.orbitguard.visualization.dto.VisualizationObjectResponse;
import com.orbitguard.visualization.dto.VisualizationResponse;
import com.orbitguard.visualization.service.VisualizationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * ================================================================
 * OrbitGuard AI - Visualization Service Implementation
 * ================================================================
 *
 * Application-layer service responsible for converting propagated
 * orbital data into the visualization API response.
 *
 * Responsibilities:
 *
 * 1. Delegate orbital propagation to OrbitalPropagationFacade.
 * 2. Map propagated orbital data into the visualization API contract.
 * 3. Preserve the object metadata already attached by the
 *    propagation facade.
 *
 * IMPORTANT:
 *
 * This class does NOT:
 *
 * - perform SGP4 propagation
 * - construct TLEs
 * - perform coordinate transformations
 * - calculate orbital risk
 * - perform orbital mathematics
 * - reload the complete satellite/debris dataset for bulk mapping
 *
 * Those responsibilities remain inside their respective modules.
 */
@Service
@RequiredArgsConstructor
public class VisualizationServiceImpl
        implements VisualizationService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    VisualizationServiceImpl.class
            );

    private final OrbitalPropagationFacade
            orbitalPropagationFacade;

    /*
     * These repositories are intentionally retained for the
     * single-object visualization endpoints.
     *
     * The bulk visualization endpoint does NOT use them because
     * PropagatedOrbitalData now already contains objectName and
     * objectType.
     */
    private final SatelliteRepository
            satelliteRepository;

    private final DebrisRepository
            debrisRepository;

    /**
     * ================================================================
     * SINGLE SATELLITE VISUALIZATION
     * ================================================================
     *
     * Propagates one satellite and enriches it with its database name.
     *
     * This endpoint intentionally performs a single satellite lookup.
     * It does NOT load the complete satellite dataset.
     */
    @Override
    public VisualizationResponse getSatelliteVisualization(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {

        if (noradCatalogId == null
                || noradCatalogId <= 0) {

            throw new IllegalArgumentException(
                    "Satellite NORAD catalog ID must be greater than zero."
            );
        }

        validateTargetTime(
                targetTime
        );

        PropagatedOrbitalData propagatedData =
                orbitalPropagationFacade
                        .propagateSatelliteWithPosition(
                                noradCatalogId,
                                targetTime
                        );

        Satellite satellite =
                satelliteRepository
                        .findByNoradCatalogId(
                                noradCatalogId
                        )
                        .orElse(null);

        String objectName =
                satellite != null
                        ? satellite.getSatelliteName()
                        : null;

        return buildVisualizationResponse(
                propagatedData,
                VisualizationApiConstants.SATELLITE_OBJECT_TYPE,
                objectName
        );
    }

    /**
     * ================================================================
     * SINGLE DEBRIS VISUALIZATION
     * ================================================================
     *
     * Propagates one debris object and enriches it with its database
     * name.
     *
     * This endpoint intentionally performs a single debris lookup.
     * It does NOT load the complete debris dataset.
     */
    @Override
    public VisualizationResponse getDebrisVisualization(
            Long noradId,
            LocalDateTime targetTime
    ) {

        if (noradId == null
                || noradId <= 0) {

            throw new IllegalArgumentException(
                    "Debris NORAD ID must be greater than zero."
            );
        }

        validateTargetTime(
                targetTime
        );

        PropagatedOrbitalData propagatedData =
                orbitalPropagationFacade
                        .propagateDebrisWithPosition(
                                noradId,
                                targetTime
                        );

        SpaceDebris debris =
                debrisRepository
                        .findByNoradIdAndIsActiveTrue(
                                noradId
                        )
                        .orElse(null);

        String objectName =
                debris != null
                        ? debris.getDebrisName()
                        : null;

        return buildVisualizationResponse(
                propagatedData,
                VisualizationApiConstants.DEBRIS_OBJECT_TYPE,
                objectName
        );
    }

    /**
     * ================================================================
     * BULK VISUALIZATION
     * ================================================================
     *
     * Retrieves all propagated orbital objects for the requested
     * visualization time and maps them to the frontend API contract.
     *
     * CURRENT DATA FLOW:
     *
     * MongoDB
     *      ↓
     * OrbitalPropagationFacade
     *      ↓
     * SGP4 / Orekit
     *      ↓
     * TEME -> ITRF
     *      ↓
     * PropagatedOrbitalData
     *      ├── orbitalState
     *      ├── geodeticPosition
     *      ├── earthFixedPosition
     *      ├── objectName
     *      └── objectType
     *      ↓
     * API DTO mapping
     *      ↓
     * VisualizationResponse
     *
     * IMPORTANT:
     *
     * The facade already loads the active satellite/debris entities
     * during bulk propagation.
     *
     * Their name/type metadata is now carried inside
     * PropagatedOrbitalData.
     *
     * Therefore this method MUST NOT perform another full MongoDB
     * satellite/debris load.
     */
    @Override
    public VisualizationResponse getAllVisualizationObjects(
            LocalDateTime targetTime
    ) {

        validateTargetTime(
                targetTime
        );

        final long totalStartNanos =
                System.nanoTime();

        /*
         * ============================================================
         * 1. BULK ORBITAL PROPAGATION
         * ============================================================
         */
        final long propagationStartNanos =
                System.nanoTime();

        List<PropagatedOrbitalData> propagatedObjects =
                orbitalPropagationFacade
                        .propagateAllWithPosition(
                                targetTime
                        );

        final long propagationElapsedMillis =
                elapsedMillis(
                        propagationStartNanos
                );

        /*
         * ============================================================
         * EMPTY RESULT
         * ============================================================
         */
        if (propagatedObjects == null
                || propagatedObjects.isEmpty()) {

            log.warn(
                    "No propagated visualization objects returned. "
                            + "targetTime={}, propagationElapsedMs={}",
                    targetTime,
                    propagationElapsedMillis
            );

            return VisualizationResponse.builder()
                    .objects(
                            Collections.emptyList()
                    )
                    .propagatedAt(
                            targetTime.toString()
                    )
                    .build();
        }

        /*
         * ============================================================
         * 2. API DTO MAPPING
         * ============================================================
         *
         * There are NO MongoDB queries here.
         *
         * Object name/type come directly from PropagatedOrbitalData.
         */
        final long mappingStartNanos =
                System.nanoTime();

        List<VisualizationObjectResponse> objects =
                propagatedObjects.stream()
                        .map(
                                this::buildBulkVisualizationObjectSafely
                        )
                        .filter(
                                response -> response != null
                        )
                        .toList();

        final long mappingElapsedMillis =
                elapsedMillis(
                        mappingStartNanos
                );

        /*
         * ============================================================
         * 3. TOTAL TIMING
         * ============================================================
         */
        final long totalElapsedMillis =
                elapsedMillis(
                        totalStartNanos
                );

        log.info(
                "Visualization bulk request completed. "
                        + "propagatedObjects={}, mappedObjects={}, "
                        + "propagationElapsedMs={}, "
                        + "mappingElapsedMs={}, "
                        + "totalElapsedMs={}",
                propagatedObjects.size(),
                objects.size(),
                propagationElapsedMillis,
                mappingElapsedMillis,
                totalElapsedMillis
        );

        return VisualizationResponse.builder()
                .objects(
                        objects
                )
                .propagatedAt(
                        targetTime.toString()
                )
                .build();
    }

    /**
     * ================================================================
     * SINGLE RESPONSE MAPPING
     * ================================================================
     */
    private VisualizationResponse buildVisualizationResponse(
            PropagatedOrbitalData propagatedData,
            String objectType,
            String objectName
    ) {

        validatePropagatedData(
                propagatedData
        );

        GeodeticPosition position =
                propagatedData.getGeodeticPosition();

        EarthFixedPosition earthFixedPosition =
                propagatedData.getEarthFixedPosition();

        PropagatedOrbitalState orbitalState =
                propagatedData.getOrbitalState();

        VisualizationObjectResponse object =
                VisualizationObjectResponse.builder()
                        .noradId(
                                orbitalState
                                        .getNoradCatalogId()
                        )
                        .name(
                                resolveObjectName(
                                        objectName,
                                        objectType
                                )
                        )
                        .objectType(
                                objectType
                        )
                        .latitude(
                                position.getLatitude()
                        )
                        .longitude(
                                position.getLongitude()
                        )
                        .altitudeKm(
                                position.getAltitude()
                        )
                        .xKm(
                                getX(
                                        earthFixedPosition
                                )
                        )
                        .yKm(
                                getY(
                                        earthFixedPosition
                                )
                        )
                        .zKm(
                                getZ(
                                        earthFixedPosition
                                )
                        )
                        .frame(
                                getFrame(
                                        earthFixedPosition
                                )
                        )
                        .timestamp(
                                orbitalState
                                        .getTimestamp()
                                        .toString()
                        )
                        .build();

        return VisualizationResponse.builder()
                .object(
                        object
                )
                .propagatedAt(
                        orbitalState
                                .getTimestamp()
                                .toString()
                )
                .build();
    }

    /**
     * ================================================================
     * BULK OBJECT MAPPING
     * ================================================================
     *
     * Object metadata is already present inside
     * PropagatedOrbitalData.
     *
     * No repository access occurs here.
     */
    private VisualizationObjectResponse
    buildBulkVisualizationObjectSafely(
            PropagatedOrbitalData propagatedData
    ) {

        try {

            validatePropagatedData(
                    propagatedData
            );

            PropagatedOrbitalState orbitalState =
                    propagatedData.getOrbitalState();

            Long noradId =
                    orbitalState.getNoradCatalogId();

            String objectName =
                    propagatedData.getObjectName();

            String objectType =
                    propagatedData.getObjectType();

            /*
             * --------------------------------------------------------
             * OBJECT TYPE VALIDATION
             * --------------------------------------------------------
             *
             * The facade determines whether the source object is a
             * satellite or debris, so the value should normally never
             * be null.
             *
             * If metadata is unexpectedly missing, we skip the object
             * rather than guessing its type from an arbitrary field.
             */
            if (objectType == null
                    || objectType.isBlank()) {

                log.warn(
                        "Skipping visualization object because "
                                + "object type is missing. noradId={}",
                        noradId
                );

                return null;
            }

            return buildVisualizationObject(
                    propagatedData,
                    noradId,
                    objectName,
                    objectType
            );

        } catch (RuntimeException exception) {

            Long noradId =
                    extractNoradId(
                            propagatedData
                    );

            log.warn(
                    "Skipping visualization object during API "
                            + "mapping. noradId={}, reason={}",
                    noradId,
                    exception.getMessage()
            );

            return null;
        }
    }

    /**
     * ================================================================
     * COMMON VISUALIZATION OBJECT MAPPING
     * ================================================================
     */
    private VisualizationObjectResponse buildVisualizationObject(
            PropagatedOrbitalData propagatedData,
            Long noradId,
            String objectName,
            String objectType
    ) {

        validatePropagatedData(
                propagatedData
        );

        GeodeticPosition position =
                propagatedData.getGeodeticPosition();

        EarthFixedPosition earthFixedPosition =
                propagatedData.getEarthFixedPosition();

        PropagatedOrbitalState orbitalState =
                propagatedData.getOrbitalState();

        return VisualizationObjectResponse.builder()
                .noradId(
                        noradId
                )
                .name(
                        resolveObjectName(
                                objectName,
                                objectType
                        )
                )
                .objectType(
                        objectType
                )
                .latitude(
                        position.getLatitude()
                )
                .longitude(
                        position.getLongitude()
                )
                .altitudeKm(
                        position.getAltitude()
                )
                .xKm(
                        getX(
                                earthFixedPosition
                        )
                )
                .yKm(
                        getY(
                                earthFixedPosition
                        )
                )
                .zKm(
                        getZ(
                                earthFixedPosition
                        )
                )
                .frame(
                        getFrame(
                                earthFixedPosition
                        )
                )
                .timestamp(
                        orbitalState
                                .getTimestamp()
                                .toString()
                )
                .build();
    }

    /**
     * ================================================================
     * PROPAGATED DATA VALIDATION
     * ================================================================
     */
    private void validatePropagatedData(
            PropagatedOrbitalData propagatedData
    ) {

        if (propagatedData == null) {

            throw new IllegalStateException(
                    "Propagated orbital data must not be null."
            );
        }

        if (propagatedData.getOrbitalState() == null) {

            throw new IllegalStateException(
                    "Propagated orbital state must not be null."
            );
        }

        if (propagatedData.getGeodeticPosition() == null) {

            throw new IllegalStateException(
                    "Geodetic position must not be null."
            );
        }

        if (propagatedData.getEarthFixedPosition() == null) {

            throw new IllegalStateException(
                    "Earth-fixed position must not be null."
            );
        }

        if (propagatedData
                .getOrbitalState()
                .getNoradCatalogId() == null) {

            throw new IllegalStateException(
                    "Propagated orbital state must contain "
                            + "a NORAD catalog ID."
            );
        }

        if (propagatedData
                .getOrbitalState()
                .getTimestamp() == null) {

            throw new IllegalStateException(
                    "Propagated orbital timestamp must not be null."
            );
        }
    }

    /**
     * ================================================================
     * TARGET TIME VALIDATION
     * ================================================================
     */
    private void validateTargetTime(
            LocalDateTime targetTime
    ) {

        if (targetTime == null) {

            throw new IllegalArgumentException(
                    "Target visualization time must not be null."
            );
        }
    }

    /**
     * ================================================================
     * NAME RESOLUTION
     * ================================================================
     */
    private String resolveObjectName(
            String objectName,
            String objectType
    ) {

        if (objectName != null
                && !objectName.isBlank()) {

            return objectName;
        }

        if (VisualizationApiConstants
                .SATELLITE_OBJECT_TYPE
                .equals(objectType)) {

            return "Satellite";
        }

        return "Debris";
    }

    /**
     * ================================================================
     * NORAD EXTRACTION
     * ================================================================
     */
    private Long extractNoradId(
            PropagatedOrbitalData propagatedData
    ) {

        if (propagatedData == null
                || propagatedData.getOrbitalState() == null) {

            return null;
        }

        return propagatedData
                .getOrbitalState()
                .getNoradCatalogId();
    }

    /**
     * ================================================================
     * EARTH-FIXED POSITION HELPERS
     * ================================================================
     */
    private Double getX(
            EarthFixedPosition position
    ) {

        return position != null
                ? position.getXKm()
                : null;
    }

    private Double getY(
            EarthFixedPosition position
    ) {

        return position != null
                ? position.getYKm()
                : null;
    }

    private Double getZ(
            EarthFixedPosition position
    ) {

        return position != null
                ? position.getZKm()
                : null;
    }

    private String getFrame(
            EarthFixedPosition position
    ) {

        return position != null
                ? position.getFrame()
                : null;
    }

    /**
     * ================================================================
     * ELAPSED TIME
     * ================================================================
     */
    private long elapsedMillis(
            long startNanos
    ) {

        return (
                System.nanoTime()
                        - startNanos
        ) / 1_000_000L;
    }
}