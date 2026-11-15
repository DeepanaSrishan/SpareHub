package com.sparehub.service.impl;

import com.sparehub.dto.request.UpdateAccountStatusRequest;
import com.sparehub.dto.response.AccountStatusHistoryResponse;
import com.sparehub.dto.response.CustomerDetailResponse;
import com.sparehub.dto.response.CustomerSummaryResponse;
import com.sparehub.dto.response.LoyaltyTransactionResponse;
import com.sparehub.entity.AccountStatusHistory;
import com.sparehub.entity.LoyaltyTier;
import com.sparehub.entity.LoyaltyTransaction;
import com.sparehub.entity.User;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.NotificationType;
import com.sparehub.enums.Role;
import com.sparehub.dto.response.order.OrderResponse;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ConflictException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.mapper.order.OrderResponseMapper;
import com.sparehub.repository.AccountStatusHistoryRepository;
import com.sparehub.repository.LoyaltyTransactionRepository;
import com.sparehub.repository.UserRepository;
import com.sparehub.repository.order.CustomerOrderRepository;
import com.sparehub.service.CustomerManagementService;
import com.sparehub.service.NotificationService;
import com.sparehub.specification.CustomerSpecification;
import com.sparehub.util.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerManagementServiceImpl
        implements CustomerManagementService {

    private static final int DEFAULT_INACTIVE_DAYS = 90;

    private final UserRepository userRepository;

    private final LoyaltyTransactionRepository
            loyaltyTransactionRepository;

    private final AccountStatusHistoryRepository
            accountStatusHistoryRepository;

    private final CustomerOrderRepository
            customerOrderRepository;

    private final OrderResponseMapper
            orderResponseMapper;

    private final CurrentUserService
            currentUserService;

    private final NotificationService
            notificationService;

    private final com.sparehub.service.LoyaltyService loyaltyService;

    @Override
    @Transactional
    public Page<CustomerSummaryResponse>
    searchCustomers(
            String keyword,
            AccountStatus status,
            int inactiveDays,
            Pageable pageable
    ) {
        int validInactiveDays =
                validateInactiveDays(inactiveDays);

        Specification<User> specification =
                Specification
                        .where(
                                CustomerSpecification
                                        .isCustomer()
                        )
                        .and(
                                CustomerSpecification
                                        .containsKeyword(
                                                keyword
                                        )
                        )
                        .and(
                                CustomerSpecification
                                        .hasStatus(status)
                        );

        return userRepository
                .findAll(specification, pageable)
                .map(user ->
                        mapToSummary(
                                user,
                                validInactiveDays
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerSummaryResponse>
    getInactiveCustomers(
            int inactiveDays,
            Pageable pageable
    ) {
        int validInactiveDays =
                validateInactiveDays(inactiveDays);

        LocalDateTime cutoffDate =
                LocalDateTime.now()
                        .minusDays(validInactiveDays);

        return userRepository
                .findInactiveCustomers(
                        Role.CUSTOMER,
                        cutoffDate,
                        pageable
                )
                .map(user ->
                        mapToSummary(
                                user,
                                validInactiveDays
                        )
                );
    }

    @Override
    @Transactional
    public CustomerDetailResponse getCustomerById(
            Long customerId,
            int inactiveDays
    ) {
        User customer =
                findCustomer(customerId);

        return mapToDetail(
                customer,
                validateInactiveDays(inactiveDays)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoyaltyTransactionResponse>
    getCustomerTransactions(
            Long customerId,
            Pageable pageable
    ) {
        findCustomer(customerId);

        return loyaltyTransactionRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId,
                        pageable
                )
                .map(this::mapToTransaction);
    }

    @Override
    @Transactional
    public CustomerDetailResponse updateAccountStatus(
            Long customerId,
            UpdateAccountStatusRequest request
    ) {
        User customer =
                findCustomer(customerId);

        User manager =
                currentUserService.getCurrentUser();

        validateAllowedStatus(
                request.accountStatus()
        );

        AccountStatus previousStatus =
                customer.getAccountStatus();

        AccountStatus newStatus =
                request.accountStatus();

        if (previousStatus == newStatus) {
            throw new ConflictException(
                    "Customer account already has "
                            + newStatus
                            + " status"
            );
        }

        customer.setAccountStatus(newStatus);

        User updatedCustomer =
                userRepository.save(customer);

        AccountStatusHistory statusHistory =
                AccountStatusHistory.builder()
                        .customer(updatedCustomer)
                        .previousStatus(previousStatus)
                        .newStatus(newStatus)
                        .reason(
                                request.reason().trim()
                        )
                        .performedByUserId(
                                manager.getId()
                        )
                        .performedByName(
                                manager.getFullName()
                        )
                        .build();

        accountStatusHistoryRepository.save(
                statusHistory
        );

        notificationService.createNotification(
                updatedCustomer,
                NotificationType.GENERAL,
                "Account status updated",
                "Your SpareHub account status has been changed from "
                        + previousStatus
                        + " to "
                        + newStatus
                        + "."
        );

        return mapToDetail(
                updatedCustomer,
                DEFAULT_INACTIVE_DAYS
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccountStatusHistoryResponse>
    getAccountStatusHistory(
            Long customerId,
            Pageable pageable
    ) {
        findCustomer(customerId);

        return accountStatusHistoryRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId,
                        pageable
                )
                .map(this::mapToStatusHistory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(Long customerId) {
        findCustomer(customerId);

        return customerOrderRepository
                .findAllByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(orderResponseMapper::toResponse)
                .toList();
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

        if (customer.getRole() != Role.CUSTOMER) {
            throw new ResourceNotFoundException(
                    "Customer",
                    "id",
                    customerId
            );
        }

        return customer;
    }

    private void validateAllowedStatus(
            AccountStatus status
    ) {
        /*
         * US-11 Manager operation එකෙන් allow කරන්නේ
         * activate/deactivate කිරීම පමණයි.
         */
        if (status != AccountStatus.ACTIVE
                && status
                != AccountStatus.DEACTIVATED) {

            throw new BadRequestException(
                    "Manager can only activate or deactivate customer accounts using this operation"
            );
        }
    }

    private int validateInactiveDays(
            int inactiveDays
    ) {
        if (inactiveDays <= 0) {
            throw new BadRequestException(
                    "Inactive-day period must be greater than zero"
            );
        }

        if (inactiveDays > 3650) {
            throw new BadRequestException(
                    "Inactive-day period is too large"
            );
        }

        return inactiveDays;
    }

    private boolean isInactive(
            User customer,
            int inactiveDays
    ) {
        LocalDateTime referenceDate =
                customer.getLastPurchaseAt() != null
                        ? customer.getLastPurchaseAt()
                        : customer.getCreatedAt();

        if (referenceDate == null) {
            return false;
        }

        return referenceDate.isBefore(
                LocalDateTime.now()
                        .minusDays(inactiveDays)
        );
    }

    private long calculateInactiveDays(
            User customer
    ) {
        LocalDateTime referenceDate =
                customer.getLastPurchaseAt() != null
                        ? customer.getLastPurchaseAt()
                        : customer.getCreatedAt();

        if (referenceDate == null) {
            return 0;
        }

        return Math.max(
                Duration.between(
                        referenceDate,
                        LocalDateTime.now()
                ).toDays(),
                0
        );
    }

    private String resolveCustomerName(User customer) {
        if (customer == null) {
            return "Customer";
        }
        if (customer.getFullName() != null && !customer.getFullName().trim().isBlank()) {
            return customer.getFullName().trim();
        }
        if (customer.getEmail() != null && !customer.getEmail().trim().isBlank()) {
            return customer.getEmail().trim();
        }
        return "Customer #" + customer.getId();
    }

    private CustomerSummaryResponse mapToSummary(
            User customer,
            int inactiveDays
    ) {
        LoyaltyTier tier =
                loyaltyService.ensureCustomerTierUpToDate(customer);

        return new CustomerSummaryResponse(
                customer.getId(),
                resolveCustomerName(customer),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAccountStatus(),
                tier == null
                        ? null
                        : tier.getName(),
                customer.getLoyaltyPoints(),
                customer.getLastPurchaseAt(),
                isInactive(
                        customer,
                        inactiveDays
                ),
                calculateInactiveDays(customer)
        );
    }

    private CustomerDetailResponse mapToDetail(
            User customer,
            int inactiveDays
    ) {
        LoyaltyTier tier =
                loyaltyService.ensureCustomerTierUpToDate(customer);

        return new CustomerDetailResponse(
                customer.getId(),
                resolveCustomerName(customer),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getAccountStatus(),
                tier == null
                        ? null
                        : tier.getName(),
                tier == null
                        ? BigDecimal.ZERO
                        : tier.getDiscountPercentage(),
                customer.getLoyaltyPoints(),
                customer.getLastLoginAt(),
                customer.getLastPurchaseAt(),
                customer.getCreatedAt(),
                isInactive(
                        customer,
                        inactiveDays
                ),
                calculateInactiveDays(customer)
        );
    }

    private LoyaltyTransactionResponse
    mapToTransaction(
            LoyaltyTransaction transaction
    ) {
        return new LoyaltyTransactionResponse(
                transaction.getId(),
                transaction.getOrderId(),
                transaction.getTransactionType(),
                transaction.getPoints(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getPerformedByUserId(),
                transaction.getCreatedAt()
        );
    }

    private AccountStatusHistoryResponse
    mapToStatusHistory(
            AccountStatusHistory history
    ) {
        return new AccountStatusHistoryResponse(
                history.getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getReason(),
                history.getPerformedByUserId(),
                history.getPerformedByName(),
                history.getCreatedAt()
        );
    }
}