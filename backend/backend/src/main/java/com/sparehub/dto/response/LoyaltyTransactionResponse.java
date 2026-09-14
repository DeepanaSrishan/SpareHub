package com.sparehub.dto.response;

import com.sparehub.enums.LoyaltyTransactionType;

import java.time.LocalDateTime;

public record LoyaltyTransactionResponse(

        Long id,

        Long orderId,

        LoyaltyTransactionType transactionType,

        Integer points,

        Integer balanceAfter,

        String description,

        Long performedByUserId,

        LocalDateTime createdAt
) {
}