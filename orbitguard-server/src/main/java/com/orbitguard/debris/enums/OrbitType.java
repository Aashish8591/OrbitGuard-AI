package com.orbitguard.debris.enums;

/**
 * Represents the orbital region in which a space debris object is located.
 *
 * <p>
 * Orbit classification is an important parameter used for:
 * <ul>
 *     <li>Debris Management</li>
 *     <li>Searching & Filtering</li>
 *     <li>Collision Prediction</li>
 *     <li>Orbit Analytics</li>
 *     <li>AI Risk Assessment</li>
 * </ul>
 * </p>
 *
 * Using an enum instead of String provides:
 * <ul>
 *     <li>Type Safety</li>
 *     <li>Compile-time Validation</li>
 *     <li>Better Readability</li>
 *     <li>Cleaner Business Logic</li>
 * </ul>
 *
 * @author OrbitGuard AI Team
 * @version 1.0
 */
public enum OrbitType {

    /**
     * Low Earth Orbit
     * (160 km - 2,000 km)
     */
    LEO,

    /**
     * Medium Earth Orbit
     * (2,000 km - 35,786 km)
     */
    MEO,

    /**
     * Geostationary Earth Orbit
     * (~35,786 km)
     */
    GEO,

    /**
     * Highly Elliptical Orbit
     */
    HEO
}