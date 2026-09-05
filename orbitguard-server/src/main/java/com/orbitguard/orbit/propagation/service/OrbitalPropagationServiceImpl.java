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

    private static final double SECONDS_PER_DAY = 86400.0;
    private static final double TWO_PI = 2.0 * Math.PI;

    private static final Pattern OBJECT_ID_PATTERN =
            Pattern.compile("^(\\d{4})-(\\d{3})([A-Z0-9]+)$");

    @Override
    public PropagatedOrbitalState propagate(
            OrbitalPropagationInput input) {

        validateInput(input);

        TLE tle = buildTle(input);

        TLEPropagator propagator =
                TLEPropagator.selectExtrapolator(tle);

        AbsoluteDate targetDate =
                toAbsoluteDate(input.getTargetTime());

        PVCoordinates pvCoordinates =
                propagator.getPVCoordinates(targetDate);

        Vector3D position = pvCoordinates.getPosition();
        Vector3D velocity = pvCoordinates.getVelocity();

        return PropagatedOrbitalState.builder()
                .noradCatalogId(input.getNoradCatalogId())
                .timestamp(input.getTargetTime())
                .positionX(position.getX() / 1000.0)
                .positionY(position.getY() / 1000.0)
                .positionZ(position.getZ() / 1000.0)
                .velocityX(velocity.getX() / 1000.0)
                .velocityY(velocity.getY() / 1000.0)
                .velocityZ(velocity.getZ() / 1000.0)
                .frame("TEME")
                .build();
    }

    private TLE buildTle(OrbitalPropagationInput input) {

        ObjectIdParts objectIdParts =
                parseObjectId(input.getObjectId());

        AbsoluteDate epoch =
                toAbsoluteDate(input.getEpoch());

        double meanMotion =
                revolutionsPerDayToRadiansPerSecond(
                        input.getMeanMotion());

        double meanMotionDot =
                revolutionsPerDaySquaredToRadiansPerSecondSquared(
                        input.getMeanMotionDot());

        double meanMotionDdot =
                revolutionsPerDayCubedToRadiansPerSecondCubed(
                        input.getMeanMotionDdot());

        double inclination =
                Math.toRadians(input.getInclination());

        double rightAscensionOfAscendingNode =
                Math.toRadians(
                        input.getRightAscensionOfAscendingNode());

        double argumentOfPericenter =
                Math.toRadians(
                        input.getArgumentOfPericenter());

        double meanAnomaly =
                Math.toRadians(input.getMeanAnomaly());

        char classification =
                input.getClassificationType()
                        .charAt(0);

        return new TLE(
                input.getNoradCatalogId().intValue(),
                classification,
                objectIdParts.launchYear(),
                objectIdParts.launchNumber(),
                objectIdParts.launchPiece(),
                input.getEphemerisType(),
                input.getElementSetNumber(),
                epoch,
                meanMotion,
                meanMotionDot,
                meanMotionDdot,
                input.getEccentricity(),
                inclination,
                argumentOfPericenter,
                rightAscensionOfAscendingNode,
                meanAnomaly,
                input.getRevolutionAtEpoch().intValue(),
                input.getBstar(),
                TimeScalesFactory.getUTC()
        );
    }

    private ObjectIdParts parseObjectId(String objectId) {

        if (objectId == null || objectId.isBlank()) {
            throw new IllegalArgumentException(
                    "Object ID must not be null or blank");
        }

        Matcher matcher =
                OBJECT_ID_PATTERN.matcher(objectId.trim());

        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                    "Invalid object ID format: " + objectId);
        }

        int launchYear =
                Integer.parseInt(matcher.group(1));

        int launchNumber =
                Integer.parseInt(matcher.group(2));

        String launchPiece =
                matcher.group(3);

        return new ObjectIdParts(
                launchYear,
                launchNumber,
                launchPiece
        );
    }

    private AbsoluteDate toAbsoluteDate(
            LocalDateTime dateTime) {

        double second =
                dateTime.getSecond()
                        + dateTime.getNano() / 1_000_000_000.0;

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

    private double revolutionsPerDayToRadiansPerSecond(
            Double value) {

        return value * TWO_PI / SECONDS_PER_DAY;
    }

    private double revolutionsPerDaySquaredToRadiansPerSecondSquared(
            Double value) {

        return value * TWO_PI
                / (SECONDS_PER_DAY * SECONDS_PER_DAY);
    }

    private double revolutionsPerDayCubedToRadiansPerSecondCubed(
            Double value) {

        return value * TWO_PI
                / (SECONDS_PER_DAY
                * SECONDS_PER_DAY
                * SECONDS_PER_DAY);
    }

    private void validateInput(
            OrbitalPropagationInput input) {

        if (input == null) {
            throw new IllegalArgumentException(
                    "Orbital propagation input must not be null");
        }

        if (input.getNoradCatalogId() == null
                || input.getNoradCatalogId() <= 0) {
            throw new IllegalArgumentException(
                    "NORAD catalog ID must be positive");
        }

        if (input.getEpoch() == null) {
            throw new IllegalArgumentException(
                    "Orbital epoch must not be null");
        }

        if (input.getTargetTime() == null) {
            throw new IllegalArgumentException(
                    "Target propagation time must not be null");
        }

        if (input.getMeanMotion() == null
                || input.getMeanMotion() <= 0) {
            throw new IllegalArgumentException(
                    "Mean motion must be positive");
        }

        if (input.getEccentricity() == null
                || input.getEccentricity() < 0) {
            throw new IllegalArgumentException(
                    "Eccentricity must not be negative");
        }

        if (input.getInclination() == null) {
            throw new IllegalArgumentException(
                    "Inclination must not be null");
        }

        if (input.getRightAscensionOfAscendingNode() == null) {
            throw new IllegalArgumentException(
                    "RAAN must not be null");
        }

        if (input.getArgumentOfPericenter() == null) {
            throw new IllegalArgumentException(
                    "Argument of pericenter must not be null");
        }

        if (input.getMeanAnomaly() == null) {
            throw new IllegalArgumentException(
                    "Mean anomaly must not be null");
        }

        if (input.getBstar() == null) {
            throw new IllegalArgumentException(
                    "B* must not be null");
        }

        if (input.getMeanMotionDot() == null) {
            throw new IllegalArgumentException(
                    "Mean motion first derivative must not be null");
        }

        if (input.getMeanMotionDdot() == null) {
            throw new IllegalArgumentException(
                    "Mean motion second derivative must not be null");
        }

        if (input.getElementSetNumber() == null) {
            throw new IllegalArgumentException(
                    "Element set number must not be null");
        }

        if (input.getRevolutionAtEpoch() == null) {
            throw new IllegalArgumentException(
                    "Revolution number at epoch must not be null");
        }

        if (input.getClassificationType() == null
                || input.getClassificationType().isBlank()) {
            throw new IllegalArgumentException(
                    "Classification type must not be null or blank");
        }

        if (input.getEphemerisType() == null) {
            throw new IllegalArgumentException(
                    "Ephemeris type must not be null");
        }

        if (input.getObjectId() == null
                || input.getObjectId().isBlank()) {
            throw new IllegalArgumentException(
                    "Object ID must not be null or blank");
        }
    }

    private record ObjectIdParts(
            int launchYear,
            int launchNumber,
            String launchPiece) {
    }
}