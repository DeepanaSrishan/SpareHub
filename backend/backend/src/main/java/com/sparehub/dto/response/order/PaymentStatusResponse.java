package com.sparehub.dto.response.order;



import com.sparehub.enums.order.PaymentStatus;

import java.math.BigDecimal;

public record PaymentStatusResponse(

        Long orderId,
        String orderNumber,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        PaymentStatus paymentStatus
) {
}