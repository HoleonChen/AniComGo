package com.anicomgo.service;

import com.anicomgo.dto.auth.AuthResponse;
import com.anicomgo.dto.auth.LoginRequest;
import com.anicomgo.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
