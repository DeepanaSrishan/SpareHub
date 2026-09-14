package com.sparehub.dto.report.inventory;



import com.sparehub.entity.inventory.SparePartStatus;

import java.math.BigDecimal;

public record InventoryStockReportResponse(

        Long sparePartId,

        String partNumber,

        String name,

        String brand,

        Long categoryId,

        String categoryName,

        BigDecimal costPrice,

        BigDecimal sellingPrice,

        Integer stockQuantity,

        Integer reorderLevel,

        boolean available,

        boolean lowStock,

        BigDecimal stockCostValue,

        BigDecimal stockSellingValue,

        BigDecimal potentialProfitValue,

        SparePartStatus status
) {
}