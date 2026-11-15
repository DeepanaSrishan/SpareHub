package com.sparehub.dto.response.order;


import java.util.List;

public record StockVerificationResponse(

        Long orderId,
        String orderNumber,
        Boolean allItemsAvailable,
        List<OrderItemStockResponse> items
) {
}
