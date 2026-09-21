package com.sparehub.dto.response.supplier;



import java.math.BigDecimal;
import java.util.List;

public record PriceComparisonResponse(

        Long sparePartId,
        String partNumber,
        String productName,
        BigDecimal sellingPrice,
        BigDecimal lowestPurchasePrice,
        BigDecimal highestPurchasePrice,
        Integer activeSupplierCount,
        List<SupplierProductResponse> suppliers
) {
}
