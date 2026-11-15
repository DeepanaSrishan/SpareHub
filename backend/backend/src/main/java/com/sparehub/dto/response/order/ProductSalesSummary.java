package com.sparehub.dto.response.order;



import java.math.BigDecimal;

public record ProductSalesSummary(

        Long sparePartId,
        String partNumber,
        String productName,
        Integer quantitySold,
        BigDecimal salesAmount
) {
}
