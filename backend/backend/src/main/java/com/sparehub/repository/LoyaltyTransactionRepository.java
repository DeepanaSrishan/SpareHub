package com.sparehub.repository;

import com.sparehub.entity.LoyaltyTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyTransactionRepository
        extends JpaRepository<LoyaltyTransaction, Long> {

    Page<LoyaltyTransaction>
    findByCustomerIdOrderByCreatedAtDesc(
            Long customerId,
            Pageable pageable
    );

    boolean existsByCustomerIdAndOrderIdAndTransactionType(
            Long customerId,
            Long orderId,
            com.sparehub.enums.LoyaltyTransactionType type
    );
}