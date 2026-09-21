package com.sparehub.dto.response.supplier;



import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SupplierProductResponse(

        Long supplierProductId,

        Long supplierId,
        String supplierCode,
        String supplierCompanyName,
        Boolean supplierActive,

        Long sparePartId,
        String partNumber,
        String productName,
        String brand,
        BigDecimal sellingPrice,

        String supplierPartNumber,
        BigDecimal purchasePrice,
        BigDecimal estimatedProfit,
        BigDecimal profitMarginPercentage,

        Integer minimumOrderQuantity,
        Integer leadTimeDays,
        Integer warrantyMonths,

        Boolean preferred,
        Boolean active,

        LocalDateTime lastPriceUpdatedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
