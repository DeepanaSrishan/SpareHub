package com.sparehub.repository;

import com.sparehub.entity.AccountStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountStatusHistoryRepository
        extends JpaRepository<AccountStatusHistory, Long> {

    Page<AccountStatusHistory>
    findByCustomerIdOrderByCreatedAtDesc(
            Long customerId,
            Pageable pageable
    );
}