package com.orbitguard.risk.util;

import com.orbitguard.risk.enums.RiskLevel;
import org.springframework.stereotype.Component;

@Component
public class RiskCalculator {

    /**
     * Determines the risk level based on
     * collision probability.
     *
     * Probability Range:
     *
     * 0  - 24.99  -> LOW
     * 25 - 49.99  -> MEDIUM
     * 50 - 74.99  -> HIGH
     * 75 - 100    -> CRITICAL
     *
     * @param collisionProbability probability in percentage (0-100)
     * @return RiskLevel
     */
    public RiskLevel calculateRiskLevel(double collisionProbability) {

        if (collisionProbability < 0 || collisionProbability > 100) {
            throw new IllegalArgumentException(
                    "Collision probability must be between 0 and 100."
            );
        }

        if (collisionProbability < 25) {
            return RiskLevel.LOW;
        }

        if (collisionProbability < 50) {
            return RiskLevel.MEDIUM;
        }

        if (collisionProbability < 75) {
            return RiskLevel.HIGH;
        }

        return RiskLevel.CRITICAL;
    }

    /**
     * Generates recommendation based on
     * calculated risk level.
     *
     * @param riskLevel calculated risk level
     * @return recommendation message
     */
    public String generateRecommendation(RiskLevel riskLevel) {

        if (riskLevel == null) {
            throw new IllegalArgumentException(
                    "Risk level cannot be null."
            );
        }

        return switch (riskLevel) {

            case LOW ->
                    "No immediate action required. Continue routine monitoring.";

            case MEDIUM ->
                    "Increase observation frequency and review orbital parameters.";

            case HIGH ->
                    "Plan collision avoidance procedures and closely monitor the object.";

            case CRITICAL ->
                    "Immediate action required. Execute collision avoidance maneuver and notify mission operators.";
        };
    }

}