package com.sparehub.controller.supplier;



import com.sparehub.dto.request.supplier.AssignSupplierProductRequest;
import com.sparehub.dto.request.supplier.UpdateSupplierProductRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.supplier.PriceComparisonResponse;
import com.sparehub.dto.response.supplier.SupplierProductResponse;
import com.sparehub.service.supplier.SupplierProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/inventory/suppliers", "/api/suppliers"})
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('INVENTORY_STAFF', 'MANAGER')"
)
public class SupplierProductController {

    private final SupplierProductService
            supplierProductService;

    /*
     * US-48: Assign product to supplier
     */
    @PostMapping("/{supplierId}/products")
    public ResponseEntity<
            ApiResponse<SupplierProductResponse>
            > assignProduct(
            @PathVariable Long supplierId,
            @Valid @RequestBody
            AssignSupplierProductRequest request
    ) {
        SupplierProductResponse response =
                supplierProductService.assignProduct(
                        supplierId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Product assigned to supplier successfully",
                                response
                        )
                );
    }

    /*
     * View supplier products
     */
    @GetMapping("/{supplierId}/products")
    public ResponseEntity<
            ApiResponse<List<SupplierProductResponse>>
            > getSupplierProducts(
            @PathVariable Long supplierId,

            @RequestParam(
                    required = false,
                    defaultValue = "false"
            )
            Boolean activeOnly
    ) {
        List<SupplierProductResponse> response =
                supplierProductService
                        .getSupplierProducts(
                                supplierId,
                                activeOnly
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier products retrieved successfully",
                        response
                )
        );
    }

    /*
     * View one supplier-product relationship
     */
    @GetMapping(
            "/{supplierId}/products/{supplierProductId}"
    )
    public ResponseEntity<
            ApiResponse<SupplierProductResponse>
            > getSupplierProduct(
            @PathVariable Long supplierId,
            @PathVariable Long supplierProductId
    ) {
        SupplierProductResponse response =
                supplierProductService
                        .getSupplierProductById(
                                supplierId,
                                supplierProductId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier product retrieved successfully",
                        response
                )
        );
    }

    /*
     * US-49: Update supplier price and conditions
     */
    @PutMapping(
            "/{supplierId}/products/{supplierProductId}"
    )
    public ResponseEntity<
            ApiResponse<SupplierProductResponse>
            > updateSupplierProduct(
            @PathVariable Long supplierId,
            @PathVariable Long supplierProductId,
            @Valid @RequestBody
            UpdateSupplierProductRequest request
    ) {
        SupplierProductResponse response =
                supplierProductService
                        .updateSupplierProduct(
                                supplierId,
                                supplierProductId,
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier product updated successfully",
                        response
                )
        );
    }

    @PatchMapping(
            "/{supplierId}/products/{supplierProductId}/deactivate"
    )
    public ResponseEntity<
            ApiResponse<SupplierProductResponse>
            > deactivateSupplierProduct(
            @PathVariable Long supplierId,
            @PathVariable Long supplierProductId
    ) {
        SupplierProductResponse response =
                supplierProductService
                        .deactivateSupplierProduct(
                                supplierId,
                                supplierProductId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier product deactivated successfully",
                        response
                )
        );
    }

    @PatchMapping(
            "/{supplierId}/products/{supplierProductId}/activate"
    )
    public ResponseEntity<
            ApiResponse<SupplierProductResponse>
            > activateSupplierProduct(
            @PathVariable Long supplierId,
            @PathVariable Long supplierProductId
    ) {
        SupplierProductResponse response =
                supplierProductService
                        .activateSupplierProduct(
                                supplierId,
                                supplierProductId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier product activated successfully",
                        response
                )
        );
    }

    @PatchMapping(
            "/{supplierId}/products/{supplierProductId}/preferred"
    )
    public ResponseEntity<
            ApiResponse<SupplierProductResponse>
            > setPreferredSupplier(
            @PathVariable Long supplierId,
            @PathVariable Long supplierProductId
    ) {
        SupplierProductResponse response =
                supplierProductService
                        .setPreferredSupplier(
                                supplierId,
                                supplierProductId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Preferred supplier updated successfully",
                        response
                )
        );
    }

    /*
     * Compare supplier prices for one spare part
     */
    @GetMapping(
            "/price-comparison/{sparePartId}"
    )
    public ResponseEntity<
            ApiResponse<PriceComparisonResponse>
            > comparePrices(
            @PathVariable Long sparePartId
    ) {
        PriceComparisonResponse response =
                supplierProductService
                        .compareSupplierPrices(
                                sparePartId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier prices compared successfully",
                        response
                )
        );
    }
}