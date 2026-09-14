package com.sparehub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AssignLoyaltyTierRequest(

        @NotNull(message = "Loyalty tier ID is required")
        Long loyaltyTierId,

        @NotBlank(message = "Assignment reason is required")
        @Size(
                max = 500,
                message =
                        "Assignment reason must not exceed 500 characters"
        )
        String reason
) {
}