package com.sparehub.dto.request.order;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectCancellationRequest(

        @NotBlank(message = "Decision note is required")
        @Size(
                min = 5,
                max = 500,
                message = "Decision note must contain between 5 and 500 characters"
        )
        String decisionNote
) {
}