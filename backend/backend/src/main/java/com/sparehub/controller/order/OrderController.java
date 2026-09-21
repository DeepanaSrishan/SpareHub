package com.sparehub.controller.order;





import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.request.order.CancellationRequest;
import com.sparehub.dto.request.order.CustomerPaymentRequest;
import com.sparehub.dto.request.order.PlaceOrderRequest;
import com.sparehub.dto.response.order.*;
import com.sparehub.service.order.BillingService;
import com.sparehub.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sparehub.dto.response.order.RefundResponse;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class OrderController {

    private final OrderService orderService;
    private final BillingService billingService;

    /*
     * US-29, US-32
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        OrderResponse response =
                orderService.placeOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Order placed successfully",
                                response
                        )
                );
    }

    /*
     * US-38: Customer order history
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>>
    getMyOrders() {
        List<OrderResponse> response =
                orderService.getMyOrders();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order history retrieved successfully",
                        response
                )
        );
    }

    /*
     * US-37: Customer order details and order status
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>>
    getMyOrderById(
            @PathVariable Long orderId
    ) {
        OrderResponse response =
                orderService.getMyOrderById(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order retrieved successfully",
                        response
                )
        );
    }

    /*
     * Optional lookup using generated order number
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>>
    getMyOrderByNumber(
            @PathVariable String orderNumber
    ) {
        OrderResponse response =
                orderService.getMyOrderByNumber(orderNumber);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order retrieved successfully",
                        response
                )
        );
    }

    /*
     * US-35: Customer payment status
     */
    @GetMapping("/{orderId}/payment-status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>>
    getPaymentStatus(
            @PathVariable Long orderId
    ) {
        PaymentStatusResponse response =
                orderService.getMyOrderPaymentStatus(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment status retrieved successfully",
                        response
                )
        );
    }

    /*
     * US-39: Customer cancellation request
     */
    @PostMapping("/{orderId}/cancellation-request")
    public ResponseEntity<ApiResponse<OrderResponse>>
    requestCancellation(
            @PathVariable Long orderId,
            @Valid @RequestBody CancellationRequest request
    ) {
        OrderResponse response =
                orderService.requestCancellation(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cancellation request submitted successfully",
                        response
                )
        );
    }
    /*
     * Customer view own invoice
     */
    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>>
    getMyInvoice(
            @PathVariable Long orderId
    ) {
        InvoiceResponse response =
                billingService.getMyInvoice(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Invoice retrieved successfully",
                        response
                )
        );
    }

    /*
     * Customer view own payment history
     */
    @GetMapping("/{orderId}/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>>
    getMyPayments(
            @PathVariable Long orderId
    ) {
        List<PaymentResponse> response =
                billingService.getMyPayments(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment history retrieved successfully",
                        response
                )
        );
    }

    /*
     * Customer pay for order (Card or Bank Transfer)
     */
    @PostMapping("/{orderId}/payments")
    public ResponseEntity<ApiResponse<PaymentRecordResponse>>
    payOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody CustomerPaymentRequest request
    ) {
        PaymentRecordResponse response =
                billingService.processCustomerPayment(orderId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment processed successfully",
                        response
                )
        );
    }
    /*
     * US-37: Customer view own order progress
     */
    @GetMapping("/{orderId}/status-history")
    public ResponseEntity<
            ApiResponse<List<OrderStatusHistoryResponse>>
            > getMyOrderStatusHistory(
            @PathVariable Long orderId
    ) {
        List<OrderStatusHistoryResponse> response =
                orderService.getMyOrderStatusHistory(
                        orderId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order status history retrieved successfully",
                        response
                )
        );
    }
    /*
     * Customer view own refund
     */
    @GetMapping("/{orderId}/refund")
    public ResponseEntity<ApiResponse<RefundResponse>>
    getMyRefund(
            @PathVariable Long orderId
    ) {
        RefundResponse response =
                billingService.getMyRefund(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Refund retrieved successfully",
                        response
                )
        );
    }
}