package com.orbitguard.alert.util;

import com.orbitguard.alert.enums.AlertSeverity;
import com.orbitguard.risk.enums.RiskLevel;
import org.springframework.stereotype.Component;

/**
 * ==============================================================
 * Alert Priority Calculator
 * ==============================================================
 *
 * Responsible for converting a Collision Risk Level
 * into an Alert Severity.
 *
 * This utility keeps priority calculation separate
 * from the business logic contained in the service
 * layer.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class AlertPriorityCalculator {

    /**
     * ----------------------------------------------------------
     * Calculate Alert Severity
     * ----------------------------------------------------------
     *
     * Converts the Risk Module's RiskLevel into
     * an Alert Module AlertSeverity.
     *
     * Mapping:
     *
     * LOW      -> LOW
     * MEDIUM   -> MEDIUM
     * HIGH     -> HIGH
     * CRITICAL -> CRITICAL
     *
     * @param riskLevel Collision Risk Level
     * @return Alert Severity
     */
    public AlertSeverity calculateSeverity(RiskLevel riskLevel) {

        if (riskLevel == null) {
            throw new IllegalArgumentException(
                    "Risk level cannot be null."
            );
        }

        return switch (riskLevel) {

            case LOW -> AlertSeverity.LOW;

            case MEDIUM -> AlertSeverity.MEDIUM;

            case HIGH -> AlertSeverity.HIGH;

            case CRITICAL -> AlertSeverity.CRITICAL;
        };
    }

}