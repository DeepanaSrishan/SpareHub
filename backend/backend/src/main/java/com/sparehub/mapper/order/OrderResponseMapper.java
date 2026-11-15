package com.sparehub.mapper.order;



import com.sparehub.dto.response.order.OrderItemResponse;
import com.sparehub.dto.response.order.OrderResponse;
import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderResponseMapper {

    public OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(item -> new OrderItemResponse(
                                item.getId(),
                                item.getSparePart().getId(),
                                item.getPartNumber(),
                                item.getProductName(),
                                item.getUnitPrice(),
                                item.getQuantity(),
                                item.getSubtotal()
                        ))
                        .toList();

        int totalQuantity = itemResponses
                .stream()
                .mapToInt(OrderItemResponse::quantity)
                .sum();

        User customer = order.getCustomer();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),

                customer.getId(),
                getCustomerName(customer),
                customer.getEmail(),

                itemResponses,

                itemResponses.size(),
                totalQuantity,

                order.getSubtotal(),
                order.getDiscountPercentage(),
                order.getDiscountAmount(),
                order.getTaxRate() != null ? order.getTaxRate() : java.math.BigDecimal.ZERO.setScale(2, java.math.RoundingMode.HALF_UP),
                order.getTaxAmount() != null ? order.getTaxAmount() : java.math.BigDecimal.ZERO.setScale(2, java.math.RoundingMode.HALF_UP),
                order.getTotalAmount(),

                order.getOrderStatus(),
                order.getPaymentStatus(),

                order.getCustomerNote(),
                order.getStaffNote(),
                order.getCancellationReason(),
                order.getCancellationDecisionNote(),
                order.getRejectionReason(),

                order.getCreatedAt(),
                order.getConfirmedAt(),
                order.getCompletedAt(),
                order.getCancellationRequestedAt(),
                order.getCancellationProcessedAt(),
                order.getCancelledAt(),
                order.getUpdatedAt()
        );
    }

    private String getCustomerName(User customer) {
        if (customer == null
                || customer.getFullName() == null) {
            return "";
        }

        return customer.getFullName().trim();
    }
}
