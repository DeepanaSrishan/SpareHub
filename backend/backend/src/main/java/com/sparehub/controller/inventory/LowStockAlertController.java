package com.sparehub.controller.inventory;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.alert.LowStockAlertResponse;
import com.sparehub.dto.inventory.alert.LowStockDashboardResponse;
import com.sparehub.dto.inventory.alert.LowStockResponse;
import com.sparehub.dto.inventory.alert.ReorderLevelRequest;
import com.sparehub.entity.inventory.InventoryAlertStatus;
import com.sparehub.service.inventory.LowStockAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class LowStockAlertController {

    private final LowStockAlertService
            lowStockAlertService;

    @PatchMapping(
            "/spare-parts/{sparePartId}/reorder-level"
    )
    public ResponseEntity<
            ApiResponse<LowStockResponse>
            >
    updateReorderLevel(
            @PathVariable
            Long sparePartId,

            @Valid
            @RequestBody
            ReorderLevelRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Reorder level updated successfully",
                        lowStockAlertService
                                .updateReorderLevel(
                                        sparePartId,
                                        request
                                )
                )
        );
    }

    @GetMapping("/low-stock")
    public ResponseEntity<
            ApiResponse<List<LowStockResponse>>
            >
    getLowStockProducts() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Low-stock products retrieved successfully",
                        lowStockAlertService
                                .getLowStockProducts()
                )
        );
    }

    @GetMapping("/low-stock/dashboard")
    public ResponseEntity<
            ApiResponse<LowStockDashboardResponse>
            >
    getLowStockDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Low-stock dashboard retrieved successfully",
                        lowStockAlertService
                                .getLowStockDashboard()
                )
        );
    }

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<
            ApiResponse<
                    Page<LowStockAlertResponse>
                    >
            >
    getLowStockAlerts(
            @RequestParam(required = false)
            InventoryAlertStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Low-stock alerts retrieved successfully",
                        lowStockAlertService.getAlerts(
                                status,
                                page,
                                size
                        )
                )
        );
    }

    @PatchMapping(
            "/low-stock-alerts/{alertId}/acknowledge"
    )
    public ResponseEntity<
            ApiResponse<LowStockAlertResponse>
            >
    acknowledgeAlert(
            @PathVariable Long alertId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Low-stock alert acknowledged successfully",
                        lowStockAlertService
                                .acknowledgeAlert(
                                        alertId
                                )
                )
        );
    }

    /*
     * Existing products සඳහා alerts initialize
     * කරන්න one-time/manual endpoint එකක්.
     */
    @PostMapping("/low-stock-alerts/evaluate")
    public ResponseEntity<ApiResponse<Void>>
    evaluateAllSpareParts() {
        lowStockAlertService
                .evaluateAllSpareParts();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Low-stock evaluation completed successfully",
                        null
                )
        );
    }
}