package com.sparehub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "Full name is required")
        @Size(
                min = 2,
                max = 120,
                message =
                        "Full name must contain between 2 and 120 characters"
        )
        String fullName,

        @Pattern(
                regexp = "^$|^[0-9+][0-9\\s-]{8,19}$",
                message = "Enter a valid phone number"
        )
        String phone,

        @Size(
                max = 500,
                message =
                        "Address must not exceed 500 characters"
        )
        String address
) {
}