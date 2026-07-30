package com.orbitguard.common.util;

import org.springframework.stereotype.Component;

@Component
public class OrbitalCalculator {

    /**
     * Calculates the closest approach distance between
     * a satellite and a debris object.
     *
     * Current Formula:
     * |Satellite Altitude - Debris Altitude|
     *
     * Future:
     * Can be replaced with
     * TLE / SGP4 / AI based calculation.
     *
     * @param satelliteAltitude Satellite altitude (km)
     * @param debrisAltitude Space debris altitude (km)
     * @return Closest approach distance (km)
     */
    public double calculateClosestDistance(
            Double satelliteAltitude,
            Double debrisAltitude
    ) {

        validateValue(satelliteAltitude, "Satellite altitude");
        validateValue(debrisAltitude, "Debris altitude");

        return Math.abs(satelliteAltitude - debrisAltitude);
    }

    /**
     * Calculates the relative velocity between
     * a satellite and debris.
     *
     * Current Formula:
     * |Satellite Velocity - Debris Velocity|
     *
     * @param satelliteVelocity Satellite velocity (km/s)
     * @param debrisVelocity Debris velocity (km/s)
     * @return Relative velocity (km/s)
     */
    public double calculateRelativeVelocity(
            Double satelliteVelocity,
            Double debrisVelocity
    ) {

        validateValue(satelliteVelocity, "Satellite velocity");
        validateValue(debrisVelocity, "Debris velocity");

        return Math.abs(satelliteVelocity - debrisVelocity);
    }

    /**
     * Validates orbital values.
     */
    private void validateValue(
            Double value,
            String fieldName
    ) {

        if (value == null) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be null."
            );
        }

        if (value < 0) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be negative."
            );
        }
    }

}