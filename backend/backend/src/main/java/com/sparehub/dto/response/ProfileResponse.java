package com.sparehub.dto.response;

import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;

import java.time.LocalDateTime;

public record ProfileResponse(

        Long id,

        String fullName,

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
}