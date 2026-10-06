package com.orbitguard.visualization.service.impl;

import com.orbitguard.orbit.propagation.dto.GeodeticPosition;
import com.orbitguard.orbit.propagation.dto.PropagatedOrbitalData;
import com.orbitguard.orbit.propagation.service.OrbitalPropagationFacade;
import com.orbitguard.visualization.constants.VisualizationApiConstants;
import com.orbitguard.visualization.dto.VisualizationObjectResponse;
import com.orbitguard.visualization.dto.VisualizationResponse;
import com.orbitguard.visualization.service.VisualizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Default implementation of the visualization service.
 *
 * <p>
 * This service acts as the application layer between the visualization
 * controller and the existing orbital propagation infrastructure.
 * </p>
 *
 * <p>
 * The service does not perform SGP4 propagation or coordinate conversion
 * itself. Those responsibilities remain inside the orbital propagation
 * module.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class VisualizationServiceImpl implements VisualizationService {

    private final OrbitalPropagationFacade orbitalPropagationFacade;

    /**
     * Retrieves the propagated visualization position of a satellite.
     *
     * @param noradCatalogId NORAD catalog ID of the satellite
     * @param targetTime     target propagation time
     * @return visualization response
     */
    @Override
    public VisualizationResponse getSatelliteVisualization(
            Integer noradCatalogId,
            LocalDateTime targetTime
    ) {

        PropagatedOrbitalData propagatedData =
                orbitalPropagationFacade.propagateSatelliteWithPosition(
                        noradCatalogId,
                        targetTime
                );

        return buildVisualizationResponse(
                propagatedData,
                VisualizationApiConstants.SATELLITE_OBJECT_TYPE,
                "Satellite"
        );
    }

    /**
     * Retrieves the propagated visualization position of a debris object.
     *
     * @param noradId    NORAD ID of the debris object
     * @param targetTime target propagation time
     * @return visualization response
     */
    @Override
    public VisualizationResponse getDebrisVisualization(
            Long noradId,
            LocalDateTime targetTime
    ) {

        PropagatedOrbitalData propagatedData =
                orbitalPropagationFacade.propagateDebrisWithPosition(
                        noradId,
                        targetTime
                );

        return buildVisualizationResponse(
                propagatedData,
                VisualizationApiConstants.DEBRIS_OBJECT_TYPE,
                "Debris"
        );
    }

    /**
     * Retrieves propagated visualization data for all active
     * satellites and debris objects.
     *
     * <p>
     * The facade is responsible for obtaining the orbital data and
     * performing propagation through the existing SGP4/Orekit
     * infrastructure.
     * </p>
     *
     * <p>
     * This method intentionally does not make one facade call per
     * object. The facade will provide a dedicated bulk propagation
     * operation so that the backend can process the complete orbital
     * dataset efficiently.
     * </p>
     *
     * @param targetTime target propagation time
     * @return bulk visualization response
     */
    @Override
    public VisualizationResponse getAllVisualizationObjects(
            LocalDateTime targetTime
    ) {

        List<PropagatedOrbitalData> propagatedObjects =
                orbitalPropagationFacade.propagateAllWithPosition(
                        targetTime
                );

        List<VisualizationObjectResponse> objects =
                propagatedObjects.stream()
                        .map(this::buildBulkVisualizationObject)
                        .toList();

        return VisualizationResponse.builder()
                .objects(objects)
                .propagatedAt(targetTime.toString())
                .build();
    }

    /**
     * Builds the visualization object for a single propagated result.
     *
     * <p>
     * The single-object endpoints currently do not have the database
     * entity name available through PropagatedOrbitalData. The facade
     * refactor will address this so that actual satellite/debris names
     * can be returned instead of generic fallback names.
     * </p>
     */
    private VisualizationResponse buildVisualizationResponse(
            PropagatedOrbitalData propagatedData,
            String objectType,
            String objectName
    ) {

        if (propagatedData == null) {
            throw new IllegalStateException(
                    "Propagated orbital data must not be null."
            );
        }

        GeodeticPosition position =
                propagatedData.getGeodeticPosition();

        if (position == null) {
            throw new IllegalStateException(
                    "Geodetic position must not be null."
            );
        }

        if (propagatedData.getOrbitalState() == null) {
            throw new IllegalStateException(
                    "Propagated orbital state must not be null."
            );
        }

        VisualizationObjectResponse object =
                VisualizationObjectResponse.builder()
                        .noradId(
                                propagatedData
                                        .getOrbitalState()
                                        .getNoradCatalogId()
                        )
                        .name(objectName)
                        .objectType(objectType)
                        .latitude(position.getLatitude())
                        .longitude(position.getLongitude())
                        .altitudeKm(position.getAltitude())
                        .timestamp(
                                propagatedData
                                        .getOrbitalState()
                                        .getTimestamp()
                                        .toString()
                        )
                        .build();

        return VisualizationResponse.builder()
                .object(object)
                .propagatedAt(
                        propagatedData
                                .getOrbitalState()
                                .getTimestamp()
                                .toString()
                )
                .build();
    }

    /**
     * Builds the lightweight visualization representation used by
     * the bulk 3D Earth response.
     *
     * <p>
     * The actual Cartesian Earth-fixed coordinates will be added to
     * VisualizationObjectResponse when the coordinate conversion
     * layer is updated.
     * </p>
     */
    private VisualizationObjectResponse buildBulkVisualizationObject(
            PropagatedOrbitalData propagatedData
    ) {

        if (propagatedData == null) {
            throw new IllegalStateException(
                    "Propagated orbital data must not be null."
            );
        }

        if (propagatedData.getOrbitalState() == null) {
            throw new IllegalStateException(
                    "Propagated orbital state must not be null."
            );
        }

        GeodeticPosition position =
                propagatedData.getGeodeticPosition();

        if (position == null) {
            throw new IllegalStateException(
                    "Geodetic position must not be null."
            );
        }

        /*
         * Object type and actual database name are intentionally not
         * guessed here.
         *
         * The bulk propagation contract will carry the object metadata
         * from the satellite/debris database records. Once the facade
         * contract is updated, this mapping will use those values.
         */
        return VisualizationObjectResponse.builder()
                .noradId(
                        propagatedData
                                .getOrbitalState()
                                .getNoradCatalogId()
                )
                .latitude(position.getLatitude())
                .longitude(position.getLongitude())
                .altitudeKm(position.getAltitude())
                .timestamp(
                        propagatedData
                                .getOrbitalState()
                                .getTimestamp()
                                .toString()
                )
                .build();
    }
}