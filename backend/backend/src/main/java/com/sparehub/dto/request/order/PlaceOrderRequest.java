package com.sparehub.dto.request.order;



import com.sparehub.enums.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

public record PlaceOrderRequest(

        @Size(
                max = 500,
                message = "Customer note cannot exceed 500 characters"
        )
        String customerNote,

        PaymentMethod paymentMethod,

        @Valid
        CustomerPaymentRequest paymentDetails
) {
    public PlaceOrderRequest(String customerNote) {
        this(customerNote, null, null);
    }
}