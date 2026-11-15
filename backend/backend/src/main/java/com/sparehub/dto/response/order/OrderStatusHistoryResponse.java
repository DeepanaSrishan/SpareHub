package com.sparehub.dto.response.order;



import com.sparehub.enums.order.OrderStatus;

import java.time.LocalDateTime;

public record OrderStatusHistoryResponse(

        Long id,
        OrderStatus previousStatus,
        OrderStatus newStatus,
        String note,
        Long changedById,
        String changedByName,
        LocalDateTime changedAt
) {
}
