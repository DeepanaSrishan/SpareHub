package com.sparehub.dto.response.order;



import com.sparehub.enums.order.PaymentMethod;

import java.math.BigDecimal;

public record PaymentMethodSummary(

        PaymentMethod paymentMethod,
        Long transactionCount,
        BigDecimal amount
) {
}
