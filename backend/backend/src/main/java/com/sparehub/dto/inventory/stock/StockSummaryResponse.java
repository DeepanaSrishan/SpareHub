package com.sparehub.dto.inventory.stock;



public record StockSummaryResponse(

        Long sparePartId,

        String partNumber,

        String sparePartName,

        Integer stockQuantity,

        Integer reorderLevel,

        boolean available,

        boolean lowStock,

        InventoryTransactionResponse transaction
) {
}