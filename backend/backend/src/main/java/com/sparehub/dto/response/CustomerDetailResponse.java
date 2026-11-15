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
    public String getName() {
        return fullName;
    }

    public String getFirstName() {
        if (fullName == null || fullName.isBlank()) return "";
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts[0];
    }

    public String getLastName() {
        if (fullName == null || fullName.isBlank()) return "";
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    public String getPhoneNumber() {
        return phone;
    }

    public Integer getRewardPoints() {
        return loyaltyPoints != null ? loyaltyPoints : 0;
    }

    public LocalDateTime getLastPurchaseDate() {
        return lastPurchaseAt;
    }
}