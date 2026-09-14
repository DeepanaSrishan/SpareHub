package com.sparehub.controller.supplier;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.supplier.SupplierTransactionResponse;
import com.sparehub.entity.supplier.SupplierTransactionType;
import com.sparehub.service.supplier.SupplierPurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/manager/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagerSupplierTransactionController {

    private final SupplierPurchaseService
            supplierPurchaseService;

    @GetMapping("/{supplierId}/transactions")
    public ResponseEntity<
            ApiResponse<List<SupplierTransactionResponse>>
            > getSupplierTransactions(
            @PathVariable Long supplierId,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate,

            @RequestParam(required = false)
            SupplierTransactionType type
    ) {
        List<SupplierTransactionResponse> response =
                supplierPurchaseService
                        .getSupplierTransactionHistory(
                                supplierId,
                                startDate,
                                endDate,
                                type
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier transaction history retrieved successfully",
                        response
                )
        );
    }
}
