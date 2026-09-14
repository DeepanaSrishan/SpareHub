package com.sparehub.dto.response.order;



import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RefundResponse(

        Long refundId,
        String refundReference,
        Long orderId,
        String orderNumber,
        BigDecimal amount,
        String reason,
        Long processedById,
        String processedByName,
        LocalDateTime createdAt
) {
}
