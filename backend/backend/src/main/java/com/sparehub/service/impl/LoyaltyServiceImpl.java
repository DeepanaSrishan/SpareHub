package com.sparehub.service.impl;

import com.sparehub.dto.request.AssignLoyaltyTierRequest;
import com.sparehub.dto.response.LoyaltyStatusResponse;
import com.sparehub.entity.LoyaltyTier;
import com.sparehub.entity.LoyaltyTransaction;
import com.sparehub.entity.User;
import com.sparehub.enums.LoyaltyTransactionType;
import com.sparehub.enums.NotificationType;
import com.sparehub.enums.Role;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ConflictException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.LoyaltyTierRepository;
import com.sparehub.repository.LoyaltyTransactionRepository;
import com.sparehub.repository.UserRepository;
import com.sparehub.service.LoyaltyService;
import com.sparehub.service.NotificationService;
import com.sparehub.util.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import com.sparehub.repository.NotificationRepository;

@Service
@RequiredArgsConstructor
public class LoyaltyServiceImpl
        implements LoyaltyService {

    private final UserRepository userRepository;

    private final NotificationRepository
            notificationRepository;

    private final LoyaltyTierRepository
            loyaltyTierRepository;

    private final LoyaltyTransactionRepository
            loyaltyTransactionRepository;

    private final NotificationService
            notificationService;

    private final CurrentUserService
            currentUserService;

    @Value("${sparehub.loyalty.spend-per-point:100}")
    private BigDecimal spendPerPoint;

    @Value("${sparehub.loyalty.near-tier-percent:90}")
    private BigDecimal nearTierPercent;

    @Override
    @Transactional(readOnly = true)
    public LoyaltyStatusResponse
    getCurrentCustomerLoyaltyStatus() {

        User customer =
                currentUserService.getCurrentUser();

        validateCustomer(customer);

        return buildStatus(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public LoyaltyStatusResponse getCustomerLoyaltyStatus(
            Long customerId
    ) {
        User customer = findCustomer(customerId);

        return buildStatus(customer);
    }

    @Override
    @Transactional
    public LoyaltyStatusResponse assignLoyaltyTier(
            Long customerId,
            AssignLoyaltyTierRequest request
    ) {
        User customer = findCustomer(customerId);

        User performedBy =
                currentUserService.getCurrentUser();

        LoyaltyTier newTier =
                loyaltyTierRepository
                        .findById(request.loyaltyTierId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Loyalty tier",
                                        "id",
                                        request.loyaltyTierId()
                                )
                        );

        if (!Boolean.TRUE.equals(newTier.getActive())) {
            throw new BadRequestException(
                    "Inactive loyalty tier cannot be assigned"
            );
        }

        LoyaltyTier oldTier =
                customer.getLoyaltyTier();

        if (oldTier != null
                && oldTier.getId()
                .equals(newTier.getId())) {

            throw new ConflictException(
                    "Customer is already assigned to this loyalty tier"
            );
        }

        String previousTierName =
                oldTier == null
                        ? "No tier"
                        : oldTier.getName();

        customer.setLoyaltyTier(newTier);

        userRepository.save(customer);

        LoyaltyTransaction transaction =
                LoyaltyTransaction.builder()
                        .customer(customer)
                        .transactionType(
                                LoyaltyTransactionType
                                        .TIER_CHANGED
                        )
                        .points(0)
                        .balanceAfter(
                                customer.getLoyaltyPoints()
                        )
                        .description(
                                "Loyalty tier changed from "
                                        + previousTierName
                                        + " to "
                                        + newTier.getName()
                                        + ". Reason: "
                                        + request.reason().trim()
                        )
                        .performedByUserId(
                                performedBy.getId()
                        )
                        .build();

        loyaltyTransactionRepository.save(
                transaction
        );

        notificationService.createNotification(
                customer,
                NotificationType.TIER_UPDATED,
                "Loyalty tier updated",
                "Your SpareHub loyalty tier has been updated to "
                        + newTier.getName()
                        + ". You are now eligible for a "
                        + newTier.getDiscountPercentage()
                        + "% discount."
        );

        return buildStatus(customer);
    }

    @Override
    @Transactional
    public int awardPurchasePoints(
            Long customerId,
            Long orderId,
            BigDecimal eligibleAmount
    ) {
        User customer = findCustomer(customerId);

        validateEligibleAmount(eligibleAmount);

        boolean alreadyAwarded =
                loyaltyTransactionRepository
                        .existsByCustomerIdAndOrderIdAndTransactionType(
                                customerId,
                                orderId,
                                LoyaltyTransactionType
                                        .POINTS_EARNED
                        );

        if (alreadyAwarded) {
            throw new ConflictException(
                    "Loyalty points have already been awarded for this order"
            );
        }

        int earnedPoints = eligibleAmount
                .divide(
                        spendPerPoint,
                        0,
                        RoundingMode.DOWN
                )
                .intValue();

        if (earnedPoints <= 0) {
            return 0;
        }

        int currentPoints =
                customer.getLoyaltyPoints() == null
                        ? 0
                        : customer.getLoyaltyPoints();

        int newBalance =
                currentPoints + earnedPoints;

        customer.setLoyaltyPoints(newBalance);
        customer.setLastPurchaseAt(
                LocalDateTime.now()
        );

        userRepository.save(customer);

        LoyaltyTransaction transaction =
                LoyaltyTransaction.builder()
                        .customer(customer)
                        .orderId(orderId)
                        .transactionType(
                                LoyaltyTransactionType
                                        .POINTS_EARNED
                        )
                        .points(earnedPoints)
                        .balanceAfter(newBalance)
                        .description(
                                "Points earned from completed order #"
                                        + orderId
                        )
                        .build();

        loyaltyTransactionRepository.save(
                transaction
        );

        notificationService.createNotification(
                customer,
                NotificationType
                        .LOYALTY_POINTS_EARNED,
                "Reward points earned",
                "You earned "
                        + earnedPoints
                        + " SpareHub reward points."
        );

        createNearTierNotificationIfRequired(
                customer
        );

        return earnedPoints;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateLoyaltyDiscount(
            Long customerId,
            BigDecimal subtotal
    ) {
        User customer = findCustomer(customerId);

        if (subtotal == null
                || subtotal.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            return BigDecimal.ZERO;
        }

        LoyaltyTier tier =
                customer.getLoyaltyTier();

        if (tier == null
                || !Boolean.TRUE.equals(
                tier.getActive()
        )) {
            return BigDecimal.ZERO;
        }

        return subtotal
                .multiply(
                        tier.getDiscountPercentage()
                )
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private void createNearTierNotificationIfRequired(
            User customer
    ) {
        List<LoyaltyTier> tiers =
                loyaltyTierRepository
                        .findByActiveTrueOrderByMinimumPointsAsc();

        LoyaltyTier nextTier =
                findNextTier(
                        customer.getLoyaltyPoints(),
                        tiers
                );

        if (nextTier == null) {
            return;
        }

        BigDecimal progress =
                calculateProgress(
                        customer.getLoyaltyPoints(),
                        nextTier.getMinimumPoints()
                );

        if (progress.compareTo(
                nearTierPercent
        ) < 0) {
            return;
        }

        int remainingPoints =
                Math.max(
                        nextTier.getMinimumPoints()
                                - customer.getLoyaltyPoints(),
                        0
                );

        String message =
                "You are only "
                        + remainingPoints
                        + " points away from the "
                        + nextTier.getName()
                        + " loyalty tier.";

        notificationService.createNotification(
                customer,
                NotificationType.NEAR_NEXT_TIER,
                "You are close to the next tier",
                message
        );
    }

    private LoyaltyStatusResponse buildStatus(
            User customer
    ) {
        List<LoyaltyTier> tiers =
                loyaltyTierRepository
                        .findByActiveTrueOrderByMinimumPointsAsc();

        LoyaltyTier currentTier =
                customer.getLoyaltyTier();

        LoyaltyTier nextTier =
                findNextTier(
                        customer.getLoyaltyPoints(),
                        tiers
                );

        boolean highestTier =
                nextTier == null;

        Integer pointsRequired =
                highestTier
                        ? 0
                        : Math.max(
                        nextTier.getMinimumPoints()
                                - customer.getLoyaltyPoints(),
                        0
                );

        BigDecimal progress =
                highestTier
                        ? BigDecimal.valueOf(100)
                        : calculateProgress(
                        customer.getLoyaltyPoints(),
                        nextTier.getMinimumPoints()
                );

        boolean nearNextTier =
                !highestTier
                        && progress.compareTo(
                        nearTierPercent
                ) >= 0;

        return new LoyaltyStatusResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getLoyaltyPoints(),
                currentTier == null
                        ? null
                        : currentTier.getName(),
                currentTier == null
                        ? BigDecimal.ZERO
                        : currentTier
                        .getDiscountPercentage(),
                highestTier
                        ? null
                        : nextTier.getName(),
                highestTier
                        ? null
                        : nextTier.getMinimumPoints(),
                pointsRequired,
                progress,
                nearNextTier,
                highestTier
        );
    }

    private LoyaltyTier findNextTier(
            Integer currentPoints,
            List<LoyaltyTier> tiers
    ) {
        int points =
                currentPoints == null
                        ? 0
                        : currentPoints;

        return tiers.stream()
                .filter(tier ->
                        tier.getMinimumPoints() > points
                )
                .findFirst()
                .orElse(null);
    }

    private BigDecimal calculateProgress(
            Integer currentPoints,
            Integer nextTierMinimum
    ) {
        if (nextTierMinimum == null
                || nextTierMinimum <= 0) {
            return BigDecimal.valueOf(100);
        }

        BigDecimal progress =
                BigDecimal.valueOf(
                                currentPoints == null
                                        ? 0
                                        : currentPoints
                        )
                        .multiply(
                                BigDecimal.valueOf(100)
                        )
                        .divide(
                                BigDecimal.valueOf(
                                        nextTierMinimum
                                ),
                                2,
                                RoundingMode.HALF_UP
                        );

        return progress.min(
                BigDecimal.valueOf(100)
        );
    }

    private User findCustomer(Long customerId) {
        User customer =
                userRepository
                        .findById(customerId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer",
                                        "id",
                                        customerId
                                )
                        );

        validateCustomer(customer);

        return customer;
    }

    private void validateCustomer(User user) {
        if (user.getRole() != Role.CUSTOMER) {
            throw new BadRequestException(
                    "The selected user is not a customer"
            );
        }
    }

    private void validateEligibleAmount(
            BigDecimal eligibleAmount
    ) {
        if (eligibleAmount == null
                || eligibleAmount.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            throw new BadRequestException(
                    "Eligible purchase amount must be greater than zero"
            );
        }

        if (spendPerPoint.compareTo(
                BigDecimal.ZERO
        ) <= 0) {
            throw new IllegalStateException(
                    "Loyalty spend-per-point configuration must be greater than zero"
            );
        }
    }
}