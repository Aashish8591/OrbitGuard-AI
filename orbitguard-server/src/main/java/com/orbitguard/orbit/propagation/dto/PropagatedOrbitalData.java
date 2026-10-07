package com.orbitguard.orbit.propagation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * ============================================================================
 * OrbitGuard AI - Propagated Orbital Data
 * ============================================================================
 *
 * Internal application DTO containing the complete result of orbital
 * propagation and coordinate conversion for a single space object.
 *
 * <p>
 * This DTO is not an API response contract. It carries propagation results
 * between the orbital propagation layer and the visualization/application
 * layer.
 * </p>
 *
 * <p>
 * The source metadata is intentionally retained here so downstream services
 * do not need to query Satellite or SpaceDebris repositories again merely
 * to determine the object's name and type.
 * </p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropagatedOrbitalData {

    /**
     * Propagated position and velocity state.
     *
     * <p>
     * The propagated state is produced by the existing SGP4/Orekit
     * propagation engine and is represented in the TEME reference frame.
     * </p>
     */
    private PropagatedOrbitalState orbitalState;

    /**
     * Geodetic position derived from the propagated state.
     *
     * <p>
     * Contains latitude, longitude and altitude values suitable for
     * geographic positioning.
     * </p>
     */
    private GeodeticPosition geodeticPosition;

    /**
     * Earth-fixed Cartesian position derived from the propagated state.
     *
     * <p>
     * The coordinates are expressed in the ITRF Earth-fixed reference
     * frame and represented in kilometres. These coordinates are suitable
     * for placing objects correctly around the rotating 3D Earth.
     * </p>
     */
    private EarthFixedPosition earthFixedPosition;

    /**
     * Human-readable name of the source space object.
     *
     * <p>
     * This value comes from the Satellite or SpaceDebris entity loaded
     * during bulk propagation.
     * </p>
     */
    private String objectName;

    /**
     * Type of the source space object.
     *
     * <p>
     * Expected values are the existing visualization object types such as
     * {@code SATELLITE} and {@code DEBRIS}.
     * </p>
     */
    private String objectType;
}