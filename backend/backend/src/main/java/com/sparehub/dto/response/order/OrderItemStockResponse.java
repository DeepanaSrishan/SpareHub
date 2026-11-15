package com.sparehub.dto.response.order;

public record OrderItemStockResponse(

        Long sparePartId,
        String partNumber,
        String productName,
        Integer requestedQuantity,
        Integer availableQuantity,
        Boolean productActive,
        Boolean sufficientStock,
        String message
) {
}
