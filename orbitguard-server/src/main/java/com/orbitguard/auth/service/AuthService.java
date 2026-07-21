package com.orbitguard.auth.service;

import com.orbitguard.auth.dto.request.LoginRequest;
import com.orbitguard.auth.dto.request.RegisterRequest;
import com.orbitguard.auth.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}