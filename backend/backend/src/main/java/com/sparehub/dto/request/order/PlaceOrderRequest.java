package com.sparehub.dto.request.order;



import jakarta.validation.constraints.Size;

public record PlaceOrderRequest(

        @Size(
                max = 500,
                message = "Customer note cannot exceed 500 characters"
        )
        String customerNote
) {
}