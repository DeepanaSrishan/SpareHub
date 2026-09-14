package com.sparehub.dto.response.order;



import java.math.BigDecimal;

public record CartItemResponse(

        Long cartItemId,
        Long sparePartId,
        String partNumber,
        String productName,
        String brand,
        String imageUrl,
        BigDecimal unitPrice,
        Integer quantity,
        Integer availableStock,
        BigDecimal subtotal,
        Boolean available
) {
}
