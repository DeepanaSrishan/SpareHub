package com.sparehub.controller.supplier;

import com.sparehub.dto.request.supplier.CreateSupplierRequest;
import com.sparehub.dto.request.supplier.UpdateSupplierRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.supplier.SupplierResponse;
import com.sparehub.dto.response.supplier.SupplierSummaryResponse;
import com.sparehub.service.supplier.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/suppliers", "/api/inventory/supplier-mgmt"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
public class SupplierController {

    private final SupplierService supplierService;

    /*
     * US-44: Add supplier information
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
            @Valid @RequestBody CreateSupplierRequest request
    ) {
        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier created successfully", response));
    }

    /*
     * US-46 & US-47: View suppliers & search suppliers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierSummaryResponse>>> getSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        String searchQuery = search != null && !search.isBlank() ? search : query;
        List<SupplierSummaryResponse> response;

        if (searchQuery != null && !searchQuery.isBlank()) {
            response = supplierService.searchSuppliers(searchQuery.trim());
        } else {
            response = supplierService.getAllSuppliers(activeOnly);
        }

        return ResponseEntity.ok(ApiResponse.success("Suppliers retrieved successfully", response));
    }

    /*
     * US-46: View supplier details
     */
    @GetMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(
            @PathVariable Long supplierId
    ) {
        SupplierResponse response = supplierService.getSupplierById(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier retrieved successfully", response));
    }

    /*
     * US-45: Update supplier information
     */
    @PutMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @PathVariable Long supplierId,
            @Valid @RequestBody UpdateSupplierRequest request
    ) {
        SupplierResponse response = supplierService.updateSupplier(supplierId, request);
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", response));
    }

    /*
     * Deactivate supplier
     */
    @PatchMapping("/{supplierId}/deactivate")
    public ResponseEntity<ApiResponse<SupplierResponse>> deactivateSupplier(
            @PathVariable Long supplierId
    ) {
        SupplierResponse response = supplierService.deactivateSupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier deactivated successfully", response));
    }

    /*
     * Activate supplier
     */
    @PatchMapping("/{supplierId}/activate")
    public ResponseEntity<ApiResponse<SupplierResponse>> activateSupplier(
            @PathVariable Long supplierId
    ) {
        SupplierResponse response = supplierService.activateSupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier activated successfully", response));
    }

    /*
     * Suspend supplier
     */
    @PatchMapping("/{supplierId}/suspend")
    public ResponseEntity<ApiResponse<SupplierResponse>> suspendSupplier(
            @PathVariable Long supplierId,
            @RequestParam(required = false) String reason
    ) {
        SupplierResponse response = supplierService.suspendSupplier(supplierId, reason);
        return ResponseEntity.ok(ApiResponse.success("Supplier suspended successfully", response));
    }

    /*
     * Update supplier status directly (ACTIVE, INACTIVE, SUSPENDED)
     */
    @PatchMapping("/{supplierId}/status")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplierStatus(
            @PathVariable Long supplierId,
            @RequestParam com.sparehub.entity.supplier.SupplierStatus status,
            @RequestParam(required = false) String reason
    ) {
        SupplierResponse response = supplierService.updateSupplierStatus(supplierId, status, reason);
        return ResponseEntity.ok(ApiResponse.success("Supplier status updated successfully", response));
    }
}
