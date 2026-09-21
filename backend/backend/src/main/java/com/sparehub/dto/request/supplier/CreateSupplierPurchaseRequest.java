package com.sparehub.dto.request.supplier;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateSupplierPurchaseRequest(

        @NotNull(message = "Supplier product ID is required")
        Long supplierProductId,

        @NotNull(message = "Order quantity is required")
        @Min(
                value = 1,
                message = "Order quantity must be at least 1"
        )
        Integer quantity,

        LocalDate expectedDeliveryDate,

        @Size(
                max = 500,
                message = "Notes cannot exceed 500 characters"
        )
        String notes
) {
}
