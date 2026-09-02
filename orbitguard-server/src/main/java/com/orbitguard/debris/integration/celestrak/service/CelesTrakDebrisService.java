package com.orbitguard.debris.integration.celestrak.service;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;

public interface CelesTrakDebrisService {

    CelesTrakOrbitalData fetchOrbitalData(Long noradId);
}