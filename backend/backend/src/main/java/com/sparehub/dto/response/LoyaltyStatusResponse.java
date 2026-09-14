package com.sparehub.dto.response;

import java.math.BigDecimal;

public record LoyaltyStatusResponse(

        Long customerId,

        String customerName,

        Integer currentPoints,

        String currentTier,

        BigDecimal discountPercentage,

        String nextTier,

        Integer nextTierMinimumPoints,

        Integer pointsRequiredForNextTier,

        BigDecimal progressPercentage,

        boolean nearNextTier,

        boolean highestTier
) {
}