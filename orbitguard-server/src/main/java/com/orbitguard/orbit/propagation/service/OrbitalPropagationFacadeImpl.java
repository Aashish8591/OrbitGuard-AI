
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
            LoggerFactory.getLogger(OrbitalPropagationFacadeImpl.class);

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
                Executors.newFixedThreadPool(BULK_PROPAGATION_THREADS);

        log.info(
                "Orbital propagation executor initialized. threads={}, maxInFlight={}",
                BULK_PROPAGATION_THREADS,
                MAX_IN_FLIGHT_TASKS
        );
    }

    // ================================================================
    // SINGLE SATELLITE PROPAGATION
    // ================================================================

    @Override
    public PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {
        validateSatelliteNoradId(noradCatalogId);
        validateTargetTime(targetTime);

        RuntimeException liveDataFailure = null;
        OrbitalPropagationInput liveInput = null;

        /*
         * Retrieve and map live data separately from propagation.
         * A propagation-engine failure must not be mistaken for a
         * CelesTrak connection failure.
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
                        "CelesTrak returned no usable orbital data for satellite NORAD ID: "
                                + noradCatalogId
                );
            } else {
                com.orbitguard.satellite.integration.celestrak.dto
                        .CelesTrakOrbitalData orbitalData =
                        orbitalDataList.get(0);

                liveInput =
                        satelliteOrbitalPropagationMapper.toPropagationInput(
                                orbitalData,
                                targetTime
                        );

                if (liveInput == null) {
                    liveDataFailure = new IllegalStateException(
                            "Failed to map CelesTrak orbital data for satellite NORAD ID: "
                                    + noradCatalogId
                    );
                }
            }
        } catch (RuntimeException exception) {
            liveDataFailure = exception;

            log.warn(
                    "Live satellite orbital-data retrieval or mapping failed for NORAD ID={}. "
                            + "Checking MongoDB fallback. Reason: {}",
                    noradCatalogId,
                    exception.getMessage()
            );
        }

        // Use live data if retrieval and mapping succeeded.
        if (liveInput != null) {
            log.debug(
                    "Using live CelesTrak orbital data for satellite NORAD ID={}",
                    noradCatalogId
            );

            return orbitalPropagationService.propagate(liveInput);
        }

        // Look up the cached satellite.
        final Satellite cachedSatellite;

        try {
            cachedSatellite = satelliteRepository
                    .findByNoradCatalogId(noradCatalogId)
                    .orElse(null);
        } catch (RuntimeException databaseException) {
            log.error(
                    "MongoDB lookup failed for satellite NORAD ID={}",
                    noradCatalogId,
                    databaseException
            );

            IllegalStateException failure = new IllegalStateException(
                    "Unable to retrieve cached satellite data from MongoDB for NORAD ID: "
                            + noradCatalogId,
                    databaseException
            );

            if (liveDataFailure != null) {
                failure.addSuppressed(liveDataFailure);
            }

            throw failure;
        }

        if (cachedSatellite == null) {
            IllegalStateException failure = new IllegalStateException(
                    "Satellite NORAD ID " + noradCatalogId
                            + " could not be propagated: live orbital data was unavailable "
                            + "and no matching MongoDB record was found."
            );

            if (liveDataFailure != null) {
                failure.initCause(liveDataFailure);
            }

            throw failure;
        }

        if (!hasCompleteCachedOrbitalElements(cachedSatellite)) {
            IllegalStateException failure = new IllegalStateException(
                    "Cached orbital elements are missing or invalid for satellite NORAD ID: "
                            + noradCatalogId
            );

            if (liveDataFailure != null) {
                failure.initCause(liveDataFailure);
            }

            throw failure;
        }

        OrbitalPropagationInput cachedInput =
                buildCachedSatellitePropagationInput(
                        cachedSatellite,
                        targetTime
                );

        log.warn(
                "Using cached MongoDB orbital elements for satellite NORAD ID={}. "
                        + "Live-data failure: {}",
                noradCatalogId,
                liveDataFailure != null
                        ? liveDataFailure.getMessage()
                        : "No usable live data returned"
        );

        // Do not catch propagation-engine failures here.
        return orbitalPropagationService.propagate(cachedInput);
    }

    private boolean hasCompleteCachedOrbitalElements(
            Satellite satellite
    ) {
        if (satellite == null
                || satellite.getNoradCatalogId() == null
                || satellite.getNoradCatalogId() <= 0
                || satellite.getEpoch() == null) {
            return false;
        }

        return isFinite(satellite.getMeanMotion())
                && satellite.getMeanMotion() > 0.0
                && isFinite(satellite.getEccentricity())
                && satellite.getEccentricity() >= 0.0
                && satellite.getEccentricity() < 1.0
                && isFinite(satellite.getInclination())
                && satellite.getInclination() >= 0.0
                && satellite.getInclination() <= 180.0
                && isFinite(satellite.getRightAscensionOfAscendingNode())
                && isFinite(satellite.getArgumentOfPericenter())
                && isFinite(satellite.getMeanAnomaly());
    }

    private OrbitalPropagationInput buildCachedSatellitePropagationInput(
            Satellite satellite,
            LocalDateTime targetTime
    ) {
        return OrbitalPropagationInput.builder()
                .noradCatalogId(satellite.getNoradCatalogId().longValue())
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
                .argumentOfPericenter(satellite.getArgumentOfPericenter())
                .meanAnomaly(satellite.getMeanAnomaly())
                .bstar(satellite.getBstar())
                .elementSetNumber(satellite.getElementSetNumber())
                .revolutionAtEpoch(
                        satellite.getRevolutionAtEpoch() == null
                                ? null
                                : satellite.getRevolutionAtEpoch().longValue()
                )
                .targetTime(targetTime)
                .build();
    }

    // ================================================================
    // SINGLE DEBRIS PROPAGATION
    // ================================================================

    @Override
    public PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime
    ) {
        validateDebrisNoradId(noradId);
        validateTargetTime(targetTime);

        RuntimeException liveDataFailure = null;
        OrbitalPropagationInput liveInput = null;

        /*
         * Step 1: Retrieve and map live orbital data.
         */
        try {
            CelesTrakOrbitalData orbitalData =
                    celesTrakDebrisService.fetchOrbitalData(noradId);

            if (orbitalData == null) {
                liveDataFailure = new IllegalStateException(
                        "CelesTrak returned no orbital data for debris NORAD ID: "
                                + noradId
                );
            } else {
                liveInput =
                        debrisOrbitalPropagationMapper.toPropagationInput(
                                orbitalData,
                                targetTime
                        );

                if (liveInput == null) {
                    liveDataFailure = new IllegalStateException(
                            "Failed to map CelesTrak orbital data for debris NORAD ID: "
                                    + noradId
                    );
                }
            }
        } catch (RuntimeException exception) {
            liveDataFailure = exception;

            log.warn(
                    "Live debris orbital-data retrieval or mapping failed for NORAD ID={}. "
                            + "Checking MongoDB fallback. Reason: {}",
                    noradId,
                    exception.getMessage()
            );
        }

        /*
         * Step 2: Use live data when available.
         * Propagation is outside the retrieval/mapping catch block.
         */
        if (liveInput != null) {
            log.debug(
                    "Using live CelesTrak orbital data for debris NORAD ID={}",
                    noradId
            );

            return orbitalPropagationService.propagate(liveInput);
        }

        /*
         * Step 3: Retrieve an active cached debris record.
         */
        final SpaceDebris cachedDebris;

        try {
            cachedDebris = debrisRepository
                    .findByNoradIdAndIsActiveTrue(noradId)
                    .orElse(null);
        } catch (RuntimeException databaseException) {
            log.error(
                    "MongoDB lookup failed for debris NORAD ID={}",
                    noradId,
                    databaseException
            );

            IllegalStateException failure = new IllegalStateException(
                    "Unable to retrieve cached debris data from MongoDB for NORAD ID: "
                            + noradId,
                    databaseException
            );

            if (liveDataFailure != null) {
                failure.addSuppressed(liveDataFailure);
            }

            throw failure;
        }

        if (cachedDebris == null) {
            IllegalStateException failure = new IllegalStateException(
                    "Debris NORAD ID " + noradId
                            + " could not be propagated: live orbital data was unavailable "
                            + "and no active MongoDB record was found."
            );

            if (liveDataFailure != null) {
                failure.initCause(liveDataFailure);
            }

            throw failure;
        }

        /*
         * Step 4: Validate cached orbital elements.
         */
        if (!hasCompleteCachedDebrisOrbitalElements(cachedDebris)) {
            IllegalStateException failure = new IllegalStateException(
                    "Cached orbital elements are missing or invalid for debris NORAD ID: "
                            + noradId
                            + ". Synchronize valid orbital elements before retrying."
            );

            if (liveDataFailure != null) {
                failure.initCause(liveDataFailure);
            }

            throw failure;
        }

        /*
         * Step 5: Build the existing propagation DTO from MongoDB.
         */
        OrbitalPropagationInput cachedInput =
                buildCachedDebrisPropagationInput(
                        cachedDebris,
                        targetTime
                );

        log.warn(
                "Using cached MongoDB orbital elements for debris NORAD ID={}. "
                        + "Live-data failure: {}",
                noradId,
                liveDataFailure != null
                        ? liveDataFailure.getMessage()
                        : "No usable live data returned"
        );

        /*
         * Step 6: Propagate using the existing engine.
         * Engine exceptions intentionally surface to the caller.
         */
        return orbitalPropagationService.propagate(cachedInput);
    }

    private boolean hasCompleteCachedDebrisOrbitalElements(
            SpaceDebris debris
    ) {
        if (debris == null
                || debris.getNoradId() == null
                || debris.getNoradId() <= 0
                || debris.getEpoch() == null) {
            return false;
        }

        return isFinite(debris.getMeanMotion())
                && debris.getMeanMotion() > 0.0
                && isFinite(debris.getEccentricity())
                && debris.getEccentricity() >= 0.0
                && debris.getEccentricity() < 1.0
                && isFinite(debris.getInclination())
                && debris.getInclination() >= 0.0
                && debris.getInclination() <= 180.0
                && isFinite(debris.getRightAscensionOfAscendingNode())
                && isFinite(debris.getArgumentOfPericenter())
                && isFinite(debris.getMeanAnomaly());
    }

    private OrbitalPropagationInput buildCachedDebrisPropagationInput(
            SpaceDebris debris,
            LocalDateTime targetTime
    ) {
        return OrbitalPropagationInput.builder()
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
    }

    private boolean isFinite(Double value) {
        return value != null && Double.isFinite(value);
    }

    // ================================================================
    // SINGLE PROPAGATION WITH POSITION
    // ================================================================

    @Override
    public PropagatedOrbitalData propagateSatelliteWithPosition(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {
        PropagatedOrbitalState orbitalState =
                propagateSatellite(noradCatalogId, targetTime);

        return buildPropagatedOrbitalData(
                orbitalState,
                null,
                null
        );
    }

    @Override
    public PropagatedOrbitalData propagateDebrisWithPosition(
            Long noradId,
            LocalDateTime targetTime
    ) {
        PropagatedOrbitalState orbitalState =
                propagateDebris(noradId, targetTime);

        return buildPropagatedOrbitalData(
                orbitalState,
                null,
                null
        );
    }

    // ================================================================
    // BULK PROPAGATION FOR 3D VISUALIZATION
    // ================================================================

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

        long databaseElapsedMillis = elapsedMillis(databaseStartNanos);

        log.info(
                "Bulk orbital data loaded from MongoDB. satellites={}, debris={}, elapsedMs={}",
                satellites.size(),
                debrisObjects.size(),
                databaseElapsedMillis
        );

        log.info(
                "Starting bulk orbital propagation. satellites={}, debris={}, total={}, "
                        + "targetTime={}, threads={}, maxInFlight={}",
                satellites.size(),
                debrisObjects.size(),
                satellites.size() + debrisObjects.size(),
                targetTime,
                BULK_PROPAGATION_THREADS,
                MAX_IN_FLIGHT_TASKS
        );

        long filteringStartNanos = System.nanoTime();

        List<Satellite> validSatellites =
                satellites.stream()
                        .filter(this::hasRequiredSatellitePropagationData)
                        .filter(this::hasCompleteCachedOrbitalElements)
                        .toList();

        List<SpaceDebris> validDebris =
                debrisObjects.stream()
                        .filter(this::hasRequiredDebrisPropagationData)
                        .filter(this::hasCompleteCachedDebrisOrbitalElements)
                        .toList();

        int skippedSatellites = satellites.size() - validSatellites.size();
        int skippedDebris = debrisObjects.size() - validDebris.size();

        long filteringElapsedMillis = elapsedMillis(filteringStartNanos);

        log.info(
                "Bulk propagation input filtering completed. validSatellites={}, validDebris={}, "
                        + "skippedSatellites={}, skippedDebris={}, elapsedMs={}",
                validSatellites.size(),
                validDebris.size(),
                skippedSatellites,
                skippedDebris,
                filteringElapsedMillis
        );

        long satelliteStartNanos = System.nanoTime();

        List<BulkPropagationContext> satelliteContexts =
                propagateInParallel(
                        validSatellites,
                        satellite -> propagateSatelliteWithMetadata(
                                satellite,
                                targetTime
                        ),
                        satellite -> "satellite NORAD "
                                + satellite.getNoradCatalogId()
                );

        long satelliteElapsedMillis = elapsedMillis(satelliteStartNanos);

        log.info(
                "Bulk satellite propagation completed. successful={}, submitted={}, elapsedMs={}",
                satelliteContexts.size(),
                validSatellites.size(),
                satelliteElapsedMillis
        );

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

        long debrisElapsedMillis = elapsedMillis(debrisStartNanos);

        log.info(
                "Bulk debris propagation completed. successful={}, submitted={}, elapsedMs={}",
                debrisContexts.size(),
                validDebris.size(),
                debrisElapsedMillis
        );

        long combineStartNanos = System.nanoTime();

        List<BulkPropagationContext> propagatedContexts =
                new ArrayList<>(
                        satelliteContexts.size() + debrisContexts.size()
                );

        propagatedContexts.addAll(satelliteContexts);
        propagatedContexts.addAll(debrisContexts);

        long combineElapsedMillis = elapsedMillis(combineStartNanos);

        long conversionStartNanos = System.nanoTime();

        List<PropagatedOrbitalData> results =
                new ArrayList<>(propagatedContexts.size());

        int conversionFailures = 0;

        for (BulkPropagationContext context : propagatedContexts) {
            if (context == null || context.getOrbitalState() == null) {
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

        long conversionElapsedMillis = elapsedMillis(conversionStartNanos);
        long totalElapsedMillis = elapsedMillis(totalStartNanos);

        long measuredPhaseMillis =
                databaseElapsedMillis
                        + filteringElapsedMillis
                        + satelliteElapsedMillis
                        + debrisElapsedMillis
                        + combineElapsedMillis
                        + conversionElapsedMillis;

        long unaccountedElapsedMillis =
                Math.max(0, totalElapsedMillis - measuredPhaseMillis);

        log.info(
                "Bulk orbital propagation completed. successfulPropagation={}, "
                        + "successfulVisualizationData={}, conversionFailures={}, "
                        + "databaseElapsedMs={}, filteringElapsedMs={}, "
                        + "satellitePropagationElapsedMs={}, debrisPropagationElapsedMs={}, "
                        + "combineElapsedMs={}, conversionElapsedMs={}, totalElapsedMs={}, "
                        + "unaccountedElapsedMs={}",
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

    // ================================================================
    // COORDINATE CONVERSION
    // ================================================================

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
                coordinateConversionService.convert(orbitalState);

        if (conversion == null) {
            throw new IllegalStateException(
                    "Coordinate conversion returned null for NORAD ID: "
                            + orbitalState.getNoradCatalogId()
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

    // ================================================================
    // BULK METADATA HELPERS
    // ================================================================

    private BulkPropagationContext propagateSatelliteWithMetadata(
            Satellite satellite,
            LocalDateTime targetTime
    ) {
        if (satellite == null) {
            throw new IllegalArgumentException("Satellite must not be null.");
        }

        PropagatedOrbitalState orbitalState =
                propagateSatelliteStateForBulk(satellite, targetTime);

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

    private BulkPropagationContext propagateDebrisWithMetadata(
            SpaceDebris debris,
            LocalDateTime targetTime
    ) {
        if (debris == null) {
            throw new IllegalArgumentException("Debris must not be null.");
        }

        PropagatedOrbitalState orbitalState =
                propagateDebrisStateForBulk(debris, targetTime);

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

    // ================================================================
    // BULK SATELLITE PROPAGATION
    // ================================================================

    private PropagatedOrbitalState propagateSatelliteStateForBulk(
            Satellite satellite,
            LocalDateTime targetTime
    ) {
        if (satellite == null) {
            throw new IllegalArgumentException("Satellite must not be null.");
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
                                satellite.getRevolutionAtEpoch() == null
                                        ? null
                                        : satellite.getRevolutionAtEpoch().longValue()
                        )
                        .targetTime(targetTime)
                        .build();

        return orbitalPropagationService.propagate(input);
    }

    // ================================================================
    // BULK DEBRIS PROPAGATION
    // ================================================================

    private PropagatedOrbitalState propagateDebrisStateForBulk(
            SpaceDebris debris,
            LocalDateTime targetTime
    ) {
        if (debris == null) {
            throw new IllegalArgumentException("Debris must not be null.");
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

    // ================================================================
    // BOUNDED PARALLEL PROPAGATION
    // ================================================================

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
                new ExecutorCompletionService<>(bulkPropagationExecutor);

        int nextIndex = 0;
        int inFlight = 0;
        int failures = 0;

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
                    "Bulk propagation completed with task failures. submitted={}, successful={}, failures={}",
                    items.size(),
                    results.size(),
                    failures
            );
        }

        return results;
    }

    private <T, R> void submitPropagationTask(
            CompletionService<R> completionService,
            T item,
            Function<T, R> propagationFunction,
            Function<T, String> itemDescriptionFunction
    ) {
        completionService.submit(() -> {
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
        });
    }

    // ================================================================
    // BULK INPUT FILTERS
    // ================================================================

    private boolean hasRequiredSatellitePropagationData(
            Satellite satellite
    ) {
        return satellite != null
                && satellite.getNoradCatalogId() != null
                && satellite.getNoradCatalogId() > 0;
    }

    private boolean hasRequiredDebrisPropagationData(
            SpaceDebris debris
    ) {
        return debris != null
                && debris.getNoradId() != null
                && debris.getNoradId() > 0;
    }

    // ================================================================
    // VALIDATION
    // ================================================================

    private void validateSatelliteNoradId(Integer noradCatalogId) {
        if (noradCatalogId == null || noradCatalogId <= 0) {
            throw new IllegalArgumentException(
                    "Satellite NORAD catalog ID must be greater than zero."
            );
        }
    }

    private void validateDebrisNoradId(Long noradId) {
        if (noradId == null || noradId <= 0) {
            throw new IllegalArgumentException(
                    "Debris NORAD ID must be greater than zero."
            );
        }
    }

    private void validateTargetTime(LocalDateTime targetTime) {
        if (targetTime == null) {
            throw new IllegalArgumentException(
                    "Target propagation time must not be null."
            );
        }
    }

    // ================================================================
    // TIMING
    // ================================================================

    private long elapsedMillis(long startNanos) {
        return TimeUnit.NANOSECONDS.toMillis(
                System.nanoTime() - startNanos
        );
    }

    // ================================================================
    // EXECUTOR SHUTDOWN
    // ================================================================

    @PreDestroy
    public void shutdownBulkPropagationExecutor() {
        log.info("Shutting down orbital propagation executor.");

        bulkPropagationExecutor.shutdown();

        try {
            if (!bulkPropagationExecutor.awaitTermination(
                    10,
                    TimeUnit.SECONDS
            )) {
                log.warn(
                        "Orbital propagation executor did not terminate within 10 seconds. "
                                + "Forcing shutdown."
                );

                bulkPropagationExecutor.shutdownNow();
            }
        } catch (InterruptedException exception) {
            log.warn(
                    "Interrupted while shutting down orbital propagation executor.",
                    exception
            );

            bulkPropagationExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
