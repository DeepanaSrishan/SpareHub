package com.sparehub.service.order;



import com.sparehub.dto.request.order.ConfirmOrderRequest;
import com.sparehub.dto.request.order.OrderStatusUpdateRequest;
import com.sparehub.dto.request.order.RejectOrderRequest;
import com.sparehub.dto.response.order.OrderResponse;
import com.sparehub.dto.response.order.OrderStatusHistoryResponse;
import com.sparehub.dto.response.order.StockVerificationResponse;
import com.sparehub.enums.order.OrderStatus;

import java.util.List;
import com.sparehub.dto.request.order.ApproveCancellationRequest;
import com.sparehub.dto.request.order.RejectCancellationRequest;
import com.sparehub.dto.response.order.CancellationProcessResponse;

public interface StaffOrderService {

    List<OrderResponse> getAllOrders(
            OrderStatus status
    );

    OrderResponse getOrderById(Long orderId);

    StockVerificationResponse verifyOrderStock(
            Long orderId
    );

    OrderResponse confirmOrder(
            Long orderId,
            ConfirmOrderRequest request
    );

    OrderResponse rejectOrder(
            Long orderId,
            RejectOrderRequest request
    );

    OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatusUpdateRequest request
    );

    List<OrderStatusHistoryResponse> getOrderStatusHistory(
            Long orderId
    );
    CancellationProcessResponse approveCancellation(
            Long orderId,
            ApproveCancellationRequest request
    );

    OrderResponse rejectCancellation(
            Long orderId,
            RejectCancellationRequest request
    );
}