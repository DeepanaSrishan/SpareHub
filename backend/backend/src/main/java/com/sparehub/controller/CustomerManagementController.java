package com.sparehub.controller;

import com.sparehub.dto.request.AssignLoyaltyTierRequest;
import com.sparehub.dto.request.UpdateAccountStatusRequest;
import com.sparehub.dto.response.*;
import com.sparehub.enums.AccountStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.repository.LoyaltyTierRepository;
import com.sparehub.service.CustomerManagementService;
import com.sparehub.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/customers", "/api/staff/customers"})
@RequiredArgsConstructor
public class CustomerManagementController {

    private final CustomerManagementService customerManagementService;
    private final LoyaltyService loyaltyService;
    private final LoyaltyTierRepository loyaltyTierRepository;

    /*
     * US-10: Search customers by name or email
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<CustomerSummaryResponse>>> searchCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "90") int inactiveDays,
            Pageable pageable
    ) {
        String effectiveKeyword = (keyword != null && !keyword.isBlank()) ? keyword : search;
        Page<CustomerSummaryResponse> response = customerManagementService.searchCustomers(
                effectiveKeyword,
                status,
                inactiveDays,
                pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", response));
    }

    /*
     * US-06: Identify inactive customers
     */
    @GetMapping("/inactive")
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<CustomerSummaryResponse>>> getInactiveCustomers(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) Integer inactiveDays,
            Pageable pageable
    ) {
        int effectiveDays = inactiveDays != null ? inactiveDays : (days != null ? days : 90);
        Page<CustomerSummaryResponse> response = customerManagementService.getInactiveCustomers(
                effectiveDays,
                pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Inactive customers retrieved successfully", response));
    }

    /*
     * US-09: View customer details
     */
    @GetMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> getCustomerById(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "90") int inactiveDays
    ) {
        CustomerDetailResponse response = customerManagementService.getCustomerById(
                customerId,
                inactiveDays
        );

        return ResponseEntity.ok(ApiResponse.success("Customer retrieved successfully", response));
    }

    /*
     * US-09: View customer previous transactions and order history
     */
    @GetMapping({"/{customerId}/transactions", "/{customerId}/history"})
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<LoyaltyTransactionResponse>>> getCustomerTransactions(
            @PathVariable Long customerId,
            Pageable pageable
    ) {
        Page<LoyaltyTransactionResponse> response = customerManagementService.getCustomerTransactions(
                customerId,
                pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Customer transaction history retrieved successfully", response));
    }

    /*
     * US-09: View customer previous orders
     */
    @GetMapping("/{customerId}/orders")
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<java.util.List<com.sparehub.dto.response.order.OrderResponse>>> getCustomerOrders(
            @PathVariable Long customerId
    ) {
        java.util.List<com.sparehub.dto.response.order.OrderResponse> response =
                customerManagementService.getCustomerOrders(customerId);

        return ResponseEntity.ok(ApiResponse.success("Customer orders retrieved successfully", response));
    }

    /*
     * US-05: Assign loyalty tier by sales staff / manager
     */
    @PatchMapping({"/{customerId}/tier", "/{customerId}/loyalty-tier"})
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<LoyaltyStatusResponse>> assignLoyaltyTier(
            @PathVariable Long customerId,
            @RequestBody Map<String, Object> body
    ) {
        Long tierId = null;
        if (body.get("loyaltyTierId") != null) {
            tierId = Long.valueOf(body.get("loyaltyTierId").toString());
        } else if (body.get("loyaltyTier") != null) {
            String tierName = body.get("loyaltyTier").toString();
            var tier = loyaltyTierRepository.findByNameIgnoreCase(tierName)
                    .orElseThrow(() -> new BadRequestException("Loyalty tier not found: " + tierName));
            tierId = tier.getId();
        }

        if (tierId == null) {
            throw new BadRequestException("loyaltyTierId or loyaltyTier name is required");
        }

        String reason = body.get("reason") != null ? body.get("reason").toString().trim() : "Tier updated by sales staff";
        LoyaltyStatusResponse response = loyaltyService.assignLoyaltyTier(
                customerId,
                new AssignLoyaltyTierRequest(tierId, reason)
        );

        return ResponseEntity.ok(ApiResponse.success("Customer loyalty tier updated successfully", response));
    }

    /*
     * US-11: Activate or deactivate customer accounts by manager
     */
    @PatchMapping("/{customerId}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> updateAccountStatus(
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateAccountStatusRequest request
    ) {
        CustomerDetailResponse response = customerManagementService.updateAccountStatus(
                customerId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success("Customer account status updated successfully", response));
    }

    @GetMapping("/{customerId}/status-history")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Page<AccountStatusHistoryResponse>>> getAccountStatusHistory(
            @PathVariable Long customerId,
            Pageable pageable
    ) {
        Page<AccountStatusHistoryResponse> response = customerManagementService.getAccountStatusHistory(
                customerId,
                pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Account status history retrieved successfully", response));
    }
}