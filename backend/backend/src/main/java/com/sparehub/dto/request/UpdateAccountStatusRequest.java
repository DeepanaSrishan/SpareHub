package com.sparehub.dto.request;

import com.sparehub.enums.AccountStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateAccountStatusRequest(

        @NotNull(message = "Account status is required")
        AccountStatus accountStatus,

        @NotBlank(message = "Status-change reason is required")
        @Size(
                max = 500,
                message =
                        "Reason must not exceed 500 characters"
        )
        String reason
) {
}