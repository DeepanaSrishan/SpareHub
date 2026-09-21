package com.sparehub.service.impl;

import com.sparehub.dto.request.ChangePasswordRequest;
import com.sparehub.dto.request.UpdateProfileRequest;
import com.sparehub.dto.response.ProfileResponse;
import com.sparehub.entity.User;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.InvalidCredentialsException;
import com.sparehub.repository.UserRepository;
import com.sparehub.service.ProfileService;
import com.sparehub.util.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl
        implements ProfileService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getCurrentProfile() {

        User user =
                currentUserService.getCurrentUser();

        return mapToProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateCurrentProfile(
            UpdateProfileRequest request
    ) {
        User user =
                currentUserService.getCurrentUser();

        String resolvedName = request.resolveFullName();
        if (resolvedName == null || resolvedName.length() < 2) {
            throw new BadRequestException(
                    "Full name must contain between 2 and 120 characters"
            );
        }

        user.setFullName(resolvedName);

        user.setPhone(
                normalizeOptionalValue(
                        request.resolvePhone()
                )
        );

        user.setAddress(
                normalizeOptionalValue(
                        request.address()
                )
        );

        User updatedUser =
                userRepository.save(user);

        return mapToProfileResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(
            ChangePasswordRequest request
    ) {
        User user =
                currentUserService.getCurrentUser();

        validateCurrentPassword(
                request.currentPassword(),
                user.getPassword()
        );

        validateNewPasswordsMatch(request);

        validateNewPasswordIsDifferent(
                request.newPassword(),
                user.getPassword()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);
    }

    private void validateCurrentPassword(
            String currentPassword,
            String storedPassword
    ) {
        boolean matches =
                passwordEncoder.matches(
                        currentPassword,
                        storedPassword
                );

        if (!matches) {
            throw new InvalidCredentialsException(
                    "Current password is incorrect"
            );
        }
    }

    private void validateNewPasswordsMatch(
            ChangePasswordRequest request
    ) {
        String confirm = request.resolveConfirmPassword();
        if (confirm == null || confirm.isBlank()) {
            throw new BadRequestException(
                    "New password confirmation is required"
            );
        }

        if (!request.newPassword().equals(confirm)) {
            throw new BadRequestException(
                    "New password and password confirmation do not match"
            );
        }
    }

    private void validateNewPasswordIsDifferent(
            String newPassword,
            String storedPassword
    ) {
        if (passwordEncoder.matches(
                newPassword,
                storedPassword
        )) {
            throw new BadRequestException(
                    "New password must be different from the current password"
            );
        }
    }

    private String normalizeOptionalValue(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ProfileResponse mapToProfileResponse(
            User user
    ) {
        String loyaltyTierName =
                user.getLoyaltyTier() == null
                        ? null
                        : user.getLoyaltyTier()
                        .getName();

        return new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole(),
                user.getAccountStatus(),
                loyaltyTierName,
                user.getLoyaltyPoints(),
                user.getLastLoginAt(),
                user.getLastPurchaseAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}