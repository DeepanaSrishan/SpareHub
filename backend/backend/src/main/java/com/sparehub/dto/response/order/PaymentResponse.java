package com.sparehub.dto.response.order;



import com.sparehub.enums.order.PaymentMethod;
import com.sparehub.enums.order.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(

        Long paymentId,
        String paymentReference,

        Long orderId,
        String orderNumber,

        BigDecimal amount,
        PaymentMethod paymentMethod,
        PaymentStatus status,

        String externalReference,
        String note,

        Long recordedById,
        String recordedByName,

        LocalDateTime createdAt,
        LocalDateTime paidAt
) {
}
