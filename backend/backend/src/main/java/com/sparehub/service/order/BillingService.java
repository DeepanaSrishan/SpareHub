package com.sparehub.service.order;



import com.sparehub.dto.request.order.RecordPaymentRequest;
import com.sparehub.dto.response.order.InvoiceResponse;
import com.sparehub.dto.response.order.PaymentRecordResponse;
import com.sparehub.dto.response.order.PaymentResponse;
import com.sparehub.dto.response.order.RefundResponse;

import java.util.List;

public interface BillingService {

    InvoiceResponse generateInvoice(Long orderId);

    InvoiceResponse getInvoiceForStaff(Long orderId);

    InvoiceResponse getMyInvoice(Long orderId);

    PaymentRecordResponse recordPayment(
            Long orderId,
            RecordPaymentRequest request
    );

    List<PaymentResponse> getPaymentsForStaff(
            Long orderId
    );

    List<PaymentResponse> getMyPayments(Long orderId);

    RefundResponse getRefundForStaff(Long orderId);

    RefundResponse getMyRefund(Long orderId);
}
