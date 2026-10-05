package com.orbitguard.orbit.propagation.service;

import com.orbitguard.orbit.propagation.dto.OrbitalPropagationInput;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalState;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.propagation.analytical.tle.TLE;
import org.orekit.propagation.analytical.tle.TLEPropagator;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.PVCoordinates;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OrbitalPropagationServiceImpl
        implements OrbitalPropagationService {

    private static final double SECONDS_PER_DAY = 86_400.0;

    private static final double TWO_PI = 2.0 * Math.PI;

    /**
     * Orekit returns position and velocity in SI units:
     *
     * Position  -> meters
     * Velocity  -> meters/second
     *
     * OrbitGuard propagation contract uses:
     *
     * Position  -> kilometers
     * Velocity  -> kilometers/second
     */
    private static final double METERS_TO_KILOMETERS = 1.0 / 1000.0;

    /**
     * WGS-84 Earth equatorial radius.
     *
     * Used for the current geocentric altitude calculation.
     *
     * Unit: kilometers.
     *
     * Note:
     * This is intentionally kept here as a simple derived
     * altitude value. Geodetic latitude/longitude/altitude
     * conversion remains the responsibility of
     * CoordinateConversionService.
     */
    private static final double EARTH_RADIUS_KM = 6378.137;

    /**
     * Reference frame returned by TLE/SGP4 propagation.
     */
    private static final String PROPAGATION_FRAME = "TEME";

    /**
     * International designator format:
     *
     * YYYY-NNNPPP
     *
     * Examples:
     *
     * 1998-067A
     * 2024-001AB
     */
    private static final Pattern OBJECT_ID_PATTERN =
            Pattern.compile(
                    "^(\\d{4})-(\\d{3})([A-Z0-9]{1,3})$"
            );

    @Override
    public PropagatedOrbitalState propagate(
            OrbitalPropagationInput input) {

        validateInput(input);

        /*
         * --------------------------------------------------
         * BUILD TLE
         * --------------------------------------------------
         *
         * Convert OrbitGuard's normalized orbital data
         * into an Orekit TLE.
         */
        TLE tle = buildTle(input);

        /*
         * --------------------------------------------------
         * CREATE SGP4 PROPAGATOR
         * --------------------------------------------------
         */
        TLEPropagator propagator =
                TLEPropagator.selectExtrapolator(tle);

        /*
         * --------------------------------------------------
         * TARGET TIME
         * --------------------------------------------------
         *
         * OrbitGuard currently uses LocalDateTime.
         * The propagation contract treats this value as UTC.
         */
        AbsoluteDate targetDate =
                toAbsoluteDate(input.getTargetTime());

        /*
         * --------------------------------------------------
         * PROPAGATE
         * --------------------------------------------------
         */
        PVCoordinates pvCoordinates =
                propagator.getPVCoordinates(targetDate);

        if (pvCoordinates == null) {
            throw new IllegalStateException(
                    "Orekit returned null PV coordinates for NORAD "
                            + input.getNoradCatalogId()
                            + " at "
                            + input.getTargetTime()
            );
        }

        Vector3D position =
                pvCoordinates.getPosition();

        Vector3D velocity =
                pvCoordinates.getVelocity();

        if (position == null || velocity == null) {
            throw new IllegalStateException(
                    "Orekit returned incomplete position/velocity "
                            + "data for NORAD "
                            + input.getNoradCatalogId()
            );
        }

        /*
         * --------------------------------------------------
         * POSITION
         * --------------------------------------------------
         *
         * Orekit:
         * meters
         *
         * OrbitGuard:
         * kilometers
         */
        double positionX =
                position.getX()
                        * METERS_TO_KILOMETERS;

        double positionY =
                position.getY()
                        * METERS_TO_KILOMETERS;

        double positionZ =
                position.getZ()
                        * METERS_TO_KILOMETERS;

        /*
         * --------------------------------------------------
         * VELOCITY COMPONENTS
         * --------------------------------------------------
         *
         * Orekit:
         * meters/second
         *
         * OrbitGuard:
         * kilometers/second
         */
        double velocityX =
                velocity.getX()
                        * METERS_TO_KILOMETERS;

        double velocityY =
                velocity.getY()
                        * METERS_TO_KILOMETERS;

        double velocityZ =
                velocity.getZ()
                        * METERS_TO_KILOMETERS;

        /*
         * Validate the converted state before returning it.
         *
         * This prevents invalid numerical values from reaching
         * the Risk Module.
         */
        validateFinitePropagationValue(
                positionX,
                "Position X"
        );

        validateFinitePropagationValue(
                positionY,
                "Position Y"
        );

        validateFinitePropagationValue(
                positionZ,
                "Position Z"
        );

        validateFinitePropagationValue(
                velocityX,
                "Velocity X"
        );

        validateFinitePropagationValue(
                velocityY,
                "Velocity Y"
        );

        validateFinitePropagationValue(
                velocityZ,
                "Velocity Z"
        );

        /*
         * --------------------------------------------------
         * VELOCITY MAGNITUDE
         * --------------------------------------------------
         *
         * V = sqrt(Vx² + Vy² + Vz²)
         *
         * Unit:
         * km/s
         */
        double velocityMagnitude =
                Math.sqrt(
                        velocityX * velocityX
                                + velocityY * velocityY
                                + velocityZ * velocityZ
                );

        validateFinitePropagationValue(
                velocityMagnitude,
                "Velocity magnitude"
        );

        /*
         * --------------------------------------------------
         * GEOCENTRIC ALTITUDE
         * --------------------------------------------------
         *
         * Distance from Earth's center:
         *
         * R = sqrt(X² + Y² + Z²)
         *
         * Geocentric altitude:
         *
         * altitude = R - Earth radius
         *
         * Unit:
         * kilometers
         */
        double distanceFromEarthCenter =
                Math.sqrt(
                        positionX * positionX
                                + positionY * positionY
                                + positionZ * positionZ
                );

        validateFinitePropagationValue(
                distanceFromEarthCenter,
                "Distance from Earth center"
        );

        double altitude =
                distanceFromEarthCenter
                        - EARTH_RADIUS_KM;

        validateFinitePropagationValue(
                altitude,
                "Altitude"
        );

        /*
         * --------------------------------------------------
         * BUILD PROPAGATED STATE
         * --------------------------------------------------
         */
        return PropagatedOrbitalState.builder()

                .noradCatalogId(
                        input.getNoradCatalogId()
                )

                .timestamp(
                        input.getTargetTime()
                )

                /*
                 * Position components
                 */
                .positionX(positionX)
                .positionY(positionY)
                .positionZ(positionZ)

                /*
                 * Velocity components
                 */
                .velocityX(velocityX)
                .velocityY(velocityY)
                .velocityZ(velocityZ)

                /*
                 * Derived values
                 */
                .velocity(velocityMagnitude)
                .altitude(altitude)

                /*
                 * TLE propagation reference frame
                 */
                .frame(PROPAGATION_FRAME)

                .build();
    }

    /**
     * Builds an Orekit TLE from OrbitGuard's
     * normalized orbital propagation input.
     */
    private TLE buildTle(
            OrbitalPropagationInput input) {

        ObjectIdParts objectIdParts =
                parseObjectId(input.getObjectId());

        AbsoluteDate epoch =
                toAbsoluteDate(input.getEpoch());

        int satelliteNumber =
                Math.toIntExact(
                        input.getNoradCatalogId()
                );

        int elementSetNumber =
                input.getElementSetNumber();

        int revolutionAtEpoch =
                Math.toIntExact(
                        input.getRevolutionAtEpoch()
                );

        /*
         * --------------------------------------------------
         * MEAN MOTION
         * --------------------------------------------------
         *
         * Input:
         * revolutions/day
         *
         * Orekit:
         * radians/second
         */
        double meanMotion =
                revolutionsPerDayToRadiansPerSecond(
                        input.getMeanMotion()
                );

        /*
         * --------------------------------------------------
         * MEAN MOTION FIRST DERIVATIVE
         * --------------------------------------------------
         *
         * Input:
         * revolutions/day²
         *
         * Orekit:
         * radians/second²
         */
        double meanMotionDot =
                revolutionsPerDaySquaredToRadiansPerSecondSquared(
                        input.getMeanMotionDot()
                );

        /*
         * --------------------------------------------------
         * MEAN MOTION SECOND DERIVATIVE
         * --------------------------------------------------
         *
         * Input:
         * revolutions/day³
         *
         * Orekit:
         * radians/second³
         */
        double meanMotionDdot =
                revolutionsPerDayCubedToRadiansPerSecondCubed(
                        input.getMeanMotionDdot()
                );

        validateFinitePropagationValue(
                meanMotion,
                "Converted mean motion"
        );

        validateFinitePropagationValue(
                meanMotionDot,
                "Converted mean motion first derivative"
        );

        validateFinitePropagationValue(
                meanMotionDdot,
                "Converted mean motion second derivative"
        );

        /*
         * Convert angular values from degrees
         * into radians for Orekit.
         */
        double inclination =
                Math.toRadians(
                        input.getInclination()
                );

        double rightAscensionOfAscendingNode =
                Math.toRadians(
                        input.getRightAscensionOfAscendingNode()
                );

        double argumentOfPericenter =
                Math.toRadians(
                        input.getArgumentOfPericenter()
                );

        double meanAnomaly =
                Math.toRadians(
                        input.getMeanAnomaly()
                );

        /*
         * Classification has already been validated,
         * but keep the conversion local and explicit.
         */
        String classificationType =
                input.getClassificationType()
                        .trim()
                        .toUpperCase();

        char classification =
                classificationType.charAt(0);

        return new TLE(
                satelliteNumber,
                classification,
                objectIdParts.launchYear(),
                objectIdParts.launchNumber(),
                objectIdParts.launchPiece(),
                input.getEphemerisType(),
                elementSetNumber,
                epoch,
                meanMotion,
                meanMotionDot,
                meanMotionDdot,
                input.getEccentricity(),
                inclination,
                argumentOfPericenter,
                rightAscensionOfAscendingNode,
                meanAnomaly,
                revolutionAtEpoch,
                input.getBstar(),
                TimeScalesFactory.getUTC()
        );
    }

    /**
     * Parse CelesTrak international designator.
     *
     * Example:
     *
     * 1998-067A
     *
     * becomes:
     *
     * launchYear   = 1998
     * launchNumber = 67
     * launchPiece  = A
     */
    private ObjectIdParts parseObjectId(
            String objectId) {

        if (objectId == null || objectId.isBlank()) {

            throw new IllegalArgumentException(
                    "Object ID must not be null or blank."
            );
        }

        String normalizedObjectId =
                objectId.trim().toUpperCase();

        Matcher matcher =
                OBJECT_ID_PATTERN.matcher(
                        normalizedObjectId
                );

        if (!matcher.matches()) {

            throw new IllegalArgumentException(
                    "Invalid international designator: "
                            + objectId
                            + ". Expected format YYYY-NNNPPP."
            );
        }

        int launchYear =
                Integer.parseInt(
                        matcher.group(1)
                );

        int launchNumber =
                Integer.parseInt(
                        matcher.group(2)
                );

        String launchPiece =
                matcher.group(3);

        return new ObjectIdParts(
                launchYear,
                launchNumber,
                launchPiece
        );
    }

    /**
     * Converts LocalDateTime into Orekit AbsoluteDate
     * using UTC.
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
     * Converts revolutions/day into radians/second.
     */
    private double revolutionsPerDayToRadiansPerSecond(
            Double value) {

        if (value == null) {
            throw new IllegalArgumentException(
                    "Mean motion must not be null."
            );
        }

        return value
                * TWO_PI
                / SECONDS_PER_DAY;
    }

    /**
     * Converts revolutions/day² into radians/second².
     */
    private double
    revolutionsPerDaySquaredToRadiansPerSecondSquared(
            Double value) {

        if (value == null) {
            throw new IllegalArgumentException(
                    "Mean motion first derivative must not be null."
            );
        }

        return value
                * TWO_PI
                / (
                SECONDS_PER_DAY
                        * SECONDS_PER_DAY
        );
    }

    /**
     * Converts revolutions/day³ into radians/second³.
     */
    private double
    revolutionsPerDayCubedToRadiansPerSecondCubed(
            Double value) {

        if (value == null) {
            throw new IllegalArgumentException(
                    "Mean motion second derivative must not be null."
            );
        }

        return value
                * TWO_PI
                / (
                SECONDS_PER_DAY
                        * SECONDS_PER_DAY
                        * SECONDS_PER_DAY
        );
    }

    /**
     * Validates all mandatory propagation input values.
     */
    private void validateInput(
            OrbitalPropagationInput input) {

        if (input == null) {

            throw new IllegalArgumentException(
                    "Orbital propagation input must not be null."
            );
        }

        validateNoradCatalogId(
                input.getNoradCatalogId()
        );

        validateDate(
                input.getEpoch(),
                "Orbital epoch"
        );

        validateDate(
                input.getTargetTime(),
                "Target propagation time"
        );

        validatePositiveFinite(
                input.getMeanMotion(),
                "Mean motion"
        );

        validateNonNegativeRange(
                input.getEccentricity(),
                0.0,
                1.0,
                "Eccentricity"
        );

        validateAngle(
                input.getInclination(),
                0.0,
                180.0,
                "Inclination"
        );

        validateFinite(
                input.getRightAscensionOfAscendingNode(),
                "RAAN"
        );

        validateFinite(
                input.getArgumentOfPericenter(),
                "Argument of pericenter"
        );

        validateFinite(
                input.getMeanAnomaly(),
                "Mean anomaly"
        );

        validateFinite(
                input.getBstar(),
                "B*"
        );

        validateFinite(
                input.getMeanMotionDot(),
                "Mean motion first derivative"
        );

        validateFinite(
                input.getMeanMotionDdot(),
                "Mean motion second derivative"
        );

        validatePositiveInteger(
                input.getElementSetNumber(),
                "Element set number"
        );

        validateNonNegativeLong(
                input.getRevolutionAtEpoch(),
                "Revolution number at epoch"
        );

        validateClassification(
                input.getClassificationType()
        );

        validateEphemerisType(
                input.getEphemerisType()
        );

        validateObjectId(
                input.getObjectId()
        );
    }

    /**
     * Validates NORAD catalog ID.
     *
     * The propagation contract uses Long,
     * while the Orekit TLE satellite number is
     * represented as an int.
     */
    private void validateNoradCatalogId(
            Long noradCatalogId) {

        if (noradCatalogId == null
                || noradCatalogId <= 0) {

            throw new IllegalArgumentException(
                    "NORAD catalog ID must be positive."
            );
        }

        if (noradCatalogId > Integer.MAX_VALUE) {

            throw new IllegalArgumentException(
                    "NORAD catalog ID exceeds the maximum "
                            + "value supported by Orekit."
            );
        }
    }

    private void validateDate(
            LocalDateTime dateTime,
            String fieldName) {

        if (dateTime == null) {

            throw new IllegalArgumentException(
                    fieldName + " must not be null."
            );
        }
    }

    private void validatePositiveFinite(
            Double value,
            String fieldName) {

        if (value == null
                || !Double.isFinite(value)
                || value <= 0.0) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be positive and finite."
            );
        }
    }

    private void validateFinite(
            Double value,
            String fieldName) {

        if (value == null
                || !Double.isFinite(value)) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be finite and not null."
            );
        }
    }

    private void validateNonNegativeRange(
            Double value,
            double minimum,
            double maximum,
            String fieldName) {

        if (value == null
                || !Double.isFinite(value)
                || value < minimum
                || value > maximum) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be between "
                            + minimum
                            + " and "
                            + maximum
                            + "."
            );
        }
    }

    private void validateAngle(
            Double value,
            double minimum,
            double maximum,
            String fieldName) {

        if (value == null
                || !Double.isFinite(value)
                || value < minimum
                || value > maximum) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be between "
                            + minimum
                            + " and "
                            + maximum
                            + " degrees."
            );
        }
    }

    private void validatePositiveInteger(
            Integer value,
            String fieldName) {

        if (value == null || value <= 0) {

            throw new IllegalArgumentException(
                    fieldName + " must be positive."
            );
        }
    }

    private void validateNonNegativeLong(
            Long value,
            String fieldName) {

        if (value == null || value < 0L) {

            throw new IllegalArgumentException(
                    fieldName + " must not be negative."
            );
        }

        if (value > Integer.MAX_VALUE) {

            throw new IllegalArgumentException(
                    fieldName
                            + " exceeds the maximum value "
                            + "supported by Orekit."
            );
        }
    }

    /**
     * CelesTrak normally uses U for unclassified objects.
     *
     * The propagation layer accepts a single
     * classification character.
     */
    private void validateClassification(
            String classificationType) {

        if (classificationType == null
                || classificationType.isBlank()) {

            throw new IllegalArgumentException(
                    "Classification type must not be null or blank."
            );
        }

        if (classificationType.trim().length() != 1) {

            throw new IllegalArgumentException(
                    "Classification type must contain exactly "
                            + "one character."
            );
        }
    }

    /**
     * Validates Orekit TLE ephemeris type.
     */
    private void validateEphemerisType(
            Integer ephemerisType) {

        if (ephemerisType == null) {

            throw new IllegalArgumentException(
                    "Ephemeris type must not be null."
            );
        }

        if (ephemerisType != TLE.DEFAULT
                && ephemerisType != TLE.SGP
                && ephemerisType != TLE.SGP4
                && ephemerisType != TLE.SGP8
                && ephemerisType != TLE.SDP4
                && ephemerisType != TLE.SDP8) {

            throw new IllegalArgumentException(
                    "Unsupported ephemeris type: "
                            + ephemerisType
            );
        }
    }

    private void validateObjectId(
            String objectId) {

        if (objectId == null || objectId.isBlank()) {

            throw new IllegalArgumentException(
                    "Object ID must not be null or blank."
            );
        }

        if (!OBJECT_ID_PATTERN
                .matcher(
                        objectId.trim().toUpperCase()
                )
                .matches()) {

            throw new IllegalArgumentException(
                    "Invalid international designator: "
                            + objectId
                            + ". Expected format YYYY-NNNPPP."
            );
        }
    }

    /**
     * Validates a value produced by the orbital
     * propagation calculation.
     *
     * This is especially important before the
     * state reaches the Risk Module, where invalid
     * values would corrupt distance or velocity
     * calculations.
     */
    private void validateFinitePropagationValue(
            double value,
            String fieldName) {

        if (!Double.isFinite(value)) {

            throw new IllegalStateException(
                    fieldName
                            + " produced an invalid numerical value "
                            + "during orbital propagation."
            );
        }
    }

    private record ObjectIdParts(
            int launchYear,
            int launchNumber,
            String launchPiece) {
    }
}