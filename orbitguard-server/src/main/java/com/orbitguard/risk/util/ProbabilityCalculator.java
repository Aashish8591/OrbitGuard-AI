package com.orbitguard.risk.util;

import org.springframework.stereotype.Component;

@Component
public class ProbabilityCalculator {

    /**
     * Calculates collision probability.
     *
     * Current Version:
     * Rule-based algorithm.
     *
     * Future Version:
     * Can be replaced with
     * AI / Machine Learning model
     * without changing the Service layer.
     *
     * @param closestApproachDistanceKm Minimum distance between satellite and debris.
     * @param relativeVelocityKmPerSec Relative velocity.
     * @return Collision probability in percentage (0 - 100).
     */
    public double calculateProbability(
            double closestApproachDistanceKm,
            double relativeVelocityKmPerSec
    ) {

        /*
         * Distance Score
         *
         * Smaller distance
         * = Higher probability
         */
        double distanceScore =
                Math.max(0, 100 - (closestApproachDistanceKm * 10));

        /*
         * Velocity Score
         *
         * Higher velocity
         * = Higher probability
         */
        double velocityScore =
                Math.min(relativeVelocityKmPerSec * 10, 100);

        /*
         * Weighted Average
         *
         * Distance : 70%
         * Velocity : 30%
         */
        double probability =
                (distanceScore * 0.70)
                        + (velocityScore * 0.30);

        /*
         * Keep value between
         * 0 and 100.
         */
        return Math.max(0, Math.min(probability, 100));
    }

}