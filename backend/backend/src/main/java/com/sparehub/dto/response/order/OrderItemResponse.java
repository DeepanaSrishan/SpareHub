package com.sparehub.dto.response.order;



import java.math.BigDecimal;

public record OrderItemResponse(

        Long orderItemId,
        Long sparePartId,
        String partNumber,
        String productName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subtotal
) {
}
