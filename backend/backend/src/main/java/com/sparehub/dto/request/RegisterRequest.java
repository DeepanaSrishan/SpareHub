package com.sparehub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(
                min = 2,
                max = 120,
                message = "Full name must contain between 2 and 120 characters"
        )
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(
                max = 150,
                message = "Email must not exceed 150 characters"
        )
        String email,

        @NotBlank(message = "Password is required")
        @Size(
                min = 8,
                max = 72,
                message = "Password must contain between 8 and 72 characters"
        )
        @Pattern(
                regexp =
                        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#._-]).+$",
                message =
                        "Password must include uppercase, lowercase, number and special character"
        )
        String password,

        @NotBlank(message = "Password confirmation is required")
        String confirmPassword,

        @Pattern(
                regexp = "^$|^0[1-9][0-9]{8}$",
                message = "Phone number must be a valid 10-digit Sri Lankan number starting with 0 (e.g. 07XXXXXXXX)"
        )
        String phone,

        @Size(
                max = 500,
                message = "Address must not exceed 500 characters"
        )
        String address
) {
}