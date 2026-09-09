package com.sparehub.backend.controller;

import com.sparehub.backend.dto.AuthRequest;
import com.sparehub.backend.dto.AuthResponse;
import com.sparehub.backend.dto.RegisterRequest;
import com.sparehub.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // US-01: Customer account creation (triggers US-62 welcome message)
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    // Login for Customer, Sales Staff, Manager
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
