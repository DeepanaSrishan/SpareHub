package com.sparehub.service;

import com.sparehub.dto.AuthResponse;
import com.sparehub.dto.LoginRequest;
import com.sparehub.dto.RegisterRequest;
import com.sparehub.entity.Role;
import com.sparehub.entity.User;
import com.sparehub.exception.DuplicateResourceException;
import com.sparehub.repository.RoleRepository;
import com.sparehub.repository.UserRepository;
import com.sparehub.security.CustomUserDetails;
import com.sparehub.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                      RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return new AuthResponse(token, "Bearer", userDetails.getId(), 
                userDetails.getUsername(), userDetails.getEmail(), role);
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new DuplicateResourceException("User", "username", registerRequest.getUsername());
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("User", "email", registerRequest.getEmail());
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhone(registerRequest.getPhone());
        user.setActive(true);

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        user.getRoles().add(customerRole);

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getUsername(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, "Bearer", user.getId(), user.getUsername(), user.getEmail(), "CUSTOMER");
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("User not authenticated");
    }
}
