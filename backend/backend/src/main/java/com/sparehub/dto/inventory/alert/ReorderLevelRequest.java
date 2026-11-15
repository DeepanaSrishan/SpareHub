package com.sparehub.dto.inventory.alert;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReorderLevelRequest(

        @NotNull(
                message = "Reorder level is required"
        )
        @Min(
                value = 0,
                message =
                        "Reorder level cannot be negative"
        )
        Integer reorderLevel
) {
}
