package com.orbitguard.debris.enums;

/**
 * Represents the current tracking status of a space debris object.
 *
 * <p>
 * This enum is used throughout the Debris Module to maintain
 * type safety and avoid invalid status values.
 * </p>
 *
 * Future modules such as Collision Prediction and AI Risk Assessment
 * will use this status to determine whether a debris object should
 * participate in risk calculations.
 */
public enum DebrisStatus {

    /**
     * Debris is currently being tracked and considered active.
     */
    ACTIVE,

    /**
     * Debris has re-entered Earth's atmosphere or is no longer present.
     */
    DECAYED,

    /**
     * The object can no longer be reliably tracked.
     */
    LOST_TRACK
}