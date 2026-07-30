package com.orbitguard.debris.constants;

/**
 * API endpoint constants for the Debris module.
 *
 * Keeping endpoint URLs in one place improves
 * maintainability and avoids hardcoded strings.
 */
public final class DebrisApiConstants {

    private DebrisApiConstants() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated."
        );
    }

    /**
     * Base API URL for the Debris module.
     */
    public static final String BASE_URL = "/api/v1/debris";
}