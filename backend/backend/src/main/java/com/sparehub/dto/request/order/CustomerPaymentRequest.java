package com.sparehub.dto.request.order;

import com.sparehub.enums.order.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CustomerPaymentRequest(

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @Size(max = 30, message = "Card number cannot exceed 30 characters")
        String cardNumber,

        @Size(max = 100, message = "Cardholder name cannot exceed 100 characters")
        String cardHolderName,

        @Size(max = 10, message = "Expiry date cannot exceed 10 characters")
        String expiryDate,

        @Size(max = 10, message = "CVV cannot exceed 10 characters")
        String cvv,

        @Size(max = 100, message = "Bank name cannot exceed 100 characters")
        String bankName,

        @Size(max = 100, message = "Deposit slip reference cannot exceed 100 characters")
        String depositSlipReference,

        @Size(max = 30, message = "Transfer date cannot exceed 30 characters")
        String transferDate,

        @Size(max = 500, message = "Note cannot exceed 500 characters")
        String note
) {
}
