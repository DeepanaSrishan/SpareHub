package com.sparehub.controller.inventory;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.stock.InventoryTransactionResponse;
import com.sparehub.dto.inventory.stock.StockAdjustmentRequest;
import com.sparehub.dto.inventory.stock.StockSummaryResponse;
import com.sparehub.service.inventory.InventoryTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/spare-parts")
@RequiredArgsConstructor
public class InventoryTransactionController {

    private final InventoryTransactionService
            inventoryTransactionService;

    @PostMapping("/{sparePartId}/stock-adjustments")
    public ResponseEntity<
            ApiResponse<StockSummaryResponse>
            >
    adjustStock(
            @PathVariable Long sparePartId,

            @Valid
            @RequestBody
            StockAdjustmentRequest request
    ) {
        StockSummaryResponse response =
                inventoryTransactionService
                        .adjustStock(
                                sparePartId,
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Stock adjusted successfully",
                        response
                )
        );
    }

    @GetMapping("/{sparePartId}/transactions")
    public ResponseEntity<
            ApiResponse<
                    Page<InventoryTransactionResponse>
                    >
            >
    getSparePartTransactionHistory(
            @PathVariable Long sparePartId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        Page<InventoryTransactionResponse> history =
                inventoryTransactionService
                        .getSparePartTransactionHistory(
                                sparePartId,
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
