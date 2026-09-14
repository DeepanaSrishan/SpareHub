package com.sparehub.service;

import com.sparehub.dto.request.LoginRequest;
import com.sparehub.dto.request.RegisterRequest;
import com.sparehub.dto.response.AuthResponse;
import com.sparehub.dto.response.RegisterResponse;


public interface AuthService {

    RegisterResponse registerCustomer(
            RegisterRequest request
    );
    AuthResponse login(
            LoginRequest request
    );
}