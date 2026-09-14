package com.sparehub.dto.supplier;



import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateSupplierProductRequest(

        @Size(
                max = 100,
                message = "Supplier part number cannot exceed 100 characters"
        )
        String supplierPartNumber,

        @NotNull(message = "Purchase price is required")
        @DecimalMin(
                value = "0.01",
                message = "Purchase price must be greater than zero"
        )
        BigDecimal purchasePrice,

        @NotNull(message = "Minimum order quantity is required")
        @Min(
                value = 1,
                message = "Minimum order quantity must be at least 1"
        )
        Integer minimumOrderQuantity,

        @NotNull(message = "Lead time is required")
        @Min(
                value = 0,
                message = "Lead time cannot be negative"
        )
        Integer leadTimeDays,

        @NotNull(message = "Warranty period is required")
        @Min(
                value = 0,
                message = "Warranty period cannot be negative"
        )
        Integer warrantyMonths,

        Boolean preferred
) {
}