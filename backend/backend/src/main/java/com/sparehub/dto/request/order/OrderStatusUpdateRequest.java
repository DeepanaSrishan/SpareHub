package com.sparehub.dto.request.order;



import com.sparehub.enums.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderStatusUpdateRequest(

        @NotNull(message = "New order status is required")
        OrderStatus status,

        @Size(
                max = 500,
                message = "Staff note cannot exceed 500 characters"
        )
        String staffNote
) {
}