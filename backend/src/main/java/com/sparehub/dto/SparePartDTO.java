package com.sparehub.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartDTO {
    
    private Long id;
    
    @NotBlank(message = "Part number is required")
    @Size(max = 50, message = "Part number must not exceed 50 characters")
    private String partNumber;
    
    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotBlank(message = "Brand is required")
    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    private Long subCategoryId;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price must be greater than or equal to 0")
    private BigDecimal price;
    
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;
    
    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    private Boolean active;
    
    private String categoryName;
    private String subCategoryName;
    private String availabilityStatus;
}
