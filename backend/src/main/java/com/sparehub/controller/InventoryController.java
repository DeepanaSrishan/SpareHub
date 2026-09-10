package com.sparehub.controller;

import com.sparehub.dto.SparePartDTO;
import com.sparehub.dto.StockUpdateRequest;
import com.sparehub.entity.User;
import com.sparehub.service.AuthService;
import com.sparehub.service.InventoryService;
import com.sparehub.service.SparePartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final SparePartService sparePartService;
    private final AuthService authService;

    public InventoryController(InventoryService inventoryService, SparePartService sparePartService, AuthService authService) {
        this.inventoryService = inventoryService;
        this.sparePartService = sparePartService;
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<SparePartDTO>> getInventoryOverview() {
        return ResponseEntity.ok(sparePartService.getAllSpareParts());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<SparePartDTO>> getLowStockItems() {
        return ResponseEntity.ok(sparePartService.filterSpareParts(null, null, null, null, null, "LOW_STOCK", true));
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<List<SparePartDTO>> getOutOfStockItems() {
        return ResponseEntity.ok(sparePartService.filterSpareParts(null, null, null, null, null, "OUT_OF_STOCK", true));
    }

    @PatchMapping("/{sparePartId}/stock")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<SparePartDTO> updateStock(
            @PathVariable Long sparePartId,
            @Valid @RequestBody StockUpdateRequest stockUpdateRequest) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(inventoryService.updateStock(sparePartId, stockUpdateRequest, currentUser));
    }
}
