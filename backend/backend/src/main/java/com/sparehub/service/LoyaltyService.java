package com.sparehub.service;

import com.sparehub.dto.request.AssignLoyaltyTierRequest;
import com.sparehub.dto.response.LoyaltyStatusResponse;

import java.math.BigDecimal;

public interface LoyaltyService {

    LoyaltyStatusResponse
    getCurrentCustomerLoyaltyStatus();

    LoyaltyStatusResponse getCustomerLoyaltyStatus(
            Long customerId
    );

    LoyaltyStatusResponse assignLoyaltyTier(
            Long customerId,
            AssignLoyaltyTierRequest request
    );

    int awardPurchasePoints(
            Long customerId,
            Long orderId,
            BigDecimal eligibleAmount
    );

    BigDecimal calculateLoyaltyDiscount(
            Long customerId,
            BigDecimal subtotal
    );

    com.sparehub.entity.LoyaltyTier ensureCustomerTierUpToDate(com.sparehub.entity.User customer);

    void syncAllCustomerTiers();
}