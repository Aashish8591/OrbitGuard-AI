package com.orbitguard.orbit.propagation.service;

import com.orbitguard.debris.entity.SpaceDebris;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import com.orbitguard.debris.repository.DebrisRepository;
import com.orbitguard.orbit.propagation.dto.CoordinateConversionResult;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;
import com.orbitguard.orbit.propagation.mapper.DebrisOrbitalPropagationMapper;
import com.orbitguard.orbit.propagation.mapper.SatelliteOrbitalPropagationMapper;
import com.orbitguard.satellite.entity.Satellite;
import com.orbitguard.satellite.integration.celestrak.service.CelesTrakService;
import com.orbitguard.satellite.repository.SatelliteRepository;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Service
public class OrbitalPropagationFacadeImpl
        implements OrbitalPropagationFacade {

    private static final Logger log =
            LoggerFactory.getLogger(
                    OrbitalPropagationFacadeImpl.class
            );

    private static final int BULK_PROPAGATION_THREADS =
            Math.max(
                    1,
                    Math.min(
                            8,
                            Runtime.getRuntime().availableProcessors()
                    )
            );

    private static final int MAX_IN_FLIGHT_TASKS =
            BULK_PROPAGATION_THREADS * 2;

    private final ExecutorService bulkPropagationExecutor;

    private final CelesTrakService celesTrakService;

    private final CelesTrakDebrisService celesTrakDebrisService;

    private final SatelliteOrbitalPropagationMapper
            satelliteOrbitalPropagationMapper;

    private final DebrisOrbitalPropagationMapper
            debrisOrbitalPropagationMapper;

    private final OrbitalPropagationService orbitalPropagationService;

    private final CoordinateConversionService coordinateConversionService;

    private final SatelliteRepository satelliteRepository;

    private final DebrisRepository debrisRepository;

    private static final class BulkPropagationContext {

        private final PropagatedOrbitalState orbitalState;
        private final String objectName;
        private final String objectType;

        private BulkPropagationContext(
                PropagatedOrbitalState orbitalState,
                String objectName,
                String objectType
        ) {
            this.orbitalState = orbitalState;
            this.objectName = objectName;
            this.objectType = objectType;
        }

        private PropagatedOrbitalState getOrbitalState() {
            return orbitalState;
        }

        private String getObjectName() {
            return objectName;
        }

        private String getObjectType() {
            return objectType;
        }
    }

    @Autowired
    public OrbitalPropagationFacadeImpl(
            CelesTrakService celesTrakService,
            CelesTrakDebrisService celesTrakDebrisService,
            SatelliteOrbitalPropagationMapper satelliteOrbitalPropagationMapper,
            DebrisOrbitalPropagationMapper debrisOrbitalPropagationMapper,
            OrbitalPropagationService orbitalPropagationService,
            CoordinateConversionService coordinateConversionService,
            SatelliteRepository satelliteRepository,
            DebrisRepository debrisRepository
    ) {

        this.celesTrakService = celesTrakService;
        this.celesTrakDebrisService = celesTrakDebrisService;
        this.satelliteOrbitalPropagationMapper =
                satelliteOrbitalPropagationMapper;
        this.debrisOrbitalPropagationMapper =
                debrisOrbitalPropagationMapper;
        this.orbitalPropagationService = orbitalPropagationService;
        this.coordinateConversionService = coordinateConversionService;
        this.satelliteRepository = satelliteRepository;
        this.debrisRepository = debrisRepository;

        this.bulkPropagationExecutor =
                Executors.newFixedThreadPool(
                        BULK_PROPAGATION_THREADS
                );

        log.info(
                "Orbital propagation executor initialized. " +
                        "threads={}, maxInFlight={}",
                BULK_PROPAGATION_THREADS,
                MAX_IN_FLIGHT_TASKS
        );
    }

    /*
     * ================================================================
     * SINGLE SATELLITE PROPAGATION
     * ================================================================
     *
     * Data-source order:
     *
     * 1. Try CelesTrak for the latest orbital elements.
     * 2. If retrieval fails or returns no usable record, look up MongoDB.
     * 3. Validate cached orbital elements before propagation.
     *
     * No other propagation flow is changed.
     */
    @Override
    public PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {

        validateSatelliteNoradId(noradCatalogId);
        validateTargetTime(targetTime);

        RuntimeException liveDataFailure = null;

        /*
         * ------------------------------------------------------------
         * STEP 1: TRY LIVE CELESTRAK DATA
         * ------------------------------------------------------------
         */
        try {

            List<
                    com.orbitguard.satellite.integration.celestrak.dto
                            .CelesTrakOrbitalData
                    > orbitalDataList =
                    celesTrakService.fetchSatelliteOrbitalData(
                            noradCatalogId
                    );

            if (orbitalDataList == null
                    || orbitalDataList.isEmpty()
                    || orbitalDataList.get(0) == null) {

                liveDataFailure = new IllegalStateException(
                        "CelesTrak returned no usable orbital data " +
                                "for satellite NORAD ID: " +
                                noradCatalogId
                );

            } else {

                com.orbitguard.satellite.integration.celestrak.dto
                        .CelesTrakOrbitalData orbitalData =
                        orbitalDataList.get(0);

                OrbitalPropagationInput input =
                        satelliteOrbitalPropagationMapper
                                .toPropagationInput(
                                        orbitalData,
                                        targetTime
                                );

                if (input == null) {

                    liveDataFailure = new IllegalStateException(
                            "Failed to map CelesTrak orbital data " +
                                    "for satellite NORAD ID: " +
                                    noradCatalogId
                    );

                } else {

                    log.debug(
                            "Using live CelesTrak orbital data " +
                                    "for satellite NORAD ID={}",
                            noradCatalogId
                    );

                    return orbitalPropagationService.propagate(
                            input
                    );
                }
            }

        } catch (RuntimeException exception) {

            /*
             * Catch only the live-data/mapping/propagation path here
             * so a failed live attempt can fall back to cached data.
             */
            liveDataFailure = exception;

            log.warn(
                    "Live satellite propagation failed for NORAD ID={}. " +
                            "Checking MongoDB fallback. Reason: {}",
                    noradCatalogId,
                    exception.getMessage()
            );
        }

        /*
         * ------------------------------------------------------------
         * STEP 2: LOOK UP THE SATELLITE IN MONGODB
         * ------------------------------------------------------------
         */
        Satellite cachedSatellite;

        try {

            cachedSatellite =
                    satelliteRepository
                            .findByNoradCatalogId(noradCatalogId)
                            .orElse(null);

        } catch (RuntimeException databaseException) {

            log.error(
                    "MongoDB lookup failed for satellite NORAD ID={}",
                    noradCatalogId,
                    databaseException
            );

            IllegalStateException exception =
                    new IllegalStateException(
                            "Unable to retrieve cached satellite data " +
                                    "from MongoDB for NORAD ID: " +
                                    noradCatalogId,
                            databaseException
                    );

            if (liveDataFailure != null) {
                exception.addSuppressed(liveDataFailure);
            }

            throw exception;
        }

        if (cachedSatellite == null) {

            IllegalStateException exception =
                    new IllegalStateException(
                            "Satellite NORAD ID " + noradCatalogId +
                                    " could not be propagated. " +
                                    "CelesTrak failed and no matching " +
                                    "satellite exists in MongoDB."
                    );

            if (liveDataFailure != null) {
                exception.initCause(liveDataFailure);
            }

            throw exception;
        }

        /*
         * ------------------------------------------------------------
         * STEP 3: VALIDATE CACHED ORBITAL ELEMENTS
         * ------------------------------------------------------------
         */
        if (!hasCompleteCachedOrbitalElements(cachedSatellite)) {

            IllegalStateException exception =
                    new IllegalStateException(
                            "Cached orbital elements are incomplete " +
                                    "for satellite NORAD ID: " +
                                    noradCatalogId +
                                    ". Synchronize complete orbital " +
                                    "elements before retrying."
                    );

            if (liveDataFailure != null) {
                exception.initCause(liveDataFailure);
            }

            throw exception;
        }

        /*
         * ------------------------------------------------------------
         * STEP 4: BUILD INPUT FROM MONGODB
         * ------------------------------------------------------------
         */
        OrbitalPropagationInput cachedInput =
                buildCachedSatellitePropagationInput(
                        cachedSatellite,
                        targetTime
                );

        log.warn(
                "Using cached MongoDB orbital elements for satellite " +
                        "NORAD ID={}. Verify the stored epoch and data " +
                        "freshness. Live-data failure: {}",
                noradCatalogId,
                liveDataFailure != null
                        ? liveDataFailure.getMessage()
                        : "No usable live data returned"
        );

        /*
         * ------------------------------------------------------------
         * STEP 5: PROPAGATE USING EXISTING PROPAGATION SERVICE
         * ------------------------------------------------------------
         */
        return orbitalPropagationService.propagate(
                cachedInput
        );
    }

    /*
     * ================================================================
     * CACHED SATELLITE DATA VALIDATION
     * ================================================================
     */
    private boolean hasCompleteCachedOrbitalElements(
            Satellite satellite
    ) {

        if (satellite == null
                || satellite.getNoradCatalogId() == null
                || satellite.getNoradCatalogId() <= 0) {

            return false;
        }

        return satellite.getEpoch() != null
                && satellite.getMeanMotion() != null
                && satellite.getEccentricity() != null
                && satellite.getInclination() != null
                && satellite.getRightAscensionOfAscendingNode() != null
                && satellite.getArgumentOfPericenter() != null
                && satellite.getMeanAnomaly() != null;
    }

    /*
     * ================================================================
     * BUILD CACHED SATELLITE PROPAGATION INPUT
     * ================================================================
     *
     * Uses the same orbital fields already used by bulk propagation.
     * Does not introduce a new propagation implementation.
     */
    private OrbitalPropagationInput buildCachedSatellitePropagationInput(
            Satellite satellite,
            LocalDateTime targetTime
    ) {

        return OrbitalPropagationInput.builder()
                .noradCatalogId(
                        satellite.getNoradCatalogId().longValue()
                )
                .objectId(
                        satellite.getObjectId()
                )
                .classificationType(
                        satellite.getClassificationType()
                )
                .ephemerisType(
                        satellite.getEphemerisType()
                )
                .epoch(
                        satellite.getEpoch()
                )
                .meanMotion(
                        satellite.getMeanMotion()
                )
                .meanMotionDot(
                        satellite.getMeanMotionDot()
                )
                .meanMotionDdot(
                        satellite.getMeanMotionDdot()
                )
                .eccentricity(
                        satellite.getEccentricity()
                )
                .inclination(
                        satellite.getInclination()
                )
                .rightAscensionOfAscendingNode(
                        satellite.getRightAscensionOfAscendingNode()
                )
                .argumentOfPericenter(
                        satellite.getArgumentOfPericenter()
                )
                .meanAnomaly(
                        satellite.getMeanAnomaly()
                )
                .bstar(
                        satellite.getBstar()
                )
                .elementSetNumber(
                        satellite.getElementSetNumber()
                )
                .revolutionAtEpoch(
                        satellite.getRevolutionAtEpoch() == null
                                ? null
                                : satellite.getRevolutionAtEpoch().longValue()
                )
                .targetTime(
                        targetTime
                )
                .build();
    }

    /*
     * ================================================================
     * SINGLE DEBRIS PROPAGATION
     * ================================================================
     */
    @Override
    public PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime
    ) {

        validateDebrisNoradId(noradId);
        validateTargetTime(targetTime);

        CelesTrakOrbitalData orbitalData =
                celesTrakDebrisService.fetchOrbitalData(
                        noradId
                );

        if (orbitalData == null) {

            throw new IllegalArgumentException(
                    "No orbital data found for debris NORAD ID: " +
                            noradId
            );
        }

        OrbitalPropagationInput input =
                debrisOrbitalPropagationMapper.toPropagationInput(
                        orbitalData,
                        targetTime
                );

        if (input == null) {

            throw new IllegalStateException(
                    "Failed to create orbital propagation input " +
                            "for debris NORAD ID: " +
                            noradId
            );
        }

        return orbitalPropagationService.propagate(
                input
        );
    }

    /*
     * ================================================================
     * SINGLE SATELLITE WITH POSITION
     * ================================================================
     */
    @Override
    public PropagatedOrbitalData propagateSatelliteWithPosition(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {

        PropagatedOrbitalState orbitalState =
                propagateSatellite(
                        noradCatalogId,
                        targetTime
                );

        return buildPropagatedOrbitalData(
                orbitalState,
                null,
                null
        );
    }

    /*
     * ================================================================
     * SINGLE DEBRIS WITH POSITION
     * ================================================================
     */
    @Override
    public PropagatedOrbitalData propagateDebrisWithPosition(
            Long noradId,
            LocalDateTime targetTime
    ) {

        PropagatedOrbitalState orbitalState =
                propagateDebris(
                        noradId,
                        targetTime
                );

        return buildPropagatedOrbitalData(
                orbitalState,
                null,
                null
        );
    }

    /*
     * ================================================================
     * BULK PROPAGATION FOR 3D VISUALIZATION
     * ================================================================
     */
    @Override
    public List<PropagatedOrbitalData> propagateAllWithPosition(
            LocalDateTime targetTime
    ) {

        validateTargetTime(targetTime);

        long totalStartNanos = System.nanoTime();

        long databaseStartNanos = System.nanoTime();

        List<Satellite> satellites =
                satelliteRepository.findByActiveTrue();

        List<SpaceDebris> debrisObjects =
                debrisRepository.findByIsActiveTrue();

        if (satellites == null) {
            satellites = Collections.emptyList();
        }

        if (debrisObjects == null) {
            debrisObjects = Collections.emptyList();
        }

        long databaseElapsedMillis =
                elapsedMillis(databaseStartNanos);

        log.info(
                "Bulk orbital data loaded from MongoDB. " +
                        "satellites={}, debris={}, elapsedMs={}",
                satellites.size(),
                debrisObjects.size(),
                databaseElapsedMillis
        );

        log.info(
                "Starting bulk orbital propagation. " +
                        "satellites={}, debris={}, total={}, " +
                        "targetTime={}, threads={}, maxInFlight={}",
                satellites.size(),
                debrisObjects.size(),
                satellites.size() + debrisObjects.size(),
                targetTime,
                BULK_PROPAGATION_THREADS,
                MAX_IN_FLIGHT_TASKS
        );

        /*
         * Filter invalid records.
         */
        long filteringStartNanos = System.nanoTime();

        List<Satellite> validSatellites =
                satellites.stream()
                        .filter(this::hasRequiredSatellitePropagationData)
                        .toList();

        List<SpaceDebris> validDebris =
                debrisObjects.stream()
                        .filter(this::hasRequiredDebrisPropagationData)
                        .toList();

        int skippedSatellites =
                satellites.size() - validSatellites.size();

        int skippedDebris =
                debrisObjects.size() - validDebris.size();

        long filteringElapsedMillis =
                elapsedMillis(filteringStartNanos);

        log.info(
                "Bulk propagation input filtering completed. " +
                        "validSatellites={}, validDebris={}, " +
                        "skippedSatellites={}, skippedDebris={}, " +
                        "elapsedMs={}",
                validSatellites.size(),
                validDebris.size(),
                skippedSatellites,
                skippedDebris,
                filteringElapsedMillis
        );

        /*
         * Satellite propagation.
         */
        long satelliteStartNanos = System.nanoTime();

        List<BulkPropagationContext> satelliteContexts =
                propagateInParallel(
                        validSatellites,
                        satellite -> propagateSatelliteWithMetadata(
                                satellite,
                                targetTime
                        ),
                        satellite -> "satellite NORAD " +
                                satellite.getNoradCatalogId()
                );

        long satelliteElapsedMillis =
                elapsedMillis(satelliteStartNanos);

        log.info(
                "Bulk satellite propagation completed. " +
                        "successful={}, submitted={}, elapsedMs={}",
                satelliteContexts.size(),
                validSatellites.size(),
                satelliteElapsedMillis
        );

        /*
         * Debris propagation.
         */
        long debrisStartNanos = System.nanoTime();

        List<BulkPropagationContext> debrisContexts =
                propagateInParallel(
                        validDebris,
                        debris -> propagateDebrisWithMetadata(
                                debris,
                                targetTime
                        ),
                        debris -> "debris NORAD " + debris.getNoradId()
                );

        long debrisElapsedMillis =
                elapsedMillis(debrisStartNanos);

        log.info(
                "Bulk debris propagation completed. " +
                        "successful={}, submitted={}, elapsedMs={}",
                debrisContexts.size(),
                validDebris.size(),
                debrisElapsedMillis
        );

        /*
         * Combine propagated states and metadata.
         */
        long combineStartNanos = System.nanoTime();

        List<BulkPropagationContext> propagatedContexts =
                new ArrayList<>(
                        satelliteContexts.size() + debrisContexts.size()
                );

        propagatedContexts.addAll(satelliteContexts);
        propagatedContexts.addAll(debrisContexts);

        long combineElapsedMillis =
                elapsedMillis(combineStartNanos);

        /*
         * Coordinate conversion.
         */
        long conversionStartNanos = System.nanoTime();

        List<PropagatedOrbitalData> results =
                new ArrayList<>(propagatedContexts.size());

        int conversionFailures = 0;

        for (BulkPropagationContext context : propagatedContexts) {

            if (context == null
                    || context.getOrbitalState() == null) {
                continue;
            }

            try {

                results.add(
                        buildPropagatedOrbitalData(
                                context.getOrbitalState(),
                                context.getObjectName(),
                                context.getObjectType()
                        )
                );

            } catch (RuntimeException exception) {

                conversionFailures++;

                log.debug(
                        "Skipping coordinate conversion for NORAD ID={}: {}",
                        context.getOrbitalState().getNoradCatalogId(),
                        exception.getMessage()
                );
            }
        }

        long conversionElapsedMillis =
                elapsedMillis(conversionStartNanos);

        /*
         * Final timing.
         */
        long totalElapsedMillis =
                elapsedMillis(totalStartNanos);

        long measuredPhaseMillis =
                databaseElapsedMillis
                        + filteringElapsedMillis
                        + satelliteElapsedMillis
                        + debrisElapsedMillis
                        + combineElapsedMillis
                        + conversionElapsedMillis;

        long unaccountedElapsedMillis =
                Math.max(
                        0,
                        totalElapsedMillis - measuredPhaseMillis
                );

        log.info(
                "Bulk orbital propagation completed. " +
                        "successfulPropagation={}, " +
                        "successfulVisualizationData={}, " +
                        "conversionFailures={}, " +
                        "databaseElapsedMs={}, " +
                        "filteringElapsedMs={}, " +
                        "satellitePropagationElapsedMs={}, " +
                        "debrisPropagationElapsedMs={}, " +
                        "combineElapsedMs={}, " +
                        "conversionElapsedMs={}, " +
                        "totalElapsedMs={}, " +
                        "unaccountedElapsedMs={}",
                propagatedContexts.size(),
                results.size(),
                conversionFailures,
                databaseElapsedMillis,
                filteringElapsedMillis,
                satelliteElapsedMillis,
                debrisElapsedMillis,
                combineElapsedMillis,
                conversionElapsedMillis,
                totalElapsedMillis,
                unaccountedElapsedMillis
        );

        return results;
    }

    /*
     * ================================================================
     * BUILD PROPAGATED ORBITAL DATA
     * ================================================================
     */
    private PropagatedOrbitalData buildPropagatedOrbitalData(
            PropagatedOrbitalState orbitalState,
            String objectName,
            String objectType
    ) {

        if (orbitalState == null) {

            throw new IllegalArgumentException(
                    "Propagated orbital state must not be null."
            );
        }

        CoordinateConversionResult conversion =
                coordinateConversionService.convert(
                        orbitalState
                );

        if (conversion == null) {

            throw new IllegalStateException(
                    "Coordinate conversion returned null for NORAD ID: " +
                            orbitalState.getNoradCatalogId()
            );
        }

        return PropagatedOrbitalData.builder()
                .orbitalState(orbitalState)
                .geodeticPosition(conversion.getGeodeticPosition())
                .earthFixedPosition(conversion.getEarthFixedPosition())
                .objectName(objectName)
                .objectType(objectType)
                .build();
    }

    /*
     * ================================================================
     * SATELLITE BULK PROPAGATION WITH METADATA
     * ================================================================
     */
    private BulkPropagationContext propagateSatelliteWithMetadata(
            Satellite satellite,
            LocalDateTime targetTime
    ) {

        if (satellite == null) {

            throw new IllegalArgumentException(
                    "Satellite must not be null."
            );
        }

        PropagatedOrbitalState orbitalState =
                propagateSatelliteStateForBulk(
                        satellite,
                        targetTime
                );

        String objectName = satellite.getSatelliteName();

        if (objectName == null || objectName.isBlank()) {
            objectName = "Satellite";
        }

        return new BulkPropagationContext(
                orbitalState,
                objectName,
                "SATELLITE"
        );
    }

    /*
     * ================================================================
     * DEBRIS BULK PROPAGATION WITH METADATA
     * ================================================================
     */
    private BulkPropagationContext propagateDebrisWithMetadata(
            SpaceDebris debris,
            LocalDateTime targetTime
    ) {

        if (debris == null) {

            throw new IllegalArgumentException(
                    "Debris must not be null."
            );
        }

        PropagatedOrbitalState orbitalState =
                propagateDebrisStateForBulk(
                        debris,
                        targetTime
                );

        String objectName = debris.getDebrisName();

        if (objectName == null || objectName.isBlank()) {
            objectName = "Debris";
        }

        return new BulkPropagationContext(
                orbitalState,
                objectName,
                "DEBRIS"
        );
    }

    /*
     * ================================================================
     * SATELLITE BULK PROPAGATION
     * ================================================================
     *
     * Uses MongoDB orbital elements. Does not call CelesTrak.
     */
    private PropagatedOrbitalState propagateSatelliteStateForBulk(
            Satellite satellite,
            LocalDateTime targetTime
    ) {

        if (satellite == null) {

            throw new IllegalArgumentException(
                    "Satellite must not be null."
            );
        }

        OrbitalPropagationInput input =
                OrbitalPropagationInput.builder()
                        .noradCatalogId(
                                satellite.getNoradCatalogId().longValue()
                        )
                        .objectId(satellite.getObjectId())
                        .classificationType(satellite.getClassificationType())
                        .ephemerisType(satellite.getEphemerisType())
                        .epoch(satellite.getEpoch())
                        .meanMotion(satellite.getMeanMotion())
                        .meanMotionDot(satellite.getMeanMotionDot())
                        .meanMotionDdot(satellite.getMeanMotionDdot())
                        .eccentricity(satellite.getEccentricity())
                        .inclination(satellite.getInclination())
                        .rightAscensionOfAscendingNode(
                                satellite.getRightAscensionOfAscendingNode()
                        )
                        .argumentOfPericenter(
                                satellite.getArgumentOfPericenter()
                        )
                        .meanAnomaly(satellite.getMeanAnomaly())
                        .bstar(satellite.getBstar())
                        .elementSetNumber(satellite.getElementSetNumber())
                        .revolutionAtEpoch(
                                satellite.getRevolutionAtEpoch().longValue()
                        )
                        .targetTime(targetTime)
                        .build();

        return orbitalPropagationService.propagate(input);
    }

    /*
     * ================================================================
     * DEBRIS BULK PROPAGATION
     * ================================================================
     */
    private PropagatedOrbitalState propagateDebrisStateForBulk(
            SpaceDebris debris,
            LocalDateTime targetTime
    ) {

        if (debris == null) {

            throw new IllegalArgumentException(
                    "Debris must not be null."
            );
        }

        OrbitalPropagationInput input =
                OrbitalPropagationInput.builder()
                        .noradCatalogId(debris.getNoradId())
                        .objectId(debris.getObjectId())
                        .classificationType(debris.getClassificationType())
                        .ephemerisType(debris.getEphemerisType())
                        .epoch(debris.getEpoch())
                        .meanMotion(debris.getMeanMotion())
                        .meanMotionDot(debris.getMeanMotionDot())
                        .meanMotionDdot(debris.getMeanMotionDdot())
                        .eccentricity(debris.getEccentricity())
                        .inclination(debris.getInclination())
                        .rightAscensionOfAscendingNode(
                                debris.getRightAscensionOfAscendingNode()
                        )
                        .argumentOfPericenter(debris.getArgumentOfPericenter())
                        .meanAnomaly(debris.getMeanAnomaly())
                        .bstar(debris.getBstar())
                        .elementSetNumber(debris.getElementSetNumber())
                        .revolutionAtEpoch(debris.getRevolutionAtEpoch())
                        .targetTime(targetTime)
                        .build();

        return orbitalPropagationService.propagate(input);
    }

    /*
     * ================================================================
     * BOUNDED PARALLEL PROPAGATION
     * ================================================================
     */
    private <T, R> List<R> propagateInParallel(
            List<T> items,
            Function<T, R> propagationFunction,
            Function<T, String> itemDescriptionFunction
    ) {

        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        List<R> results = new ArrayList<>(items.size());

        CompletionService<R> completionService =
                new ExecutorCompletionService<>(
                        bulkPropagationExecutor
                );

        int nextIndex = 0;
        int inFlight = 0;
        int failures = 0;

        /*
         * Initial bounded submission.
         */
        while (nextIndex < items.size()
                && inFlight < MAX_IN_FLIGHT_TASKS) {

            T item = items.get(nextIndex++);

            submitPropagationTask(
                    completionService,
                    item,
                    propagationFunction,
                    itemDescriptionFunction
            );

            inFlight++;
        }

        /*
         * Consume completed tasks and submit replacements.
         */
        while (inFlight > 0) {

            try {

                Future<R> future = completionService.take();

                inFlight--;

                R result = future.get();

                if (result != null) {
                    results.add(result);
                }

            } catch (InterruptedException exception) {

                Thread.currentThread().interrupt();

                throw new IllegalStateException(
                        "Bulk orbital propagation was interrupted.",
                        exception
                );

            } catch (ExecutionException exception) {

                failures++;

                Throwable cause = exception.getCause();

                log.debug(
                        "Bulk orbital propagation task failed: {}",
                        cause != null
                                ? cause.getMessage()
                                : exception.getMessage()
                );
            }

            if (nextIndex < items.size()) {

                T item = items.get(nextIndex++);

                submitPropagationTask(
                        completionService,
                        item,
                        propagationFunction,
                        itemDescriptionFunction
                );

                inFlight++;
            }
        }

        if (failures > 0) {

            log.warn(
                    "Bulk propagation completed with task failures. " +
                            "submitted={}, successful={}, failures={}",
                    items.size(),
                    results.size(),
                    failures
            );
        }

        return results;
    }

    /*
     * ================================================================
     * SUBMIT PROPAGATION TASK
     * ================================================================
     */
    private <T, R> void submitPropagationTask(
            CompletionService<R> completionService,
            T item,
            Function<T, R> propagationFunction,
            Function<T, String> itemDescriptionFunction
    ) {

        completionService.submit(
                () -> {

                    try {

                        return propagationFunction.apply(item);

                    } catch (RuntimeException exception) {

                        log.debug(
                                "Propagation failed for {}: {}",
                                itemDescriptionFunction.apply(item),
                                exception.getMessage()
                        );

                        throw exception;
                    }
                }
        );
    }

    /*
     * ================================================================
     * SATELLITE PROPAGATION DATA VALIDATION
     * ================================================================
     */
    private boolean hasRequiredSatellitePropagationData(
            Satellite satellite
    ) {

        if (satellite == null) {
            return false;
        }

        return satellite.getNoradCatalogId() != null
                && satellite.getNoradCatalogId() > 0;
    }

    /*
     * ================================================================
     * DEBRIS PROPAGATION DATA VALIDATION
     * ================================================================
     */
    private boolean hasRequiredDebrisPropagationData(
            SpaceDebris debris
    ) {

        if (debris == null) {
            return false;
        }

        return debris.getNoradId() != null
                && debris.getNoradId() > 0;
    }

    /*
     * ================================================================
     * SATELLITE NORAD VALIDATION
     * ================================================================
     */
    private void validateSatelliteNoradId(
            Integer noradCatalogId
    ) {

        if (noradCatalogId == null || noradCatalogId <= 0) {

            throw new IllegalArgumentException(
                    "Satellite NORAD catalog ID must be greater than zero."
            );
        }
    }

    /*
     * ================================================================
     * DEBRIS NORAD VALIDATION
     * ================================================================
     */
    private void validateDebrisNoradId(
            Long noradId
    ) {

        if (noradId == null || noradId <= 0) {

            throw new IllegalArgumentException(
                    "Debris NORAD ID must be greater than zero."
            );
        }
    }

    /*
     * ================================================================
     * TARGET TIME VALIDATION
     * ================================================================
     */
    private void validateTargetTime(
            LocalDateTime targetTime
    ) {

        if (targetTime == null) {

            throw new IllegalArgumentException(
                    "Target propagation time must not be null."
            );
        }
    }

    /*
     * ================================================================
     * ELAPSED TIME HELPER
     * ================================================================
     */
    private long elapsedMillis(
            long startNanos
    ) {

        return TimeUnit.NANOSECONDS.toMillis(
                System.nanoTime() - startNanos
        );
    }

    /*
     * ================================================================
     * EXECUTOR SHUTDOWN
     * ================================================================
     */
    @PreDestroy
    public void shutdownBulkPropagationExecutor() {

        log.info(
                "Shutting down orbital propagation executor."
        );

        bulkPropagationExecutor.shutdown();

        try {

            if (!bulkPropagationExecutor.awaitTermination(
                    10,
                    TimeUnit.SECONDS
            )) {

                log.warn(
                        "Orbital propagation executor did not " +
                                "terminate within 10 seconds. " +
                                "Forcing shutdown."
                );

                bulkPropagationExecutor.shutdownNow();
            }

        } catch (InterruptedException exception) {

            log.warn(
                    "Interrupted while shutting down orbital " +
                            "propagation executor.",
                    exception
            );

            bulkPropagationExecutor.shutdownNow();

            Thread.currentThread().interrupt();
        }
    }
}