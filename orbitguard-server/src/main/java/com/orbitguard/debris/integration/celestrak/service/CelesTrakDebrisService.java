package com.orbitguard.debris.integration.celestrak.service;

import com.orbitguard.debris.integration.celestrak.dto.CelesTrakDebrisResponse;
import com.orbitguard.debris.integration.celestrak.dto.CelesTrakOrbitalData;

import java.util.List;

public interface CelesTrakDebrisService {

    CelesTrakOrbitalData fetchOrbitalData(Long noradId);

    List<CelesTrakDebrisResponse> fetchDebrisByGroup(String group);
}