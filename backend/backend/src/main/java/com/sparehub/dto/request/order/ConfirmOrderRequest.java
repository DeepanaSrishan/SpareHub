package com.sparehub.dto.request.order;



import jakarta.validation.constraints.Size;

public record ConfirmOrderRequest(

        @Size(
                max = 500,
                message = "Staff note cannot exceed 500 characters"
        )
        String staffNote
) {
}
