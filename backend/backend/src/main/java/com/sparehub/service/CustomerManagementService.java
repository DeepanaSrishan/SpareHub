package com.sparehub.service;

import com.sparehub.dto.request.UpdateAccountStatusRequest;
import com.sparehub.dto.response.AccountStatusHistoryResponse;
import com.sparehub.dto.response.CustomerDetailResponse;
import com.sparehub.dto.response.CustomerSummaryResponse;
import com.sparehub.dto.response.LoyaltyTransactionResponse;
import com.sparehub.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerManagementService {

    Page<CustomerSummaryResponse> searchCustomers(
            String keyword,
            AccountStatus status,
            int inactiveDays,
            Pageable pageable
    );

    Page<CustomerSummaryResponse> getInactiveCustomers(
            int inactiveDays,
            Pageable pageable
    );

    CustomerDetailResponse getCustomerById(
            Long customerId,
            int inactiveDays
    );

    Page<LoyaltyTransactionResponse>
    getCustomerTransactions(
            Long customerId,
            Pageable pageable
    );

    CustomerDetailResponse updateAccountStatus(
            Long customerId,
            UpdateAccountStatusRequest request
    );

    Page<AccountStatusHistoryResponse>
    getAccountStatusHistory(
            Long customerId,
            Pageable pageable
    );
}