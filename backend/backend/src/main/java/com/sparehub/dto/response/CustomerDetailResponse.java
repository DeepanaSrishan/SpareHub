package com.sparehub.dto.response;

import com.sparehub.enums.AccountStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomerDetailResponse(

        Long id,

        String fullName,

        String email,

        String phone,

        String address,

        AccountStatus accountStatus,

        String loyaltyTier,

        BigDecimal discountPercentage,

        Integer loyaltyPoints,

        LocalDateTime lastLoginAt,

        LocalDateTime lastPurchaseAt,

        LocalDateTime createdAt,

        boolean inactive,

        long inactiveDays
) {
}