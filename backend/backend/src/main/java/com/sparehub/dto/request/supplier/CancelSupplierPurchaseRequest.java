package com.sparehub.dto.request.supplier;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelSupplierPurchaseRequest(

        @NotBlank(message = "Cancellation reason is required")
        @Size(
                min = 5,
                max = 500,
                message = "Reason must contain between 5 and 500 characters"
        )
        String reason
) {
}
