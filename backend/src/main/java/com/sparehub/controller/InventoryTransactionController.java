package com.sparehub.controller;

import com.sparehub.dto.InventoryTransactionDTO;
import com.sparehub.service.InventoryTransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/inventory/transactions")
public class InventoryTransactionController {

    private final InventoryTransactionService inventoryTransactionService;

    public InventoryTransactionController(InventoryTransactionService inventoryTransactionService) {
        this.inventoryTransactionService = inventoryTransactionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<InventoryTransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(inventoryTransactionService.getAllTransactions());
    }

    @GetMapping("/spare-part/{sparePartId}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<InventoryTransactionDTO>> getTransactionsBySparePart(@PathVariable Long sparePartId) {
        return ResponseEntity.ok(inventoryTransactionService.getTransactionsBySparePart(sparePartId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<InventoryTransactionDTO>> getTransactionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(inventoryTransactionService.getTransactionsByUser(userId));
    }

    @GetMapping("/type/{transactionType}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<InventoryTransactionDTO>> getTransactionsByType(@PathVariable String transactionType) {
        return ResponseEntity.ok(inventoryTransactionService.getTransactionsByType(transactionType));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<InventoryTransactionDTO>> filterTransactions(
            @RequestParam(required = false) Long sparePartId,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(inventoryTransactionService.filterTransactions(sparePartId, transactionType, startDate, endDate));
    }
}
