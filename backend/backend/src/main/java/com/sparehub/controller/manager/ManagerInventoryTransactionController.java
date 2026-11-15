package com.sparehub.controller.manager;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.stock.InventoryTransactionResponse;
import com.sparehub.entity.inventory.InventoryTransactionType;
import com.sparehub.service.inventory.InventoryTransactionService;
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
@RequestMapping("/api/manager/inventory-transactions")
@RequiredArgsConstructor
public class ManagerInventoryTransactionController {

    private final InventoryTransactionService
            inventoryTransactionService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<
                    Page<InventoryTransactionResponse>
                    >
            >
    getInventoryTransactionHistory(
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
        Page<InventoryTransactionResponse> history =
                inventoryTransactionService
                        .getAllTransactionHistory(
                                sparePartId,
                                type,
                                fromDate,
                                toDate,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Inventory transaction history retrieved successfully",
                        history
                )
        );
    }
}
