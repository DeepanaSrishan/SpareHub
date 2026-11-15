package com.sparehub.dto.inventory.stock;



import com.sparehub.entity.inventory.InventoryTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockAdjustmentRequest(

        @NotNull(
                message = "Adjustment type is required"
        )
        InventoryTransactionType adjustmentType,

        @NotNull(
                message = "Adjustment quantity is required"
        )
        @Min(
                value = 1,
                message =
                        "Adjustment quantity must be greater than zero"
        )
        Integer quantity,

        @NotBlank(
                message =
                        "A reason is required for every stock adjustment"
        )
        @Size(
                min = 3,
                max = 500,
                message =
                        "Reason must contain between 3 and 500 characters"
        )
        String reason,

        @Size(
                max = 100,
                message =
                        "Reference number cannot exceed 100 characters"
        )
        String referenceNumber
) {
}