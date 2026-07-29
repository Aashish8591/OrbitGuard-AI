package com.orbitguard.debris.enums;

/**
 * Represents the category of a tracked space object.
 *
 * <p>
 * This enum is used to classify debris based on its origin.
 * It helps in filtering, searching, analytics, collision prediction,
 * and AI-based risk assessment.
 * </p>
 *
 * <p>
 * Using an enum instead of String provides:
 * <ul>
 *     <li>Type Safety</li>
 *     <li>Compile-time Validation</li>
 *     <li>Cleaner Business Logic</li>
 *     <li>Better Swagger Documentation</li>
 * </ul>
 * </p>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public enum ObjectType {

    /**
     * Small detached fragments generated from explosions,
     * collisions, or satellite breakups.
     */
    FRAGMENT,

    /**
     * Rocket stage or booster left in orbit after launch.
     */
    ROCKET_BODY,

    /**
     * Functional or non-functional satellite payload.
     */
    PAYLOAD,

    /**
     * Object whose category has not yet been identified.
     */
    UNKNOWN
}