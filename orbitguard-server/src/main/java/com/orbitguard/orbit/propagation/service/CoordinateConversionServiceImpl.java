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

@Service
public class CoordinateConversionServiceImpl
        implements CoordinateConversionService {

    private static final double KILOMETERS_TO_METERS = 1000.0;

    private final Frame temeFrame;
    private final Frame earthFixedFrame;
    private final OneAxisEllipsoid earth;

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

    @Override
    public GeodeticPosition toGeodeticPosition(
            PropagatedOrbitalState propagatedState) {

        validateInput(propagatedState);

        AbsoluteDate date =
                toAbsoluteDate(
                        propagatedState.getTimestamp()
                );

        Vector3D temePosition =
                new Vector3D(
                        propagatedState.getPositionX()
                                * KILOMETERS_TO_METERS,
                        propagatedState.getPositionY()
                                * KILOMETERS_TO_METERS,
                        propagatedState.getPositionZ()
                                * KILOMETERS_TO_METERS
                );

        Transform temeToEarthFixed =
                temeFrame.getTransformTo(
                        earthFixedFrame,
                        date
                );

        Vector3D earthFixedPosition =
                temeToEarthFixed.transformPosition(
                        temePosition
                );

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

    private AbsoluteDate toAbsoluteDate(
            java.time.LocalDateTime dateTime) {

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

    private void validateInput(
            PropagatedOrbitalState propagatedState) {

        if (propagatedState == null) {
            throw new IllegalArgumentException(
                    "Propagated orbital state must not be null"
            );
        }

        if (propagatedState.getTimestamp() == null) {
            throw new IllegalArgumentException(
                    "Propagation timestamp must not be null"
            );
        }

        if (propagatedState.getPositionX() == null
                || propagatedState.getPositionY() == null
                || propagatedState.getPositionZ() == null) {

            throw new IllegalArgumentException(
                    "Propagated position coordinates must not be null"
            );
        }

        if (propagatedState.getFrame() == null
                || propagatedState.getFrame().isBlank()) {

            throw new IllegalArgumentException(
                    "Reference frame must not be null or blank"
            );
        }

        if (!"TEME".equalsIgnoreCase(
                propagatedState.getFrame())) {

            throw new IllegalArgumentException(
                    "Unsupported reference frame: "
                            + propagatedState.getFrame()
            );
        }
    }
}