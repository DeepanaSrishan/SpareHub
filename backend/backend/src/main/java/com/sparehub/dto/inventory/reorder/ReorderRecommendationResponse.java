package com.sparehub.dto.inventory.reorder;

import java.math.BigDecimal;
import java.util.List;

public record ReorderRecommendationResponse(
        Long sparePartId,
        String partNumber,
        String sparePartName,
        String brand,
        String categoryName,
        Integer currentStock,
        Integer reorderLevel,
        Integer netShortage,
        Integer pendingOrderedQuantity,
        Integer effectiveStock,
        Integer suggestedOrderQuantity,
        Long preferredSupplierId,
        String preferredSupplierCode,
        String preferredSupplierName,
        Long preferredSupplierProductId,
        BigDecimal unitPurchasePrice,
        BigDecimal estimatedTotalCost,
        Integer minimumOrderQuantity,
        Integer leadTimeDays,
        String recommendationReason,
        String urgencyStatus,
        List<AvailableSupplierOption> availableSuppliers
) {
    public record AvailableSupplierOption(
            Long supplierId,
            String supplierCode,
            String supplierName,
            Long supplierProductId,
            BigDecimal purchasePrice,
            Integer minimumOrderQuantity,
            Integer leadTimeDays,
            Boolean preferred
    ) {}
}
