package com.sparehub.controller;

import com.sparehub.dto.request.RegisterRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.RegisterResponse;
import com.sparehub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sparehub.dto.request.LoginRequest;
import com.sparehub.dto.response.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<
            ApiResponse<RegisterResponse>
            > registerCustomer(

            @Valid
            @RequestBody
            RegisterRequest request
    ) {
        RegisterResponse response =
                authService.registerCustomer(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Customer account created successfully",
                                response
                        )
                );
    }
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(

            @Valid
            @RequestBody
            LoginRequest request
    ) {
        AuthResponse response =
                authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Login successful",
                        response
                )
        );
    }
}