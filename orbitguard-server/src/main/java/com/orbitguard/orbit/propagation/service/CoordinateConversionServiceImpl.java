package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.CoordinateConversionResult;
import com.orbitguard.orbit.propagation.dto.EarthFixedPosition;
import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

import org.hipparchus.geometry.euclidean.threed.Vector3D;

import org.orekit.bodies.GeodeticPoint;
import org.orekit.bodies.OneAxisEllipsoid;
import org.orekit.frames.Frame;
import org.orekit.frames.FramesFactory;
import org.orekit.frames.Transform;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.Constants;
import org.orekit.utils.IERSConventions;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * ================================================================
 * OrbitGuard AI - Coordinate Conversion Service Implementation
 * ================================================================
 *
 * Converts propagated orbital coordinates from TEME into:
 *
 * 1. Earth-fixed ITRF Cartesian coordinates.
 * 2. WGS84 geodetic coordinates.
 *
 * ================================================================
 * PERFORMANCE DESIGN
 * ================================================================
 *
 * The bulk visualization pipeline requires both:
 *
 * - latitude / longitude / altitude
 * - X / Y / Z in ITRF
 *
 * The previous implementation calculated:
 *
 *     TEME -> ITRF
 *
 * separately for each method.
 *
 * Therefore one object could perform the same expensive frame
 * transformation twice.
 *
 * This implementation introduces:
 *
 *     convert(...)
 *
 * which performs:
 *
 *     TEME -> ITRF
 *
 * exactly once and derives both output representations from the
 * same Earth-fixed Vector3D.
 *
 * This is especially important for the OrbitGuard visualization
 * dataset containing tens of thousands of orbital objects.
 */
