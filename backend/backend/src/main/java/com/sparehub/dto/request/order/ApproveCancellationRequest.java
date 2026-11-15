package com.sparehub.dto.request.order;



import jakarta.validation.constraints.Size;

public record ApproveCancellationRequest(

        @Size(
                max = 500,
                message = "Decision note cannot exceed 500 characters"
        )
        String decisionNote
) {
}