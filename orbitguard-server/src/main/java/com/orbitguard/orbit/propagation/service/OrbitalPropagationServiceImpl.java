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
     * Orekit returns position in meters.
     */
    private static final double METERS_TO_KILOMETERS = 1.0 / 1000.0;

    /**
     * WGS-84 Earth equatorial radius.
     *
     * Used for the current geocentric altitude calculation.
     *
     * Unit: kilometers.
     */
    private static final double EARTH_RADIUS_KM = 6378.137;

    /**
     * International designator format:
     *
     * YYYY-NNNPPP
     *
     * Example:
     * 1998-067A
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
         * Build TLE from normalized OrbitGuard data.
         */
        TLE tle = buildTle(input);

        /*
         * Create SGP4 propagator.
         */
        TLEPropagator propagator =
                TLEPropagator.selectExtrapolator(tle);

        /*
         * Convert requested propagation time
         * into Orekit AbsoluteDate.
         */
        AbsoluteDate targetDate =
                toAbsoluteDate(input.getTargetTime());

        /*
         * Propagate satellite to requested time.
         */
        PVCoordinates pvCoordinates =
                propagator.getPVCoordinates(targetDate);

        /*
         * Position and velocity returned by Orekit.
         *
         * Position  -> meters
         * Velocity  -> meters/second
         */
        Vector3D position =
                pvCoordinates.getPosition();

        Vector3D velocity =
                pvCoordinates.getVelocity();

        /*
         * --------------------------------------------------
         * POSITION
         * --------------------------------------------------
         *
         * Convert individual position components
         * from meters to kilometers.
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
         * VELOCITY
         * --------------------------------------------------
         *
         * Convert individual velocity components
         * from meters/second to kilometers/second.
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
         * --------------------------------------------------
         * VELOCITY MAGNITUDE
         * --------------------------------------------------
         *
         * Total orbital velocity:
         *
         * V = sqrt(
         *      Vx² +
         *      Vy² +
         *      Vz²
         * )
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

        /*
         * --------------------------------------------------
         * ALTITUDE
         * --------------------------------------------------
         *
         * Position magnitude gives the distance from
         * the Earth's center.
         *
         * R = sqrt(
         *      X² +
         *      Y² +
         *      Z²
         * )
         *
         * Then:
         *
         * altitude =
         *      distanceFromEarthCenter
         *      - EarthRadius
         *
         * Unit:
         * km
         */
        double distanceFromEarthCenter =
                Math.sqrt(
                        positionX * positionX
                                + positionY * positionY
                                + positionZ * positionZ
                );

        double altitude =
                distanceFromEarthCenter
                        - EARTH_RADIUS_KM;

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
                 * Position
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
                 * Derived orbital values
                 */
                .velocity(velocityMagnitude)
                .altitude(altitude)

                /*
                 * Reference frame
                 */
                .frame("TEME")

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
         * Mean motion:
         *
         * revolutions/day
         * →
         * radians/second
         */
        double meanMotion =
                revolutionsPerDayToRadiansPerSecond(
                        input.getMeanMotion()
                );

        /*
         * Mean motion first derivative:
         *
         * revolutions/day²
         * →
         * radians/second²
         */
        double meanMotionDot =
                revolutionsPerDaySquaredToRadiansPerSecondSquared(
                        input.getMeanMotionDot()
                );

        /*
         * Mean motion second derivative:
         *
         * revolutions/day³
         * →
         * radians/second³
         */
        double meanMotionDdot =
                revolutionsPerDayCubedToRadiansPerSecondCubed(
                        input.getMeanMotionDdot()
                );

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

        char classification =
                input.getClassificationType()
                        .trim()
                        .charAt(0);

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
     * Convert revolutions/day to radians/second.
     */
    private double revolutionsPerDayToRadiansPerSecond(
            Double value) {

        return value
                * TWO_PI
                / SECONDS_PER_DAY;
    }

    /**
     * Convert revolutions/day² to radians/second².
     */
    private double
    revolutionsPerDaySquaredToRadiansPerSecondSquared(
            Double value) {

        return value
                * TWO_PI
                / (
                SECONDS_PER_DAY
                        * SECONDS_PER_DAY
        );
    }

    /**
     * Convert revolutions/day³ to radians/second³.
     */
    private double
    revolutionsPerDayCubedToRadiansPerSecondCubed(
            Double value) {

        return value
                * TWO_PI
                / (
                SECONDS_PER_DAY
                        * SECONDS_PER_DAY
                        * SECONDS_PER_DAY
        );
    }

    /**
     * Validate all mandatory propagation input values.
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
     * Validate NORAD catalog ID.
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
     * Validate Orekit TLE ephemeris type.
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

    private record ObjectIdParts(
            int launchYear,
            int launchNumber,
            String launchPiece) {
    }
}