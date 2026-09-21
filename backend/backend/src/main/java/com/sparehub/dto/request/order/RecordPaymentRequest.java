package com.sparehub.dto.request.order;

import com.sparehub.enums.order.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RecordPaymentRequest(

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @Size(
                max = 100,
                message = "External reference cannot exceed 100 characters"
        )
        String externalReference,

        @Size(
                max = 500,
                message = "Payment note cannot exceed 500 characters"
        )
        String note
) {
}
