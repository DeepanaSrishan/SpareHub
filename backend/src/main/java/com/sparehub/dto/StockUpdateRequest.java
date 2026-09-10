package com.sparehub.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {
    
    @NotNull(message = "Quantity is required")
    @Min(value = -10000, message = "Quantity change cannot be less than -10000")
    @Max(value = 10000, message = "Quantity change cannot exceed 10000")
    private Integer quantity;
    
    @NotBlank(message = "Transaction type is required")
    private String transactionType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE, LOSS, CORRECTION
    
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
