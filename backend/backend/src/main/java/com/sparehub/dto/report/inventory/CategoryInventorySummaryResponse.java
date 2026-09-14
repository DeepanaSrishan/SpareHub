package com.sparehub.dto.report.inventory;

import java.math.BigDecimal;

public record CategoryInventorySummaryResponse(

        Long categoryId,

        String categoryName,

        long totalProducts,

        long activeProducts,

        long lowStockProducts,

        long outOfStockProducts,

        long totalStockQuantity,

        BigDecimal totalCostValue,

        BigDecimal totalSellingValue
) {
}