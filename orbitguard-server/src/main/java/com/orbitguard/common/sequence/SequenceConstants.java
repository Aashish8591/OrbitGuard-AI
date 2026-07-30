package com.orbitguard.common.sequence;

/**
 * Stores all MongoDB sequence names used
 * throughout the OrbitGuard AI project.
 *
 * <p>
 * Each module should use these constants
 * instead of hardcoded sequence names.
 * </p>
 *
 * Example:
 * <pre>
 * sequenceGeneratorService.getNextSequence(
 *         SequenceConstants.DEBRIS_SEQUENCE);
 * </pre>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public final class SequenceConstants {

    /**
     * Prevent object creation.
     */
    private SequenceConstants() {
        throw new UnsupportedOperationException(
                "Utility class cannot be instantiated."
        );
    }

    /**
     * Sequence for Space Debris.
     */
    public static final String DEBRIS_SEQUENCE = "debris_sequence";

    /**
     * Sequence for Satellites.
     */
    public static final String SATELLITE_SEQUENCE = "satellite_sequence";

    /**
     * Sequence for Alerts.
     */
    public static final String ALERT_SEQUENCE = "alert_sequence";

    /**
     * Sequence for Reports.
     */
    public static final String REPORT_SEQUENCE = "report_sequence";

    /**
     * Sequence for Users.
     */
    public static final String USER_SEQUENCE = "user_sequence";

    /**
     * Sequence for Collision Risks.
     */
    public static final String RISK_SEQUENCE = "risk_sequence";

}