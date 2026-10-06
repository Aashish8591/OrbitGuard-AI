package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Application facade for orbital propagation.
 *
 * <p>
 * This facade provides a stable entry point to the existing orbital
 * propagation infrastructure. It keeps the visualization and other
 * application modules independent from the underlying SGP4/Orekit
 * implementation.
 * </p>
 *
 * <p>
 * Both individual-object and bulk propagation operations are supported.
 * The bulk operation is intended for the 3D Earth visualization and
 * must operate on orbital data already available in the application's
 * database rather than making one external CelesTrak request per object.
 * </p>
 */
public interface OrbitalPropagationFacade {

    /**
     * Propagates a single satellite to the requested target time.
     *
     * @param noradCatalogId NORAD catalog ID of the satellite
     * @param targetTime     UTC target propagation time
     * @return propagated orbital state in the propagation frame
     */
    PropagatedOrbitalState propagateSatellite(
            Integer noradCatalogId,
            LocalDateTime targetTime
    );

    /**
     * Propagates a single debris object to the requested target time.
     *
     * @param noradId    NORAD ID of the debris object
     * @param targetTime UTC target propagation time
     * @return propagated orbital state in the propagation frame
     */
    PropagatedOrbitalState propagateDebris(
            Long noradId,
            LocalDateTime targetTime
    );

    /**
     * Propagates a single satellite and converts its propagated state
     * into position information suitable for visualization.
     *
     * @param noradCatalogId NORAD catalog ID of the satellite
     * @param targetTime     UTC target propagation time
     * @return propagated orbital data containing orbital and position data
     */
    PropagatedOrbitalData propagateSatelliteWithPosition(
            Integer noradCatalogId,
            LocalDateTime targetTime
    );

    /**
     * Propagates a single debris object and converts its propagated state
     * into position information suitable for visualization.
     *
     * @param noradId    NORAD ID of the debris object
     * @param targetTime UTC target propagation time
     * @return propagated orbital data containing orbital and position data
     */
    PropagatedOrbitalData propagateDebrisWithPosition(
            Long noradId,
            LocalDateTime targetTime
    );

    /**
     * Propagates all active satellites and debris objects required by
     * the 3D visualization.
     *
     * <p>
     * The implementation is responsible for obtaining the orbital
     * elements from the application's existing data source and passing
     * them through the existing SGP4/Orekit propagation pipeline.
     * </p>
     *
     * <p>
     * The returned list contains propagated orbital and position data
     * for the objects that could be successfully propagated.
     * </p>
     *
     * @param targetTime UTC target propagation time
     * @return propagated orbital data for all successfully processed
     *         visualization objects
     */
    List<PropagatedOrbitalData> propagateAllWithPosition(
            LocalDateTime targetTime
    );
}