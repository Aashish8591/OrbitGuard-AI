package com.orbitguard.visualization.constants;

/**
 * Centralized API constants for the 3D visualization module.
 *
 * <p>This class contains endpoint paths, object type identifiers,
 * and user-facing success messages used by the visualization APIs.</p>
 */
public final class VisualizationApiConstants {

    private VisualizationApiConstants() {
        // Utility class
    }

    /*
     * Base API path
     */
    public static final String BASE_PATH = "/api/visualization";

    /*
     * Object-specific API paths
     */
    public static final String SATELLITE_PATH = "/satellite";

    public static final String DEBRIS_PATH = "/debris";

    /*
     * Visualization object types
     */
    public static final String SATELLITE_OBJECT_TYPE = "SATELLITE";

    public static final String DEBRIS_OBJECT_TYPE = "DEBRIS";

    /*
     * Success messages
     */
    public static final String SATELLITE_POSITION_RETRIEVED =
            "Satellite visualization position retrieved successfully.";

    public static final String DEBRIS_POSITION_RETRIEVED =
            "Debris visualization position retrieved successfully.";
}