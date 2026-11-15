package com.sparehub.dto.response.order;



import java.math.BigDecimal;
import java.util.List;

public record CartResponse(

        Long cartId,
        Long customerId,
        String customerName,
        String customerEmail,
        List<CartItemResponse> items,
        Integer totalItemTypes,
        Integer totalQuantity,
        BigDecimal subtotal
) {
}
