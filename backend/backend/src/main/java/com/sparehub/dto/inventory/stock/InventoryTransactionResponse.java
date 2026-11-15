package com.sparehub.dto.inventory.stock;



import com.sparehub.entity.inventory.InventoryTransactionType;

import java.time.LocalDateTime;

public record InventoryTransactionResponse(

        Long id,

        Long sparePartId,

        String partNumber,

        String sparePartName,

        InventoryTransactionType transactionType,

        Integer quantityChange,

        Integer quantityBefore,

        Integer quantityAfter,

        String reason,

        String referenceNumber,

        String referenceType,

        Long referenceId,

        String performedByEmail,

        LocalDateTime createdAt
) {
}
