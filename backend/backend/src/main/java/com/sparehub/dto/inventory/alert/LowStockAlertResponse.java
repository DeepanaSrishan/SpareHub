package com.sparehub.dto.inventory.alert;



import com.sparehub.entity.inventory.InventoryAlertStatus;

import java.time.LocalDateTime;

public record LowStockAlertResponse(

        Long id,

        Long sparePartId,

        String partNumber,

        String sparePartName,

        Integer stockQuantity,

        Integer reorderLevel,

        String message,

        InventoryAlertStatus status,

        String acknowledgedByEmail,

        LocalDateTime acknowledgedAt,

        LocalDateTime resolvedAt,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}
