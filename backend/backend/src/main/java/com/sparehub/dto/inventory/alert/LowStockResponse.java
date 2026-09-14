package com.sparehub.dto.inventory.alert;



import com.sparehub.entity.inventory.SparePartStatus;

public record LowStockResponse(

        Long id,

        String partNumber,

        String name,

        String brand,

        String categoryName,

        Integer stockQuantity,

        Integer reorderLevel,

        Integer shortageQuantity,

        SparePartStatus status,

        boolean available,

        boolean lowStock

) {
}
