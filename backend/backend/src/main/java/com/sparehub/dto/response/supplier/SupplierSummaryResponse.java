package com.sparehub.dto.response.supplier;


import java.time.LocalDateTime;

public record SupplierSummaryResponse(

        Long id,
        String supplierCode,
        String companyName,
        String contactPerson,
        String email,
        String contactNumber,
        String city,
        String country,
        Boolean active,
        Integer productCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}