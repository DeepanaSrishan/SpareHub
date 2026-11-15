package com.sparehub.dto.request.supplier;





import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReceiveSupplierPurchaseRequest(

        @NotNull(message = "Received quantity is required")
        @Min(
                value = 1,
                message = "Received quantity must be at least 1"
        )
        Integer receivedQuantity,

        @Size(
                max = 100,
                message = "Invoice number cannot exceed 100 characters"
        )
        String supplierInvoiceNumber,

        @Size(
                max = 500,
                message = "Notes cannot exceed 500 characters"
        )
        String notes
) {
}
