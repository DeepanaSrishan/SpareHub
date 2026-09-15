package com.sparehub.controller.supplier;



import com.sparehub.dto.request.supplier.CancelSupplierPurchaseRequest;
import com.sparehub.dto.request.supplier.CreateSupplierPurchaseRequest;
import com.sparehub.dto.request.supplier.ReceiveSupplierPurchaseRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.supplier.SupplierPurchaseResponse;
import com.sparehub.dto.request.*;
import com.sparehub.dto.response.*;
import com.sparehub.entity.supplier.PurchaseStatus;
import com.sparehub.service.supplier.SupplierPurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/supplier-purchases")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('INVENTORY_STAFF', 'MANAGER')"
)
public class SupplierPurchaseController {

    private final SupplierPurchaseService
            supplierPurchaseService;

    @PostMapping("/supplier/{supplierId}")
    public ResponseEntity<
            ApiResponse<SupplierPurchaseResponse>
            > createPurchase(
            @PathVariable Long supplierId,
            @Valid @RequestBody
            CreateSupplierPurchaseRequest request
    ) {
        SupplierPurchaseResponse response =
                supplierPurchaseService.createPurchase(
                        supplierId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Supplier purchase created successfully",
                                response
                        )
                );
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<
            ApiResponse<List<SupplierPurchaseResponse>>
            > getSupplierPurchases(
            @PathVariable Long supplierId,
            @RequestParam(required = false)
            PurchaseStatus status
    ) {
        List<SupplierPurchaseResponse> response =
                supplierPurchaseService.getPurchases(
                        supplierId,
                        status
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier purchases retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{purchaseId}")
    public ResponseEntity<
            ApiResponse<SupplierPurchaseResponse>
            > getPurchase(
            @PathVariable Long purchaseId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier purchase retrieved successfully",
                        supplierPurchaseService
                                .getPurchaseById(
                                        purchaseId
                                )
                )
        );
    }

    @PostMapping("/{purchaseId}/receive")
    public ResponseEntity<
            ApiResponse<SupplierPurchaseResponse>
            > receivePurchase(
            @PathVariable Long purchaseId,
            @Valid @RequestBody
            ReceiveSupplierPurchaseRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier purchase received and stock updated successfully",
                        supplierPurchaseService
                                .receivePurchase(
                                        purchaseId,
                                        request
                                )
                )
        );
    }

    @PostMapping("/{purchaseId}/cancel")
    public ResponseEntity<
            ApiResponse<SupplierPurchaseResponse>
            > cancelPurchase(
            @PathVariable Long purchaseId,
            @Valid @RequestBody
            CancelSupplierPurchaseRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier purchase cancelled successfully",
                        supplierPurchaseService
                                .cancelPurchase(
                                        purchaseId,
                                        request
                                )
                )
        );
    }
}