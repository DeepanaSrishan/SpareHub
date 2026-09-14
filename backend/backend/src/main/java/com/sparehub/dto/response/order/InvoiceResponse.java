package com.sparehub.dto.response.order;



import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponse(

        Long invoiceId,
        String invoiceNumber,
        LocalDateTime generatedAt,

        Long orderId,
        String orderNumber,
        LocalDateTime orderDate,

        Long customerId,
        String customerName,
        String customerEmail,

        List<OrderItemResponse> items,

        BigDecimal subtotal,
        BigDecimal discountPercentage,
        BigDecimal discountAmount,
        BigDecimal totalAmount,

        BigDecimal paidAmount,
        BigDecimal remainingAmount,

        OrderStatus orderStatus,
        PaymentStatus paymentStatus,

        Long generatedById,
        String generatedByName
) {
}
