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

/**
 * Default implementation of the visualization service.
 *
 * <p>This service acts as a thin application layer over the existing
 * orbital propagation facade. It does not perform orbital propagation
 * or coordinate conversion itself.</p>
 */
@Service
@RequiredArgsConstructor
public class VisualizationServiceImpl implements VisualizationService {

    private final OrbitalPropagationFacade orbitalPropagationFacade;

    /**
     * {@inheritDoc}
     */
    @Override
    public VisualizationResponse getSatelliteVisualization(
            Integer noradCatalogId,
            LocalDateTime targetTime) {

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
     * {@inheritDoc}
     */
    @Override
    public VisualizationResponse getDebrisVisualization(
            Long noradId,
            LocalDateTime targetTime) {

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
     * Builds the visualization response from the existing propagated
     * orbital data.
     *
     * @param propagatedData propagated orbital and geodetic data
     * @param objectType     visualization object type
     * @param objectName     display name of the orbital object
     * @return visualization response
     */
    private VisualizationResponse buildVisualizationResponse(
            PropagatedOrbitalData propagatedData,
            String objectType,
            String objectName) {

        GeodeticPosition position =
                propagatedData.getGeodeticPosition();

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
}