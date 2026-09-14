package com.sparehub.dto.request.supplier;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateSupplierRequest(

        @NotBlank(message = "Company name is required")
        @Size(
                max = 150,
                message = "Company name cannot exceed 150 characters"
        )
        String companyName,

        @NotBlank(message = "Contact person is required")
        @Size(
                max = 120,
                message = "Contact person cannot exceed 120 characters"
        )
        String contactPerson,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(
                max = 150,
                message = "Email cannot exceed 150 characters"
        )
        String email,

        @NotBlank(message = "Contact number is required")
        @Pattern(
                regexp = "^[0-9+()\\-\\s]{7,25}$",
                message = "Enter a valid contact number"
        )
        String contactNumber,

        @Pattern(
                regexp = "^$|^[0-9+()\\-\\s]{7,25}$",
                message = "Enter a valid alternate contact number"
        )
        String alternateContactNumber,

        @Size(
                max = 500,
                message = "Address cannot exceed 500 characters"
        )
        String address,

        @Size(
                max = 100,
                message = "City cannot exceed 100 characters"
        )
        String city,

        @Size(
                max = 100,
                message = "Country cannot exceed 100 characters"
        )
        String country,

        @Size(
                max = 60,
                message = "Tax registration number cannot exceed 60 characters"
        )
        String taxRegistrationNumber,

        @Size(
                max = 500,
                message = "Bank account details cannot exceed 500 characters"
        )
        String bankAccountDetails,

        @Size(
                max = 500,
                message = "Notes cannot exceed 500 characters"
        )
        String notes
) {
}