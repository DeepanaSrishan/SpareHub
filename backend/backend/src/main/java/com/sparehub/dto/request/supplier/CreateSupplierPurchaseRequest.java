package com.sparehub.dto.request.supplier;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateSupplierPurchaseRequest(
        Long supplierId,

        Long supplierProductId,

        Integer quantity,

        Integer orderedQuantity,

        LocalDate expectedDeliveryDate,

        String supplierInvoiceNumber,

        @Size(
                max = 500,
                message = "Notes cannot exceed 500 characters"
        )
        String notes
) {
    public Integer getEffectiveQuantity() {
        if (quantity != null && quantity > 0) {
            return quantity;
        }
        if (orderedQuantity != null && orderedQuantity > 0) {
            return orderedQuantity;
        }
        return 1;
    }
}
