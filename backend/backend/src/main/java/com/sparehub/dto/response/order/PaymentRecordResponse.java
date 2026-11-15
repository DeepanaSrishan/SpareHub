package com.sparehub.dto.response.order;



public record PaymentRecordResponse(

        PaymentResponse payment,
        PaymentStatusResponse paymentSummary
) {
}
