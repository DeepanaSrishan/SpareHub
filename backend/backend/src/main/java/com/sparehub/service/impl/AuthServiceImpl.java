package com.sparehub.service.impl;

import com.sparehub.dto.request.RegisterRequest;
import com.sparehub.dto.response.RegisterResponse;
import com.sparehub.entity.LoyaltyTier;
import com.sparehub.entity.User;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ConflictException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.LoyaltyTierRepository;
import com.sparehub.repository.UserRepository;
import com.sparehub.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import com.sparehub.dto.request.LoginRequest;
import com.sparehub.dto.response.AuthResponse;
import com.sparehub.exception.InvalidCredentialsException;
import com.sparehub.exception.UnauthorizedOperationException;
import com.sparehub.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;

import java.time.LocalDateTime;
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final LoyaltyTierRepository
            loyaltyTierRepository;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager
            authenticationManager;

    private final JwtService jwtService;
    private final com.sparehub.service.NotificationService notificationService;

    @Override
    @Transactional
    public RegisterResponse registerCustomer(
            RegisterRequest request
    ) {
        validateMatchingPasswords(request);

        String normalizedEmail = normalizeEmail(
                request.email()
        );

        validateEmailAvailability(normalizedEmail);

        LoyaltyTier bronzeTier =
                findInitialLoyaltyTier();

        User customer = User.builder()
                .fullName(request.fullName().trim())
                .email(normalizedEmail)
                .password(
                        passwordEncoder.encode(
                                request.password()
                        )
                )
                .phone(normalizeOptionalValue(
                        request.phone()
                ))
                .address(normalizeOptionalValue(
                        request.address()
                ))
                .role(Role.CUSTOMER)
                .accountStatus(AccountStatus.ACTIVE)
                .loyaltyTier(bronzeTier)
                .loyaltyPoints(0)
                .welcomeMessageSent(true)
                .build();

        User savedCustomer =
                userRepository.save(customer);

        notificationService.createNotification(
                savedCustomer,
                com.sparehub.enums.NotificationType.WELCOME,
                "Welcome to SpareHub!",
                "Welcome " + savedCustomer.getFullName() + "! Your SpareHub account has been created successfully."
        );

        return mapToRegisterResponse(savedCustomer);
    }

    private void validateMatchingPasswords(
            RegisterRequest request
    ) {
        if (!request.password()
                .equals(request.confirmPassword())) {

            throw new BadRequestException(
                    "Password and password confirmation do not match"
            );
        }
    }

    private void validateEmailAvailability(
            String email
    ) {
        if (userRepository
                .existsByEmailIgnoreCase(email)) {

            throw new ConflictException(
                    "An account already exists with this email"
            );
        }
    }

    private LoyaltyTier findInitialLoyaltyTier() {
        return loyaltyTierRepository
                .findFirstByActiveTrueOrderByMinimumPointsAsc()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No active loyalty tier is available"
                        )
                );
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase();
    }

    private String normalizeOptionalValue(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private RegisterResponse mapToRegisterResponse(
            User customer
    ) {
        return new RegisterResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getRole(),
                customer.getAccountStatus(),
                customer.getLoyaltyTier().getName(),
                customer.getLoyaltyPoints(),
                customer.getCreatedAt(),
                "Welcome to SpareHub, "
                        + customer.getFullName()
                        + "! Your account has been created successfully."
        );
    }
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase();

        User user = userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"
                        )
                );

        if (!user.canLogin()) {
            throw new UnauthorizedOperationException(
                    "Your account is "
                            + user.getAccountStatus()
                            + ". Please contact the manager."
            );
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.password()
                    )
            );

        } catch (AuthenticationException exception) {
            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        user.setLastLoginAt(LocalDateTime.now());

        User updatedUser =
                userRepository.save(user);

        String accessToken =
                jwtService.generateToken(updatedUser);

        String tierName = updatedUser.getLoyaltyTier()
                == null
                ? null
                : updatedUser.getLoyaltyTier().getName();

        return new AuthResponse(
                accessToken,
                "Bearer",
                jwtService.getExpirationSeconds(),
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getAccountStatus(),
                tierName,
                updatedUser.getLoyaltyPoints()
        );
    }
}