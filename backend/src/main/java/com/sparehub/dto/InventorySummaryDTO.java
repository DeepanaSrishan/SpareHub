package com.sparehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryDTO {
    
    private Long totalSpareParts;
    private Long activeSpareParts;
    private Long totalStockQuantity;
    private Long lowStockCount;
    private Long outOfStockCount;
    private BigDecimal totalStockValue;
}
