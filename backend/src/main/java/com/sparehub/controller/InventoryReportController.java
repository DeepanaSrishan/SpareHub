package com.sparehub.controller;

import com.sparehub.dto.InventorySummaryDTO;
import com.sparehub.service.InventoryReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory/reports")
public class InventoryReportController {

    private final InventoryReportService inventoryReportService;

    public InventoryReportController(InventoryReportService inventoryReportService) {
        this.inventoryReportService = inventoryReportService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<InventorySummaryDTO> getInventoryReports() {
        return ResponseEntity.ok(inventoryReportService.getInventorySummary());
    }
}
