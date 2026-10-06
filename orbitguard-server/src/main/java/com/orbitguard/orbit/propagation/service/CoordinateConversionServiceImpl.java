package com.orbitguard.orbit.propagation.service;

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
 * Converts propagated orbital coordinates between orbital and
 * Earth-referenced coordinate systems.
 *
 * <p>
 * The orbital propagation engine produces Cartesian coordinates
 * in the TEME reference frame. This service converts those
 * coordinates into the Earth-fixed ITRF frame and then derives
 * WGS84 geodetic coordinates.
 * </p>
 *
 * <p>
 * The conversion is performed using Orekit at the exact propagation
 * timestamp.
 * </p>
 */
@Service
public class CoordinateConversionServiceImpl
        implements CoordinateConversionService {

    private static final double KILOMETERS_TO_METERS = 1000.0;

    private static final double METERS_TO_KILOMETERS = 0.001;

    private static final String TEME_FRAME = "TEME";

    private static final String ITRF_FRAME = "ITRF";

    private final Frame temeFrame;

    private final Frame earthFixedFrame;

    private final OneAxisEllipsoid earth;

    /**
     * Initializes the Orekit reference frames and WGS84 Earth model.
     *
     * <p>
     * TEME:
     * True Equator Mean Equinox.
     * </p>
     *
     * <p>
     * ITRF:
     * International Terrestrial Reference Frame.
     * </p>
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
     * Converts a propagated TEME Cartesian position into
     * WGS84 geodetic coordinates.
     *
     * <p>
     * Input position:
     * kilometres, TEME.
     * </p>
     *
     * <p>
     * Output:
     * latitude and longitude in degrees,
     * altitude in kilometres.
     * </p>
     *
     * @param propagatedState propagated orbital state in TEME
     * @return WGS84 geodetic position
     */
    @Override
    public GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState
    ) {

        validateInput(propagatedState);

        AbsoluteDate date =
                toAbsoluteDate(
                        propagatedState.getTimestamp()
                );

        Vector3D earthFixedPosition =
                convertTemeToEarthFixed(
                        propagatedState,
                        date
                );

        /*
         * Convert the Earth-fixed Cartesian coordinates into
         * WGS84 geodetic coordinates.
         *
         * Orekit returns:
         *
         * latitude  -> radians
         * longitude -> radians
         * altitude  -> metres
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
                                * METERS_TO_KILOMETERS
                )
                .build();
    }

    /**
     * Converts a propagated TEME Cartesian position into
     * Earth-fixed ITRF Cartesian coordinates.
     *
     * <p>
     * This method is specifically required by the 3D Earth
     * visualization. Three.js must receive Earth-fixed
     * coordinates rather than raw TEME coordinates.
     * </p>
     *
     * <p>
     * Returned coordinates are expressed in kilometres.
     * </p>
     *
     * @param propagatedState propagated orbital state in TEME
     * @return Earth-fixed ITRF Cartesian position in kilometres
     */
    @Override
    public EarthFixedPosition toEarthFixedPosition(
            PropagatedOrbitalState propagatedState
    ) {

        validateInput(propagatedState);

        AbsoluteDate date =
                toAbsoluteDate(
                        propagatedState.getTimestamp()
                );

        Vector3D earthFixedPosition =
                convertTemeToEarthFixed(
                        propagatedState,
                        date
                );

        return EarthFixedPosition.builder()
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
                .frame(ITRF_FRAME)
                .build();
    }

    /**
     * Performs the actual TEME -> ITRF transformation.
     *
     * <p>
     * This method is shared by both geodetic and Earth-fixed
     * coordinate conversion so that the transformation logic
     * exists in exactly one place.
     * </p>
     */
    private Vector3D convertTemeToEarthFixed(
            PropagatedOrbitalState propagatedState,
            AbsoluteDate date
    ) {

        /*
         * OrbitalPropagationService stores position in kilometres,
         * while Orekit operates internally using SI units.
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
         * Transform:
         *
         * TEME
         *   ↓
         * ITRF
         *
         * The transformation is evaluated at the exact
         * propagation timestamp.
         */
        Transform temeToEarthFixed =
                temeFrame.getTransformTo(
                        earthFixedFrame,
                        date
                );

        return temeToEarthFixed.transformPosition(
                temePosition
        );
    }

    /**
     * Converts OrbitGuard LocalDateTime into Orekit AbsoluteDate.
     *
     * <p>
     * LocalDateTime does not contain timezone information, so
     * OrbitGuard treats orbital timestamps as UTC.
     * </p>
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
     * Validates the propagated orbital state before performing
     * coordinate conversion.
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
     * Validates a Cartesian coordinate.
     *
     * <p>
     * Coordinates must not be null, NaN, or infinite.
     * </p>
     */
    private void validateFiniteCoordinate(
            Double value,
            String fieldName
    ) {

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