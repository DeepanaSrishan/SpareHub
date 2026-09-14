package com.sparehub.controller.manager;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.stock.InventoryTransactionResponse;
import com.sparehub.dto.report.inventory.InventoryMovementSummaryResponse;
import com.sparehub.dto.report.inventory.InventoryReportSummaryResponse;
import com.sparehub.dto.report.inventory.InventoryStockReportResponse;
import com.sparehub.entity.inventory.InventoryTransactionType;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.service.report.InventoryReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/manager/reports/inventory")
@RequiredArgsConstructor
public class InventoryReportController {

    private final InventoryReportService
            inventoryReportService;

    @GetMapping("/summary")
    public ResponseEntity<
            ApiResponse<
                    InventoryReportSummaryResponse
                    >
            >
    getInventorySummary() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Inventory summary generated successfully",
                        inventoryReportService
                                .getInventorySummary()
                )
        );
    }

    @GetMapping("/stock")
    public ResponseEntity<
            ApiResponse<
                    Page<InventoryStockReportResponse>
                    >
            >
    getStockReport(
            @RequestParam(defaultValue = "")
            String search,

            @RequestParam(required = false)
            SparePartStatus status,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            Boolean lowStock,

            @RequestParam(required = false)
            Boolean available,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            @RequestParam(defaultValue = "name")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Inventory stock report generated successfully",
                        inventoryReportService
                                .getStockReport(
                                        search,
                                        status,
                                        categoryId,
                                        lowStock,
                                        available,
                                        page,
                                        size,
                                        sortBy,
                                        direction
                                )
                )
        );
    }

    @GetMapping("/movements")
    public ResponseEntity<
            ApiResponse<
                    InventoryMovementSummaryResponse
                    >
            >
    getMovementSummary(
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate toDate
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Inventory movement summary generated successfully",
                        inventoryReportService
                                .getMovementSummary(
                                        fromDate,
                                        toDate
                                )
                )
        );
    }

    @GetMapping("/transactions")
    public ResponseEntity<
            ApiResponse<
                    Page<InventoryTransactionResponse>
                    >
            >
    getTransactionReport(
            @RequestParam(required = false)
            Long sparePartId,

            @RequestParam(required = false)
            InventoryTransactionType type,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate toDate,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Inventory transaction report generated successfully",
                        inventoryReportService
                                .getTransactionReport(
                                        sparePartId,
                                        type,
                                        fromDate,
                                        toDate,
                                        page,
                                        size
                                )
                )
        );
    }
}