package com.orbitguard.alert.util;

import com.orbitguard.risk.enums.RiskLevel;
import org.springframework.stereotype.Component;

/**
 * ==============================================================
 * Alert Message Generator
 * ==============================================================
 *
 * Responsible for generating alert titles and
 * alert messages based on collision risk level.
 *
 * This class centralizes all alert message
 * templates, keeping business logic separate
 * from the service layer.
 *
 * Module : Alert Management
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class AlertMessageGenerator {

    /**
     * ----------------------------------------------------------
     * Generate Alert Title
     * ----------------------------------------------------------
     *
     * @param riskLevel Collision Risk Level
     * @return Alert Title
     */
    public String generateTitle(RiskLevel riskLevel) {

        if (riskLevel == null) {
            return "Collision Risk Alert";
        }

        return switch (riskLevel) {

            case LOW ->
                    "Low Collision Risk";

            case MEDIUM ->
                    "Medium Collision Risk";

            case HIGH ->
                    "High Collision Risk";

            case CRITICAL ->
                    "Critical Collision Risk";
        };
    }

    /**
     * ----------------------------------------------------------
     * Generate Alert Message
     * ----------------------------------------------------------
     *
     * @param riskLevel Collision Risk Level
     * @return Alert Message
     */
    public String generateMessage(RiskLevel riskLevel) {

        if (riskLevel == null) {
            return "Collision risk assessment has been generated.";
        }

        return switch (riskLevel) {

            case LOW ->
                    "Collision probability is low. Continue routine monitoring.";

            case MEDIUM ->
                    "Collision probability is moderate. Operator review is recommended.";

            case HIGH ->
                    "High collision probability detected. Immediate operational review is required.";

            case CRITICAL ->
                    "Critical collision probability detected. Immediate mitigation action is required.";
        };
    }

}