@Service
public class CoordinateConversionServiceImpl
        implements CoordinateConversionService {

    private static final double KILOMETERS_TO_METERS =
            1000.0;

    private static final double METERS_TO_KILOMETERS =
            0.001;

    private static final String TEME_FRAME =
            "TEME";

    private static final String ITRF_FRAME =
            "ITRF";

    private final Frame temeFrame;

    private final Frame earthFixedFrame;

    private final OneAxisEllipsoid earth;

    /**
     * ================================================================
     * CONSTRUCTOR
     * ================================================================
     *
     * Initializes Orekit reference frames and the WGS84 Earth model.
     */
    public CoordinateConversionServiceImpl() {

        try {

            this.temeFrame =
                    FramesFactory.getTEME();

            this.earthFixedFrame =
                    FramesFactory.getITRF(
                            IERSConventions.IERS_2010,
                            true
                    );

            this.earth =
                    new OneAxisEllipsoid(
                            Constants.WGS84_EARTH_EQUATORIAL_RADIUS,
                            Constants.WGS84_EARTH_FLATTENING,
                            earthFixedFrame
                    );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to initialize Orekit coordinate conversion.",
                    exception
            );
        }
    }

    /**
     * ================================================================
     * COMBINED CONVERSION
     * ================================================================
     *
     * Performs the complete conversion for one propagated object.
     *
     * IMPORTANT:
     *
     * TEME -> ITRF is executed exactly ONCE.
     *
     * The resulting Earth-fixed Vector3D is reused to calculate:
     *
     * 1. WGS84 geodetic coordinates.
     * 2. Earth-fixed Cartesian coordinates.
     */
    @Override
    public CoordinateConversionResult convert(
            PropagatedOrbitalState propagatedState
    ) {

        /*
         * ------------------------------------------------------------
         * VALIDATION
         * ------------------------------------------------------------
         */
        validateInput(
                propagatedState
        );

        /*
         * ------------------------------------------------------------
         * CREATE OREKIT DATE ONCE
         * ------------------------------------------------------------
         */
        AbsoluteDate date =
                toAbsoluteDate(
                        propagatedState.getTimestamp()
                );

        /*
         * ------------------------------------------------------------
         * TEME POSITION
         * ------------------------------------------------------------
         *
         * OrbitGuard stores position in kilometres.
         *
         * Orekit expects SI units, therefore convert:
         *
         * km -> metres
         */
        Vector3D temePosition =
                new Vector3D(
                        propagatedState.getPositionX()
                                * KILOMETERS_TO_METERS,

                        propagatedState.getPositionY()
                                * KILOMETERS_TO_METERS,

                        propagatedState.getPositionZ()
                                * KILOMETERS_TO_METERS
                );

        /*
         * ------------------------------------------------------------
         * TEME -> ITRF
         * ------------------------------------------------------------
         *
         * THIS IS THE IMPORTANT OPTIMIZATION.
         *
         * This transformation is executed exactly once.
         */
        Transform temeToEarthFixed =
                temeFrame.getTransformTo(
                        earthFixedFrame,
                        date
                );

        Vector3D earthFixedPosition =
                temeToEarthFixed.transformPosition(
                        temePosition
                );

        /*
         * ------------------------------------------------------------
         * WGS84 GEODETIC POSITION
         * ------------------------------------------------------------
         *
         * Reuse the SAME Earth-fixed position calculated above.
         *
         * No second TEME -> ITRF transformation is required.
         */
        GeodeticPoint geodeticPoint =
                earth.transform(
                        earthFixedPosition,
                        earthFixedFrame,
                        date
                );

        GeodeticPosition geodeticPosition =
                GeodeticPosition.builder()
                        .latitude(
                                Math.toDegrees(
                                        geodeticPoint.getLatitude()
                                )
                        )
                        .longitude(
                                Math.toDegrees(
                                        geodeticPoint.getLongitude()
                                )
                        )
                        .altitude(
                                geodeticPoint.getAltitude()
                                        * METERS_TO_KILOMETERS
                        )
                        .build();

        /*
         * ------------------------------------------------------------
         * EARTH-FIXED CARTESIAN POSITION
         * ------------------------------------------------------------
         *
         * Reuse the SAME Vector3D again.
         */
        EarthFixedPosition earthFixed =
                EarthFixedPosition.builder()
                        .xKm(
                                earthFixedPosition.getX()
                                        * METERS_TO_KILOMETERS
                        )
                        .yKm(
                                earthFixedPosition.getY()
                                        * METERS_TO_KILOMETERS
                        )
                        .zKm(
                                earthFixedPosition.getZ()
                                        * METERS_TO_KILOMETERS
                        )
                        .frame(
                                ITRF_FRAME
                        )
                        .build();

        /*
         * ------------------------------------------------------------
         * RETURN BOTH RESULTS
         * ------------------------------------------------------------
         */
        return CoordinateConversionResult.builder()
                .geodeticPosition(
                        geodeticPosition
                )
                .earthFixedPosition(
                        earthFixed
                )
                .build();
    }

    /**
     * ================================================================
     * GEODETIC COMPATIBILITY METHOD
     * ================================================================
     *
     * Existing modules may still call this method.
     *
     * New bulk visualization code should call convert(...).
     */
    @Override
    public GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState
    ) {

        return convert(
                propagatedState
        ).getGeodeticPosition();
    }

    /**
     * ================================================================
     * EARTH-FIXED COMPATIBILITY METHOD
     * ================================================================
     *
     * Existing modules may still call this method.
     *
     * New bulk visualization code should call convert(...).
     */
    @Override
    public EarthFixedPosition toEarthFixedPosition(
            PropagatedOrbitalState propagatedState
    ) {

        return convert(
                propagatedState
        ).getEarthFixedPosition();
    }

    /**
     * ================================================================
     * LOCAL DATE TIME -> OREKIT ABSOLUTE DATE
     * ================================================================
     *
     * OrbitGuard treats orbital timestamps as UTC.
     */
    private AbsoluteDate toAbsoluteDate(
            LocalDateTime dateTime
    ) {

        if (dateTime == null) {

            throw new IllegalArgumentException(
                    "Date-time must not be null."
            );
        }

        double second =
                dateTime.getSecond()
                        + dateTime.getNano()
                        / 1_000_000_000.0;

        return new AbsoluteDate(
                dateTime.getYear(),
                dateTime.getMonthValue(),
                dateTime.getDayOfMonth(),
                dateTime.getHour(),
                dateTime.getMinute(),
                second,
                TimeScalesFactory.getUTC()
        );
    }

    /**
     * ================================================================
     * INPUT VALIDATION
     * ================================================================
     */
    private void validateInput(
            PropagatedOrbitalState propagatedState
    ) {

        if (propagatedState == null) {

            throw new IllegalArgumentException(
                    "Propagated orbital state must not be null."
            );
        }

        if (propagatedState.getTimestamp() == null) {

            throw new IllegalArgumentException(
                    "Propagation timestamp must not be null."
            );
        }

        validateFiniteCoordinate(
                propagatedState.getPositionX(),
                "Position X"
        );

        validateFiniteCoordinate(
                propagatedState.getPositionY(),
                "Position Y"
        );

        validateFiniteCoordinate(
                propagatedState.getPositionZ(),
                "Position Z"
        );

        String frame =
                propagatedState.getFrame();

        if (frame == null
                || frame.isBlank()) {

            throw new IllegalArgumentException(
                    "Reference frame must not be null or blank."
            );
        }

        if (!TEME_FRAME.equalsIgnoreCase(
                frame.trim()
        )) {

            throw new IllegalArgumentException(
                    "Unsupported reference frame: "
                            + frame
                            + ". Expected TEME."
            );
        }
    }

    /**
     * ================================================================
     * FINITE COORDINATE VALIDATION
     * ================================================================
     */
    private void validateFiniteCoordinate(
            Double value,
            String fieldName
    ) {

        if (value == null) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must not be null."
            );
        }

        if (!Double.isFinite(value)) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be a finite number."
            );
        }
    }
}