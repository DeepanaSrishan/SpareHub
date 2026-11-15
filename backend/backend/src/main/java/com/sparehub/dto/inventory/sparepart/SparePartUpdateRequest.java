package com.sparehub.dto.inventory.sparepart;



import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SparePartUpdateRequest(

        @NotBlank(message = "Part number is required")
        @Size(min = 2, max = 80)
        String partNumber,

        @NotBlank(message = "Spare-part name is required")
        @Size(min = 2, max = 150)
        String name,

        @Size(max = 5000)
        String description,

        @NotBlank(message = "Brand is required")
        @Size(max = 100)
        String brand,

        @Size(max = 100)
        String vehicleMake,

        @Size(max = 100)
        String vehicleModel,

        @Size(max = 30)
        String manufactureYear,

        @NotNull(message = "Cost price is required")
        @DecimalMin(
                value = "0.00",
                inclusive = true,
                message = "Cost price cannot be negative"
        )
        BigDecimal costPrice,

        @NotNull(message = "Selling price is required")
        @DecimalMin(
                value = "0.01",
                message =
                        "Selling price must be greater than zero"
        )
        BigDecimal sellingPrice,

        @NotNull(message = "Reorder level is required")
        @Min(
                value = 0,
                message =
                        "Reorder level cannot be negative"
        )
        Integer reorderLevel,

        @Size(max = 1000)
        String imageUrl,

        @NotNull(message = "Category ID is required")
        @Min(value = 1, message = "Invalid category ID")
        Long categoryId
) {
}
