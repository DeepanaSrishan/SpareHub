package com.sparehub.controller;

import com.sparehub.dto.request.AssignLoyaltyTierRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.LoyaltyStatusResponse;
import com.sparehub.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<
            ApiResponse<LoyaltyStatusResponse>
            > getMyLoyaltyStatus() {

        LoyaltyStatusResponse response =
                loyaltyService
                        .getCurrentCustomerLoyaltyStatus();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Loyalty status retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/customers/{customerId}")
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ResponseEntity<
            ApiResponse<LoyaltyStatusResponse>
            > getCustomerLoyaltyStatus(

            @PathVariable
            Long customerId
    ) {
        LoyaltyStatusResponse response =
                loyaltyService
                        .getCustomerLoyaltyStatus(
                                customerId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer loyalty status retrieved successfully",
                        response
                )
        );
    }

    @PatchMapping(
            "/customers/{customerId}/tier"
    )
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ResponseEntity<
            ApiResponse<LoyaltyStatusResponse>
            > assignLoyaltyTier(

            @PathVariable
            Long customerId,

            @Valid
            @RequestBody
            AssignLoyaltyTierRequest request
    ) {
        LoyaltyStatusResponse response =
                loyaltyService.assignLoyaltyTier(
                        customerId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer loyalty tier updated successfully",
                        response
                )
        );
    }
}