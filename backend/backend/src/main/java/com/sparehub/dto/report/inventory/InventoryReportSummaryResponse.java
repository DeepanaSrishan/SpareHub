package com.sparehub.dto.report.inventory;



import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InventoryReportSummaryResponse(

        long totalCategories,

        long totalProducts,

        long activeProducts,

        long inactiveProducts,

        long discontinuedProducts,

        long lowStockProducts,

        long outOfStockProducts,

        long totalStockQuantity,

        BigDecimal totalCostValue,

        BigDecimal totalSellingValue,

        BigDecimal potentialProfitValue,

        List<CategoryInventorySummaryResponse>
                categorySummaries,

        LocalDateTime generatedAt
) {
}
