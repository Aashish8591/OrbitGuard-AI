package com.orbitguard.common.util;

import org.springframework.stereotype.Component;

/**
 * Utility class responsible for generating
 * standardized business codes.
 *
 * Examples:
 * SAT-000001
 * DEB-000001
 * ALT-000001
 * RPT-000001
 *
 * This class only formats business codes.
 * It does NOT determine the next sequence number.
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
@Component
public class BusinessCodeGenerator {

    /**
     * Generates a formatted business code.
     *
     * Example:
     * prefix = "DEB"
     * sequence = 15
     *
     * Result:
     * DEB-000015
     *
     * @param prefix business prefix
     * @param sequence sequence number
     * @return formatted business code
     */
    public String generate(String prefix, long sequence) {

        if (prefix == null || prefix.isBlank()) {
            throw new IllegalArgumentException("Prefix must not be null or blank.");
        }

        if (sequence <= 0) {
            throw new IllegalArgumentException("Sequence must be greater than zero.");
        }

        return String.format("%s-%06d",
                prefix.trim().toUpperCase(),
                sequence);
    }

}