package com.orbitguard.orbit.propagation.mapper;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Maps debris orbital data into the common
 * orbital propagation input model.
 *
 * <p>
 * This mapper is responsible only for converting
 * stored/CelesTrak orbital elements into the input
 * required by the SGP4 propagation layer.
 * </p>
 *
 * <p>
 * Altitude and velocity are NOT calculated here.
 * They are derived from the propagated orbital state.
 * </p>
 */
@Component
public class DebrisOrbitalPropagationMapper {

    /**
     * Converts debris orbital data into an
     * OrbitalPropagationInput.
     *
     * @param orbitalData debris orbital data
     * @param targetTime target propagation time
     * @return propagation input
     */
    public OrbitalPropagationInput toPropagationInput(
            CelesTrakOrbitalData orbitalData,
            LocalDateTime targetTime) {

        if (orbitalData == null) {
            throw new IllegalArgumentException(
                    "Debris orbital data must not be null"
            );
        }

        if (targetTime == null) {
            throw new IllegalArgumentException(
                    "Target propagation time must not be null"
            );
        }

        return OrbitalPropagationInput.builder()

                /*
                 * ------------------------------------------
                 * Object identity
                 * ------------------------------------------
                 */

                .noradCatalogId(
                        orbitalData.getNoradCatalogId()
                )

                .objectId(
                        orbitalData.getObjectId()
                )

                .classificationType(
                        orbitalData.getClassificationType()
                )

                .ephemerisType(
                        orbitalData.getEphemerisType()
                )

                /*
                 * ------------------------------------------
                 * Epoch
                 * ------------------------------------------
                 */

                .epoch(
                        orbitalData.getEpoch()
                )

                /*
                 * ------------------------------------------
                 * TLE / SGP4 orbital elements
                 * ------------------------------------------
                 */

                .meanMotion(
                        orbitalData.getMeanMotion()
                )

                .meanMotionDot(
                        orbitalData.getMeanMotionDot()
                )

                .meanMotionDdot(
                        orbitalData.getMeanMotionDdot()
                )

                .eccentricity(
                        orbitalData.getEccentricity()
                )

                .inclination(
                        orbitalData.getInclination()
                )

                .rightAscensionOfAscendingNode(
                        orbitalData.getRightAscensionOfAscendingNode()
                )

                .argumentOfPericenter(
                        orbitalData.getArgumentOfPericenter()
                )

                .meanAnomaly(
                        orbitalData.getMeanAnomaly()
                )

                .bstar(
                        orbitalData.getBstar()
                )

                .elementSetNumber(
                        orbitalData.getElementSetNumber()
                )

                .revolutionAtEpoch(
                        orbitalData.getRevolutionAtEpoch()
                )

                /*
                 * ------------------------------------------
                 * Propagation target
                 * ------------------------------------------
                 */

                .targetTime(targetTime)

                .build();
    }
}