package com.sparehub.dto.response.order;



import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record PaymentReportResponse(

        LocalDate startDate,
        LocalDate endDate,

        Long totalPaymentRecords,
        Long successfulPaymentRecords,
        Long refundedPaymentRecords,

        BigDecimal grossCollectedAmount,
        BigDecimal refundedAmount,
        BigDecimal netCollectedAmount,

        Map<String, Long> paymentsByStatus,
        List<PaymentMethodSummary> paymentsByMethod
) {
}
