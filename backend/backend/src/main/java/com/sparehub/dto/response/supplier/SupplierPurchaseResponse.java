package com.sparehub.dto.response.supplier;



import com.sparehub.entity.supplier.PurchaseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SupplierPurchaseResponse(

        Long purchaseId,
        String purchaseNumber,

        Long supplierId,
        String supplierCode,
        String supplierCompanyName,

        Long supplierProductId,
        Long sparePartId,
        String partNumber,
        String productName,

        Integer orderedQuantity,
        Integer receivedQuantity,

        BigDecimal unitPurchasePrice,
        BigDecimal totalAmount,

        PurchaseStatus status,

        String supplierInvoiceNumber,
        LocalDate expectedDeliveryDate,
        String notes,

        String createdByName,
        String receivedByName,

        LocalDateTime orderedAt,
        LocalDateTime receivedAt,
        LocalDateTime updatedAt
) {
    public Long getId() {
        return purchaseId;
    }

    public Long id() {
        return purchaseId;
    }

    public String getSupplierName() {
        return supplierCompanyName;
    }
}
