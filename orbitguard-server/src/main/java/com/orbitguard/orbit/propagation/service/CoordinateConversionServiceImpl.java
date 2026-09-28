package com.orbitguard.orbit.propagation.service;

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

@Service
public class CoordinateConversionServiceImpl
        implements CoordinateConversionService {

    private static final double KILOMETERS_TO_METERS = 1000.0;

    private static final String TEME_FRAME = "TEME";

    private final Frame temeFrame;

    private final Frame earthFixedFrame;

    private final OneAxisEllipsoid earth;

    /**
     * Initialize the Orekit reference frames and WGS84 Earth model.
     *
     * TEME:
     * True Equator Mean Equinox.
     *
     * ITRF:
     * International Terrestrial Reference Frame.
     *
     * The WGS84 ellipsoid is attached to the ITRF frame.
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
     * Convert propagated TEME Cartesian coordinates into
     * geodetic latitude, longitude and altitude.
     *
     * Expected input:
     *
     * Position:
     * kilometers
     *
     * Reference frame:
     * TEME
     *
     * Timestamp:
     * UTC-based LocalDateTime
     *
     * Output:
     *
     * Latitude:
     * degrees
     *
     * Longitude:
     * degrees
     *
     * Altitude:
     * kilometers
     */
    @Override
    public GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState) {

        validateInput(propagatedState);

        LocalDateTime timestamp =
                propagatedState.getTimestamp();

        AbsoluteDate date =
                toAbsoluteDate(timestamp);

        /*
         * OrbitalPropagationService stores position
         * in kilometers.
         *
         * Orekit uses SI units internally,
         * therefore convert kilometers -> meters.
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
         * Convert:
         *
         * TEME
         *   ↓
         * ITRF
         *
         * The transform is evaluated at the exact
         * propagation timestamp.
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
         * Convert Earth-fixed Cartesian coordinates
         * into WGS84 geodetic coordinates.
         *
         * Orekit returns:
         * latitude  -> radians
         * longitude -> radians
         * altitude  -> meters
         */
        GeodeticPoint geodeticPoint =
                earth.transform(
                        earthFixedPosition,
                        earthFixedFrame,
                        date
                );

        return GeodeticPosition.builder()

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
                                / KILOMETERS_TO_METERS
                )

                .build();
    }

    /**
     * Convert OrbitGuard LocalDateTime into Orekit AbsoluteDate.
     *
     * OrbitGuard currently represents orbital timestamps
     * using LocalDateTime, without a timezone component.
     *
     * Therefore this integration treats the value as UTC.
     */
    private AbsoluteDate toAbsoluteDate(
            LocalDateTime dateTime) {

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
     * Validate the propagated orbital state before
     * performing coordinate conversion.
     */
    private void validateInput(
            PropagatedOrbitalState propagatedState) {

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

        if (frame == null || frame.isBlank()) {

            throw new IllegalArgumentException(
                    "Reference frame must not be null or blank."
            );
        }

        if (!TEME_FRAME.equalsIgnoreCase(frame.trim())) {

            throw new IllegalArgumentException(
                    "Unsupported reference frame: "
                            + frame
                            + ". Expected TEME."
            );
        }
    }

    /**
     * Validate a Cartesian coordinate.
     *
     * Coordinates must:
     *
     * - not be null
     * - not be NaN
     * - not be infinite
     */
    private void validateFiniteCoordinate(
            Double value,
            String fieldName) {

        if (value == null) {

            throw new IllegalArgumentException(
                    fieldName + " must not be null."
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