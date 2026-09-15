package com.sparehub.dto.response.supplier;





import com.sparehub.entity.supplier.SupplierTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SupplierTransactionResponse(

        Long transactionId,

        Long supplierId,
        String supplierCode,
        String supplierCompanyName,

        Long purchaseId,
        String purchaseNumber,

        SupplierTransactionType transactionType,
        String referenceNumber,
        BigDecimal amount,
        Integer quantity,
        String description,

        Long recordedById,
        String recordedByName,

        LocalDateTime createdAt
) {
}