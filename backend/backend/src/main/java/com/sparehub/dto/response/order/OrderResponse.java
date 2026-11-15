package com.sparehub.dto.response.order;



import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(

        Long orderId,
        String orderNumber,

        Long customerId,
        String customerName,
        String customerEmail,

        List<OrderItemResponse> items,

        Integer totalItemTypes,
        Integer totalQuantity,

        BigDecimal subtotal,
        BigDecimal discountPercentage,
        BigDecimal discountAmount,
        BigDecimal taxRate,
        BigDecimal taxAmount,
        BigDecimal totalAmount,

        OrderStatus orderStatus,
        PaymentStatus paymentStatus,

        String customerNote,
        String staffNote,
        String cancellationReason,
        String cancellationDecisionNote,
        String rejectionReason,

        LocalDateTime createdAt,
        LocalDateTime confirmedAt,
        LocalDateTime completedAt,
        LocalDateTime cancellationRequestedAt,
        LocalDateTime cancellationProcessedAt,
        LocalDateTime cancelledAt,
        LocalDateTime updatedAt
) {
}