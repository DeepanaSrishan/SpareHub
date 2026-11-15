package com.sparehub.dto.request.order;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectOrderRequest(

        @NotBlank(message = "Rejection reason is required")
        @Size(
                min = 5,
                max = 500,
                message = "Rejection reason must contain between 5 and 500 characters"
        )
        String reason
) {
}