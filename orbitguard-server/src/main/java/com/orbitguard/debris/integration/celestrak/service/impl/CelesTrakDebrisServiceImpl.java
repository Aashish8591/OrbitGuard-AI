package com.orbitguard.debris.integration.celestrak.service.impl;

import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.debris.integration.celestrak.client.CelesTrakClient;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;
import com.orbitguard.debris.integration.celestrak.mapper.CelesTrakDebrisMapper;
import com.orbitguard.debris.integration.celestrak.service.CelesTrakDebrisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CelesTrakDebrisServiceImpl implements CelesTrakDebrisService {

    private final CelesTrakClient celesTrakClient;
    private final CelesTrakDebrisMapper celesTrakDebrisMapper;

    @Override
    public CelesTrakOrbitalData fetchOrbitalData(Long noradId) {

        validateNoradId(noradId);

        CelesTrakDebrisResponse[] responses =
                celesTrakClient.fetchOrbitalData(noradId);

        if (responses == null || responses.length == 0) {
            return null;
        }

        return celesTrakDebrisMapper.toOrbitalData(responses[0]);
    }

    private void validateNoradId(Long noradId) {

        if (noradId == null || noradId <= 0) {
            throw new BadRequestException(
                    "NORAD ID must be a positive number."
            );
        }
    }
}