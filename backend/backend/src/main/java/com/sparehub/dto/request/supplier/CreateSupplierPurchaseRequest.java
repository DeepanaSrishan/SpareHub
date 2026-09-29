package com.sparehub.dto.request.supplier;

<<<<<<< HEAD
=======


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateSupplierPurchaseRequest(
<<<<<<< HEAD
        Long supplierId,

        Long supplierProductId,

        Integer quantity,

        Integer orderedQuantity,

        LocalDate expectedDeliveryDate,

        String supplierInvoiceNumber,

=======

        @NotNull(message = "Supplier product ID is required")
        Long supplierProductId,

        @NotNull(message = "Order quantity is required")
        @Min(
                value = 1,
                message = "Order quantity must be at least 1"
        )
        Integer quantity,

        LocalDate expectedDeliveryDate,

>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
        @Size(
                max = 500,
                message = "Notes cannot exceed 500 characters"
        )
        String notes
) {
<<<<<<< HEAD
    public Integer getEffectiveQuantity() {
        if (quantity != null && quantity > 0) {
            return quantity;
        }
        if (orderedQuantity != null && orderedQuantity > 0) {
            return orderedQuantity;
        }
        return 1;
    }
=======
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
}
