package com.sparehub.controller.order;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.request.order.ConfirmOrderRequest;
import com.sparehub.dto.request.order.RejectOrderRequest;
import com.sparehub.dto.response.order.OrderResponse;
import com.sparehub.dto.response.order.StockVerificationResponse;
import com.sparehub.enums.order.OrderStatus;
import com.sparehub.service.order.StaffOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sparehub.dto.request.order.RecordPaymentRequest;
import com.sparehub.dto.response.order.InvoiceResponse;
import com.sparehub.dto.response.order.PaymentRecordResponse;
import com.sparehub.dto.response.order.PaymentResponse;
import com.sparehub.service.order.BillingService;
import java.util.List;
import com.sparehub.dto.request.order.OrderStatusUpdateRequest;
import com.sparehub.dto.response.order.OrderStatusHistoryResponse;
import com.sparehub.dto.request.order.ApproveCancellationRequest;
import com.sparehub.dto.request.order.RejectCancellationRequest;
import com.sparehub.dto.response.order.CancellationProcessResponse;
import com.sparehub.dto.response.order.RefundResponse;

@RestController
@RequestMapping("/api/staff/orders")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyRole('SALES_STAFF', 'MANAGER')"
)
public class StaffOrderController {

    private final StaffOrderService staffOrderService;
    private final BillingService billingService;
    /*
     * Examples:
     * GET /api/staff/orders
     * GET /api/staff/orders?status=PENDING
     * GET /api/staff/orders?status=CONFIRMED
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>>
    getAllOrders(
            @RequestParam(required = false)
            OrderStatus status
    ) {
        List<OrderResponse> response =
                staffOrderService.getAllOrders(status);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Orders retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>>
    getOrderById(
            @PathVariable Long orderId
    ) {
        OrderResponse response =
                staffOrderService.getOrderById(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{orderId}/verify-stock")
    public ResponseEntity<
            ApiResponse<StockVerificationResponse>
            > verifyStock(
            @PathVariable Long orderId
    ) {
        StockVerificationResponse response =
                staffOrderService.verifyOrderStock(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order stock verification completed",
                        response
                )
        );
    }

    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<ApiResponse<OrderResponse>>
    confirmOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody ConfirmOrderRequest request
    ) {
        OrderResponse response =
                staffOrderService.confirmOrder(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order confirmed successfully",
                        response
                )
        );
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<ApiResponse<OrderResponse>>
    rejectOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody RejectOrderRequest request
    ) {
        OrderResponse response =
                staffOrderService.rejectOrder(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order rejected successfully",
                        response
                )
        );
    }
    /*
     * US-33: Generate invoice
     */
    @PostMapping("/{orderId}/invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>>
    generateInvoice(
            @PathVariable Long orderId
    ) {
        InvoiceResponse response =
                billingService.generateInvoice(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Invoice generated successfully",
                        response
                )
        );
    }

    /*
     * Staff view invoice
     */
    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>>
    getInvoice(
            @PathVariable Long orderId
    ) {
        InvoiceResponse response =
                billingService.getInvoiceForStaff(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Invoice retrieved successfully",
                        response
                )
        );
    }

    /*
     * US-34: Record customer payment
     */
    @PostMapping("/{orderId}/payments")
    public ResponseEntity<ApiResponse<PaymentRecordResponse>>
    recordPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody RecordPaymentRequest request
    ) {
        PaymentRecordResponse response =
                billingService.recordPayment(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment recorded successfully",
                        response
                )
        );
    }

    /*
     * Staff view payment history
     */
    @GetMapping("/{orderId}/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>>
    getPayments(
            @PathVariable Long orderId
    ) {
        List<PaymentResponse> response =
                billingService.getPaymentsForStaff(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment history retrieved successfully",
                        response
                )
        );
    }
    /*
     * US-36: Update order processing status
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>>
    updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody
            OrderStatusUpdateRequest request
    ) {
        OrderResponse response =
                staffOrderService.updateOrderStatus(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order status updated successfully",
                        response
                )
        );
    }

    /*
     * Staff view complete status history
     */
    @GetMapping("/{orderId}/status-history")
    public ResponseEntity<
            ApiResponse<List<OrderStatusHistoryResponse>>
            > getOrderStatusHistory(
            @PathVariable Long orderId
    ) {
        List<OrderStatusHistoryResponse> response =
                staffOrderService.getOrderStatusHistory(
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
     * US-40: Approve customer cancellation
     */
    @PostMapping("/{orderId}/cancellation/approve")
    public ResponseEntity<
            ApiResponse<CancellationProcessResponse>
            > approveCancellation(
            @PathVariable Long orderId,
            @Valid @RequestBody
            ApproveCancellationRequest request
    ) {
        CancellationProcessResponse response =
                staffOrderService.approveCancellation(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order cancellation approved successfully",
                        response
                )
        );
    }

    /*
     * US-40: Reject customer cancellation request
     */
    @PostMapping("/{orderId}/cancellation/reject")
    public ResponseEntity<ApiResponse<OrderResponse>>
    rejectCancellation(
            @PathVariable Long orderId,
            @Valid @RequestBody
            RejectCancellationRequest request
    ) {
        OrderResponse response =
                staffOrderService.rejectCancellation(
                        orderId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Order cancellation request rejected",
                        response
                )
        );
    }

    /*
     * Staff view refund
     */
    @GetMapping("/{orderId}/refund")
    public ResponseEntity<ApiResponse<RefundResponse>>
    getRefund(
            @PathVariable Long orderId
    ) {
        RefundResponse response =
                billingService.getRefundForStaff(orderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Refund retrieved successfully",
                        response
                )
        );
    }
}
