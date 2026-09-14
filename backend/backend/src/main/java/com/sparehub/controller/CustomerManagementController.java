package com.sparehub.controller;

import com.sparehub.dto.request.UpdateAccountStatusRequest;
import com.sparehub.dto.response.*;
import com.sparehub.enums.AccountStatus;
import com.sparehub.service.CustomerManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerManagementController {

    private final CustomerManagementService
            customerManagementService;

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ResponseEntity<
            ApiResponse<Page<CustomerSummaryResponse>>
            > searchCustomers(

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            AccountStatus status,

            @RequestParam(defaultValue = "90")
            int inactiveDays,

            Pageable pageable
    ) {
        Page<CustomerSummaryResponse> response =
                customerManagementService
                        .searchCustomers(
                                keyword,
                                status,
                                inactiveDays,
                                pageable
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customers retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/inactive")
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ResponseEntity<
            ApiResponse<Page<CustomerSummaryResponse>>
            > getInactiveCustomers(

            @RequestParam(defaultValue = "90")
            int days,

            Pageable pageable
    ) {
        Page<CustomerSummaryResponse> response =
                customerManagementService
                        .getInactiveCustomers(
                                days,
                                pageable
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Inactive customers retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{customerId}")
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ResponseEntity<
            ApiResponse<CustomerDetailResponse>
            > getCustomerById(

            @PathVariable
            Long customerId,

            @RequestParam(defaultValue = "90")
            int inactiveDays
    ) {
        CustomerDetailResponse response =
                customerManagementService
                        .getCustomerById(
                                customerId,
                                inactiveDays
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{customerId}/transactions")
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ResponseEntity<
            ApiResponse<
                    Page<LoyaltyTransactionResponse>
                    >
            > getCustomerTransactions(

            @PathVariable
            Long customerId,

            Pageable pageable
    ) {
        Page<LoyaltyTransactionResponse> response =
                customerManagementService
                        .getCustomerTransactions(
                                customerId,
                                pageable
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer transaction history retrieved successfully",
                        response
                )
        );
    }

    @PatchMapping("/{customerId}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<
            ApiResponse<CustomerDetailResponse>
            > updateAccountStatus(

            @PathVariable
            Long customerId,

            @Valid
            @RequestBody
            UpdateAccountStatusRequest request
    ) {
        CustomerDetailResponse response =
                customerManagementService
                        .updateAccountStatus(
                                customerId,
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer account status updated successfully",
                        response
                )
        );
    }

    @GetMapping("/{customerId}/status-history")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<
            ApiResponse<
                    Page<AccountStatusHistoryResponse>
                    >
            > getAccountStatusHistory(

            @PathVariable
            Long customerId,

            Pageable pageable
    ) {
        Page<AccountStatusHistoryResponse> response =
                customerManagementService
                        .getAccountStatusHistory(
                                customerId,
                                pageable
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Account status history retrieved successfully",
                        response
                )
        );
    }
}