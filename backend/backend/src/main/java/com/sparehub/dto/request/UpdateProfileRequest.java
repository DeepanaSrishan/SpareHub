package com.sparehub.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @Size(
                max = 120,
                message =
                        "Full name must not exceed 120 characters"
        )
        String fullName,

        String firstName,

        String lastName,

        @Pattern(
                regexp = "^$|^0[1-9][0-9]{8}$",
                message = "Phone number must be a valid 10-digit Sri Lankan phone number starting with 0 (e.g. 07XXXXXXXX)"
        )
        String phone,

        @Pattern(
                regexp = "^$|^0[1-9][0-9]{8}$",
                message = "Phone number must be a valid 10-digit Sri Lankan phone number starting with 0 (e.g. 07XXXXXXXX)"
        )
        String phoneNumber,

        @Size(
                max = 500,
                message =
                        "Address must not exceed 500 characters"
        )
        String address
) {

    public String resolveFullName() {
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        String combined = (first + " " + last).trim();
        return combined.isEmpty() ? null : combined;
    }

    public String resolvePhone() {
        if (phone != null && !phone.isBlank()) {
            return phone.trim();
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            return phoneNumber.trim();
        }
        return null;
    }
}