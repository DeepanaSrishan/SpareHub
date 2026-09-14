package com.sparehub.service.order;



import com.sparehub.dto.request.order.PlaceOrderRequest;
import com.sparehub.dto.response.order.OrderResponse;

import com.sparehub.dto.response.order.OrderStatusHistoryResponse;

import com.sparehub.dto.request.order.CancellationRequest;
import com.sparehub.dto.response.order.PaymentStatusResponse;

import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(PlaceOrderRequest request);

    List<OrderResponse> getMyOrders();

    List<OrderStatusHistoryResponse> getMyOrderStatusHistory(
            Long orderId
    );

    OrderResponse getMyOrderById(Long orderId);

    OrderResponse getMyOrderByNumber(String orderNumber);

    PaymentStatusResponse getMyOrderPaymentStatus(
            Long orderId
    );

    OrderResponse requestCancellation(
            Long orderId,
            CancellationRequest request
    );
}