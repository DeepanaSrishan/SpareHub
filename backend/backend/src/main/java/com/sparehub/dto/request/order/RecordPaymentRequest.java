package com.sparehub.dto.request.order;



import com.sparehub.enums.order.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RecordPaymentRequest(

        @NotNull(message = "Payment amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Payment amount must be greater than zero"
        )
        BigDecimal amount,

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
