package com.sparehub.dto.response;

import com.sparehub.enums.AccountStatus;

import java.time.LocalDateTime;

public record CustomerSummaryResponse(

        Long id,

        String fullName,

        String email,

        String phone,

        AccountStatus accountStatus,

        String loyaltyTier,

        Integer loyaltyPoints,

        LocalDateTime lastPurchaseAt,

        boolean inactive,

        long inactiveDays
) {
}