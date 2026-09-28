package com.orbitguard.common.util;

import org.springframework.stereotype.Component;

@Component
public class OrbitalCalculator {

    /**
     * Calculates the 3D Euclidean distance between
     * two propagated orbital position vectors.
     *
     * Position unit: kilometers.
     *
     * Both vectors must be expressed in the same
     * reference frame and at the same timestamp.
     *
     * @return distance in kilometers
     */
    public double calculateDistance(
            Double satelliteX,
            Double satelliteY,
            Double satelliteZ,
            Double debrisX,
            Double debrisY,
            Double debrisZ
    ) {

        validateValue(satelliteX, "Satellite X");
        validateValue(satelliteY, "Satellite Y");
        validateValue(satelliteZ, "Satellite Z");

        validateValue(debrisX, "Debris X");
        validateValue(debrisY, "Debris Y");
        validateValue(debrisZ, "Debris Z");

        double deltaX = satelliteX - debrisX;
        double deltaY = satelliteY - debrisY;
        double deltaZ = satelliteZ - debrisZ;

        return Math.sqrt(
                deltaX * deltaX
                        + deltaY * deltaY
                        + deltaZ * deltaZ
        );
    }

    /**
     * Calculates relative velocity between
     * two propagated velocity vectors.
     *
     * Velocity unit: kilometers per second.
     *
     * Both vectors must be expressed in the same
     * reference frame and at the same timestamp.
     *
     * @return relative velocity in km/s
     */
    public double calculateRelativeVelocity(
            Double satelliteVx,
            Double satelliteVy,
            Double satelliteVz,
            Double debrisVx,
            Double debrisVy,
            Double debrisVz
    ) {

        validateValue(satelliteVx, "Satellite VX");
        validateValue(satelliteVy, "Satellite VY");
        validateValue(satelliteVz, "Satellite VZ");

        validateValue(debrisVx, "Debris VX");
        validateValue(debrisVy, "Debris VY");
        validateValue(debrisVz, "Debris VZ");

        double deltaVx = satelliteVx - debrisVx;
        double deltaVy = satelliteVy - debrisVy;
        double deltaVz = satelliteVz - debrisVz;

        return Math.sqrt(
                deltaVx * deltaVx
                        + deltaVy * deltaVy
                        + deltaVz * deltaVz
        );
    }

    /**
     * Calculates scalar speed from a propagated
     * velocity vector.
     *
     * Velocity unit: kilometers per second.
     *
     * @return speed in km/s
     */
    public double calculateSpeed(
            Double velocityX,
            Double velocityY,
            Double velocityZ
    ) {

        validateValue(velocityX, "Velocity X");
        validateValue(velocityY, "Velocity Y");
        validateValue(velocityZ, "Velocity Z");

        return Math.sqrt(
                velocityX * velocityX
                        + velocityY * velocityY
                        + velocityZ * velocityZ
        );
    }

    private void validateValue(
            Double value,
            String fieldName
    ) {

        if (value == null) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be null."
            );
        }

        if (!Double.isFinite(value)) {
            throw new IllegalArgumentException(
                    fieldName + " must be finite."
            );
        }
    }
}