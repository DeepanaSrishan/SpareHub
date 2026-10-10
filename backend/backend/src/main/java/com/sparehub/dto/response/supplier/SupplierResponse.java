package com.sparehub.dto.response.supplier;

import com.sparehub.entity.supplier.SupplierStatus;
import java.time.LocalDateTime;

public record SupplierResponse(
        Long id,
        String supplierCode,
        String companyName,
        String contactPerson,
        String email,
        String contactNumber,
        String alternateContactNumber,
        String address,
        String city,
        String country,
        String taxRegistrationNumber,
        String bankAccountDetails,
        String notes,
        Boolean active,
        SupplierStatus status,
        Integer productCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
