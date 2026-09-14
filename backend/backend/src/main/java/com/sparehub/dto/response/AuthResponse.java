package com.sparehub.dto.response;

import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;

public record AuthResponse(

        String accessToken,

        String tokenType,

        Long expiresIn,

        Long userId,

        String fullName,

        String email,

        Role role,

        AccountStatus accountStatus,

        String loyaltyTier,

        Integer loyaltyPoints
) {
}