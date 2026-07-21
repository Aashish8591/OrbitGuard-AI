package com.orbitguard.auth.service;

import com.orbitguard.auth.dto.request.LoginRequest;
import com.orbitguard.auth.dto.request.RegisterRequest;
import com.orbitguard.auth.dto.response.AuthResponse;
import com.orbitguard.auth.entity.User;
import com.orbitguard.auth.enums.Role;
import com.orbitguard.common.exception.BadRequestException;
import com.orbitguard.common.exception.UnauthorizedException;
import com.orbitguard.auth.repository.UserRepository;
import com.orbitguard.auth.security.CustomUserDetails;
import com.orbitguard.auth.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(new CustomUserDetails(user));

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
//                .message("Registration successful.")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        try {

            authenticationManager.authenticate(

                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword())

            );

        } catch (BadCredentialsException ex) {

            throw new UnauthorizedException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UnauthorizedException("User not found."));

        String token = jwtService.generateToken(new CustomUserDetails(user));

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
//                .message("Login successful.")
                .build();
    }
}