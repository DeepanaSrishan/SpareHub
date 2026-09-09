package com.sparehub.backend.controller;

import com.sparehub.backend.dto.AssignLoyaltyTierRequest;
import com.sparehub.backend.dto.CustomerSummaryDto;
import com.sparehub.backend.dto.OrderDto;
import com.sparehub.backend.service.LoyaltyService;
import com.sparehub.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerManagementController {

    private final LoyaltyService loyaltyService;
    private final OrderService orderService;

    public CustomerManagementController(LoyaltyService loyaltyService, OrderService orderService) {
        this.loyaltyService = loyaltyService;
        this.orderService = orderService;
    }

    // US-05: Sales Staff views customers with spend & loyalty tier
    @GetMapping
    public ResponseEntity<List<CustomerSummaryDto>> getCustomers(
            @RequestParam(value = "query", required = false) String query) {
        List<CustomerSummaryDto> customers = loyaltyService.searchCustomers(query);
        return ResponseEntity.ok(customers);
    }

    // US-05: Sales Staff manually assigns loyalty tier to customer
    @PutMapping("/{id}/loyalty-tier")
    public ResponseEntity<CustomerSummaryDto> assignLoyaltyTier(
            @PathVariable Integer id,
            @Valid @RequestBody AssignLoyaltyTierRequest request) {
        CustomerSummaryDto updated = loyaltyService.assignLoyaltyTier(id, request.getTierId());
        return ResponseEntity.ok(updated);
    }

    // US-05: Sales Staff auto-evaluates and promotes loyalty tier based on spend
    @PostMapping("/{id}/auto-tier")
    public ResponseEntity<CustomerSummaryDto> autoAssignTier(@PathVariable Integer id) {
        CustomerSummaryDto updated = loyaltyService.autoAssignTierBasedOnSpend(id);
        return ResponseEntity.ok(updated);
    }

    // US-09: Sales Staff views customer previous orders & transactions
    @GetMapping("/{id}/orders")
    public ResponseEntity<List<OrderDto>> getCustomerOrders(@PathVariable Integer id) {
        List<OrderDto> orders = orderService.getCustomerOrders(id);
        return ResponseEntity.ok(orders);
    }

    // US-09: Sales Staff views customer transaction metrics
    @GetMapping("/{id}/summary")
    public ResponseEntity<Map<String, Object>> getCustomerSummary(@PathVariable Integer id) {
        Map<String, Object> summary = orderService.getCustomerTransactionSummary(id);
        return ResponseEntity.ok(summary);
    }
}
