package com.sparehub.dto.response;

import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;

import java.time.LocalDateTime;

public record UserAdminResponse(
        Long id,
        String fullName,
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        Role role,
        AccountStatus accountStatus,
        String loyaltyTier,
        Integer loyaltyPoints,
        LocalDateTime lastLoginAt,
        LocalDateTime lastPurchaseAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserAdminResponse fromUser(com.sparehub.entity.User user) {
        String fullName = user.getFullName() != null ? user.getFullName() : "";
        String firstName = "";
        String lastName = "";
        if (!fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String tierName = user.getLoyaltyTier() != null ? user.getLoyaltyTier().getName() : null;

        return new UserAdminResponse(
                user.getId(),
                user.getFullName(),
                firstName,
                lastName,
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole(),
                user.getAccountStatus(),
                tierName,
                user.getLoyaltyPoints(),
                user.getLastLoginAt(),
                user.getLastPurchaseAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
