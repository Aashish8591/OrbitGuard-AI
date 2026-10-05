package com.orbitguard.risk.util;

import org.springframework.stereotype.Component;

@Component
public class ProbabilityCalculator {

    /*
     * ------------------------------------------------------------------
     * Risk Probability Calculator
     * ------------------------------------------------------------------
     *
     * Current Version:
     * Rule-based heuristic algorithm.
     *
     * Future Version:
     * This component can be replaced by an AI / Machine Learning model
     * without changing the RiskAssessmentService layer.
     *
     * Important:
     * The returned value is a rule-based risk score expressed as a
     * percentage (0 - 100). It is not a physically validated collision
     * probability model.
     */

    private static final double DISTANCE_WEIGHT = 0.70;
    private static final double VELOCITY_WEIGHT = 0.30;

    private static final double MAX_PROBABILITY = 100.0;

    /**
     * Calculates a rule-based collision-risk score.
     *
     * @param closestApproachDistanceKm
     *        Distance between satellite and debris in kilometers.
     *
     * @param relativeVelocityKmPerSec
     *        Relative velocity between satellite and debris in km/s.
     *
     * @return rule-based risk score in percentage (0 - 100)
     */
    public double calculateProbability(
            double closestApproachDistanceKm,
            double relativeVelocityKmPerSec) {

        validateInputs(
                closestApproachDistanceKm,
                relativeVelocityKmPerSec
        );

        /*
         * --------------------------------------------------------------
         * Distance Score
         * --------------------------------------------------------------
         *
         * Smaller separation distance means greater collision risk.
         *
         * 0 km   -> 100
         * 5 km   -> 50
         * 10 km+ -> 0
         */
        double distanceScore =
                Math.max(
                        0.0,
                        MAX_PROBABILITY
                                - (closestApproachDistanceKm * 10.0)
                );

        /*
         * --------------------------------------------------------------
         * Velocity Score
         * --------------------------------------------------------------
         *
         * Higher relative velocity increases the severity of a
         * potential conjunction.
         *
         * The score is capped at 100.
         */
        double velocityScore =
                Math.min(
                        relativeVelocityKmPerSec * 10.0,
                        MAX_PROBABILITY
                );

        /*
         * --------------------------------------------------------------
         * Weighted Risk Score
         * --------------------------------------------------------------
         *
         * Distance  -> 70%
         * Velocity  -> 30%
         */
        double probability =
                (distanceScore * DISTANCE_WEIGHT)
                        + (velocityScore * VELOCITY_WEIGHT);

        /*
         * --------------------------------------------------------------
         * Final Boundary Protection
         * --------------------------------------------------------------
         */
        return Math.max(
                0.0,
                Math.min(
                        probability,
                        MAX_PROBABILITY
                )
        );
    }

    /**
     * Validates propagated orbital measurements before calculating
     * the rule-based risk score.
     */
    private void validateInputs(
            double closestApproachDistanceKm,
            double relativeVelocityKmPerSec) {

        if (!Double.isFinite(closestApproachDistanceKm)) {
            throw new IllegalArgumentException(
                    "Closest approach distance must be a finite value."
            );
        }

        if (!Double.isFinite(relativeVelocityKmPerSec)) {
            throw new IllegalArgumentException(
                    "Relative velocity must be a finite value."
            );
        }

        if (closestApproachDistanceKm < 0) {
            throw new IllegalArgumentException(
                    "Closest approach distance cannot be negative."
            );
        }

        if (relativeVelocityKmPerSec < 0) {
            throw new IllegalArgumentException(
                    "Relative velocity cannot be negative."
            );
        }
    }
}