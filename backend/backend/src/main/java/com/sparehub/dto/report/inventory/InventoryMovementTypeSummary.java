package com.sparehub.dto.report.inventory;



import com.sparehub.entity.inventory.InventoryTransactionType;

public record InventoryMovementTypeSummary(

        InventoryTransactionType transactionType,

        long transactionCount,

        long totalQuantityChanged
) {
}