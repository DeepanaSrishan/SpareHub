package com.sparehub.dto.inventory.sparepart;



import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SparePartCreateRequest(

        @NotBlank(message = "Part number is required")
        @Size(
                min = 2,
                max = 80,
                message =
                        "Part number must contain between 2 and 80 characters"
        )
        String partNumber,

        @NotBlank(message = "Spare-part name is required")
        @Size(
                min = 2,
                max = 150,
                message =
                        "Name must contain between 2 and 150 characters"
        )
        String name,

        @Size(
                max = 5000,
                message =
                        "Description cannot exceed 5000 characters"
        )
        String description,

        @NotBlank(message = "Brand is required")
        @Size(
                max = 100,
                message =
                        "Brand cannot exceed 100 characters"
        )
        String brand,

        @Size(
                max = 100,
                message =
                        "Vehicle make cannot exceed 100 characters"
        )
        String vehicleMake,

        @Size(
                max = 100,
                message =
                        "Vehicle model cannot exceed 100 characters"
        )
        String vehicleModel,

        @Size(
                max = 30,
                message =
                        "Manufacture year cannot exceed 30 characters"
        )
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

        @NotNull(message = "Initial stock quantity is required")
        @Min(
                value = 0,
                message =
                        "Initial stock quantity cannot be negative"
        )
        Integer stockQuantity,

        @NotNull(message = "Reorder level is required")
        @Min(
                value = 0,
                message =
                        "Reorder level cannot be negative"
        )
        Integer reorderLevel,

        @Size(
                max = 1000,
                message =
                        "Image URL cannot exceed 1000 characters"
        )
        String imageUrl,

        @NotNull(message = "Category ID is required")
        @Min(
                value = 1,
                message = "Invalid category ID"
        )
        Long categoryId
) {
}
