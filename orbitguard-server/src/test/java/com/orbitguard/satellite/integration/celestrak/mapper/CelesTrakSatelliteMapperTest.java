package com.orbitguard.satellite.integration.celestrak.mapper;

import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.satellite.integration.celestrak.dto.CelesTrakSatelliteResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CelesTrakSatelliteMapperTest {

    private CelesTrakSatelliteMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CelesTrakSatelliteMapper();
    }

    // -------------------------------------------------------------------------
    // toOrbitalData()
    // -------------------------------------------------------------------------

    @Test
    void toOrbitalData_shouldReturnNull_whenResponseIsNull() {

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(null);

        assertNull(result);
    }

    @Test
    void toOrbitalData_shouldMapAllOrbitalFieldsCorrectly() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .objectId("1998-067A")
                        .noradCatalogId(25544)
                        .epoch("2026-09-25T12:30:00")
                        .meanMotion(15.49312345)
                        .eccentricity(0.0004123)
                        .inclination(51.6412)
                        .rightAscensionOfAscendingNode(120.1234)
                        .argumentOfPericenter(250.5678)
                        .meanAnomaly(110.1234)
                        .bstar(0.00012345)
                        .meanMotionDot(0.00000123)
                        .meanMotionDdot(0.00000001)
                        .elementSetNumber(999)
                        .revolutionAtEpoch(12345)
                        .classificationType("U")
                        .ephemerisType(0)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                "ISS (ZARYA)",
                result.getSatelliteName()
        );

        assertEquals(
                "1998-067A",
                result.getObjectId()
        );

        assertEquals(
                25544,
                result.getNoradCatalogId()
        );

        assertEquals(
                2026,
                result.getEpoch().getYear()
        );

        assertEquals(
                9,
                result.getEpoch().getMonthValue()
        );

        assertEquals(
                25,
                result.getEpoch().getDayOfMonth()
        );

        assertEquals(
                12,
                result.getEpoch().getHour()
        );

        assertEquals(
                30,
                result.getEpoch().getMinute()
        );

        assertEquals(
                15.49312345,
                result.getMeanMotion()
        );

        assertEquals(
                0.0004123,
                result.getEccentricity()
        );

        assertEquals(
                51.6412,
                result.getInclination()
        );

        assertEquals(
                120.1234,
                result.getRightAscensionOfAscendingNode()
        );

        assertEquals(
                250.5678,
                result.getArgumentOfPericenter()
        );

        assertEquals(
                110.1234,
                result.getMeanAnomaly()
        );

        assertEquals(
                0.00012345,
                result.getBstar()
        );

        assertEquals(
                0.00000123,
                result.getMeanMotionDot()
        );

        assertEquals(
                0.00000001,
                result.getMeanMotionDdot()
        );

        assertEquals(
                999,
                result.getElementSetNumber()
        );

        assertEquals(
                12345,
                result.getRevolutionAtEpoch()
        );

        assertEquals(
                "U",
                result.getClassificationType()
        );

        assertEquals(
                0,
                result.getEphemerisType()
        );
    }

    @Test
    void toOrbitalData_shouldParseIsoLocalDateTimeEpoch() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .epoch("2026-09-25T12:30:45")
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);
        assertNotNull(result.getEpoch());

        assertEquals(
                2026,
                result.getEpoch().getYear()
        );

        assertEquals(
                9,
                result.getEpoch().getMonthValue()
        );

        assertEquals(
                25,
                result.getEpoch().getDayOfMonth()
        );

        assertEquals(
                12,
                result.getEpoch().getHour()
        );

        assertEquals(
                30,
                result.getEpoch().getMinute()
        );

        assertEquals(
                45,
                result.getEpoch().getSecond()
        );
    }

    @Test
    void toOrbitalData_shouldParseUtcEpoch() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .epoch("2026-09-25T12:30:45Z")
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);
        assertNotNull(result.getEpoch());

        assertEquals(
                2026,
                result.getEpoch().getYear()
        );

        assertEquals(
                9,
                result.getEpoch().getMonthValue()
        );

        assertEquals(
                25,
                result.getEpoch().getDayOfMonth()
        );

        assertEquals(
                12,
                result.getEpoch().getHour()
        );

        assertEquals(
                30,
                result.getEpoch().getMinute()
        );

        assertEquals(
                45,
                result.getEpoch().getSecond()
        );
    }

    @Test
    void toOrbitalData_shouldParseOffsetEpoch() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .epoch("2026-09-25T12:30:45+05:30")
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);
        assertNotNull(result.getEpoch());

        assertEquals(
                2026,
                result.getEpoch().getYear()
        );

        assertEquals(
                9,
                result.getEpoch().getMonthValue()
        );

        assertEquals(
                25,
                result.getEpoch().getDayOfMonth()
        );

        /*
         * The current mapper intentionally converts the
         * OffsetDateTime to LocalDateTime using toLocalDateTime().
         *
         * Therefore the original local clock time is preserved.
         */
        assertEquals(
                12,
                result.getEpoch().getHour()
        );

        assertEquals(
                30,
                result.getEpoch().getMinute()
        );
    }

    @Test
    void toOrbitalData_shouldReturnNullEpoch_whenEpochIsNull() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .epoch(null)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);
        assertNull(result.getEpoch());
    }

    @Test
    void toOrbitalData_shouldReturnNullEpoch_whenEpochIsBlank() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .epoch("   ")
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);
        assertNull(result.getEpoch());
    }

    @Test
    void toOrbitalData_shouldRejectInvalidEpoch() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .epoch("INVALID-EPOCH")
                        .build();

        assertThrows(
                IllegalArgumentException.class,
                () -> mapper.toOrbitalData(response)
        );
    }

    @Test
    void toOrbitalData_shouldPreserveNoradCatalogIdAsInteger() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                Integer.valueOf(25544),
                result.getNoradCatalogId()
        );
    }

    @Test
    void toOrbitalData_shouldMapClassificationType() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .classificationType("U")
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                "U",
                result.getClassificationType()
        );
    }

    @Test
    void toOrbitalData_shouldMapElementSetNumber() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .elementSetNumber(999)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                Integer.valueOf(999),
                result.getElementSetNumber()
        );
    }

    @Test
    void toOrbitalData_shouldMapRevolutionAtEpoch() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .revolutionAtEpoch(12345)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                Integer.valueOf(12345),
                result.getRevolutionAtEpoch()
        );
    }

    @Test
    void toOrbitalData_shouldMapEphemerisType() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("ISS (ZARYA)")
                        .noradCatalogId(25544)
                        .ephemerisType(0)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                Integer.valueOf(0),
                result.getEphemerisType()
        );
    }

    @Test
    void toOrbitalData_shouldMapSatelliteIdentityFields() {

        CelesTrakSatelliteResponse response =
                CelesTrakSatelliteResponse.builder()
                        .objectName("HUBBLE SPACE TELESCOPE")
                        .objectId("1990-037B")
                        .noradCatalogId(20580)
                        .build();

        CelesTrakOrbitalData result =
                mapper.toOrbitalData(response);

        assertNotNull(result);

        assertEquals(
                "HUBBLE SPACE TELESCOPE",
                result.getSatelliteName()
        );

        assertEquals(
                "1990-037B",
                result.getObjectId()
        );

        assertEquals(
                Integer.valueOf(20580),
                result.getNoradCatalogId()
        );
    }
}