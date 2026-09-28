package com.orbitguard.satellite.integration.celestrak.mapper;

import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

@Component
public class CelesTrakSatelliteMapper {

    /**
     * Converts the external CelesTrak GP response
     * into OrbitGuard's internal orbital-data DTO.
     *
     * External API model must not leak into the
     * application business/propagation layer.
     */
    public CelesTrakOrbitalData toOrbitalData(
            CelesTrakSatelliteResponse response) {

        if (response == null) {
            return null;
        }

        return CelesTrakOrbitalData.builder()
                .satelliteName(response.getObjectName())
                .objectId(response.getObjectId())
                .noradCatalogId(response.getNoradCatalogId())
                .epoch(parseEpoch(response.getEpoch()))

                .meanMotion(response.getMeanMotion())
                .meanMotionDot(response.getMeanMotionDot())
                .meanMotionDdot(response.getMeanMotionDdot())

                .eccentricity(response.getEccentricity())
                .inclination(response.getInclination())
                .rightAscensionOfAscendingNode(
                        response.getRightAscensionOfAscendingNode()
                )
                .argumentOfPericenter(
                        response.getArgumentOfPericenter()
                )
                .meanAnomaly(response.getMeanAnomaly())

                .bstar(response.getBstar())

                .elementSetNumber(
                        response.getElementSetNumber()
                )
                .revolutionAtEpoch(
                        response.getRevolutionAtEpoch() != null
                                ? response.getRevolutionAtEpoch().longValue()
                                : null
                )

                .classificationType(
                        response.getClassificationType()
                )
                .ephemerisType(
                        response.getEphemerisType()
                )

                .build();
    }

    /**
     * Converts CelesTrak epoch into OrbitGuard's
     * LocalDateTime UTC representation.
     *
     * Supported examples:
     *
     * 2026-09-25T12:30:00
     * 2026-09-25T12:30:00Z
     * 2026-09-25T12:30:00+00:00
     */
    private LocalDateTime parseEpoch(
            String epoch) {

        if (epoch == null || epoch.isBlank()) {
            return null;
        }

        String normalizedEpoch = epoch.trim();

        try {

            /*
             * If the value contains an offset/Z,
             * normalize it to UTC first.
             */
            return OffsetDateTime.parse(normalizedEpoch)
                    .withOffsetSameInstant(ZoneOffset.UTC)
                    .toLocalDateTime();

        } catch (DateTimeParseException ignored) {

            /*
             * Some responses may contain a plain
             * LocalDateTime without an offset.
             */
            try {

                return LocalDateTime.parse(
                        normalizedEpoch
                );

            } catch (DateTimeParseException exception) {

                throw new IllegalArgumentException(
                        "Invalid CelesTrak epoch format: "
                                + epoch,
                        exception
                );
            }
        }
    }
}