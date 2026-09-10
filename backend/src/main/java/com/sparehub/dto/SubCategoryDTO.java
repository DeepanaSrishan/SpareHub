package com.sparehub.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryDTO {
    
    private Long id;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    @NotBlank(message = "Sub-category name is required")
    @Size(max = 100, message = "Sub-category name must not exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private Boolean active;
    
    private String categoryName;
}
