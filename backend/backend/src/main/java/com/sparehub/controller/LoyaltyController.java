package com.sparehub.controller;

import com.sparehub.dto.request.AssignLoyaltyTierRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.LoyaltyStatusResponse;
import com.sparehub.entity.LoyaltyTier;
import com.sparehub.exception.BadRequestException;
import com.sparehub.repository.LoyaltyTierRepository;
import com.sparehub.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final LoyaltyTierRepository loyaltyTierRepository;

    /*
     * US-03: View loyalty tiers and benefits
     */
    @GetMapping("/tiers")
    public ResponseEntity<ApiResponse<List<LoyaltyTier>>> getAllActiveTiers() {
        List<LoyaltyTier> tiers = loyaltyTierRepository.findByActiveTrueOrderByMinimumPointsAsc();
        return ResponseEntity.ok(
                ApiResponse.success("Loyalty tiers retrieved successfully", tiers)
        );
    }

    /*
     * US-03: Customer view my loyalty status
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<LoyaltyStatusResponse>> getMyLoyaltyStatus() {
        LoyaltyStatusResponse response = loyaltyService.getCurrentCustomerLoyaltyStatus();
        return ResponseEntity.ok(
                ApiResponse.success("Loyalty status retrieved successfully", response)
        );
    }

    /*
     * Staff view specific customer loyalty status
     */
    @GetMapping("/customers/{customerId}")
    @PreAuthorize("hasAnyRole('SALES_STAFF', 'MANAGER')")
    public ResponseEntity<ApiResponse<LoyaltyStatusResponse>> getCustomerLoyaltyStatus(
            @PathVariable Long customerId
    ) {
        LoyaltyStatusResponse response = loyaltyService.getCustomerLoyaltyStatus(customerId);
        return ResponseEntity.ok(
                ApiResponse.success("Customer loyalty status retrieved successfully", response)
        );
    }

    /*
     * US-05: Sales Staff assign loyalty tier to customer
     */
    @PatchMapping("/customers/{customerId}/tier")
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

        return ResponseEntity.ok(
                ApiResponse.success("Customer loyalty tier updated successfully", response)
        );
    }
}