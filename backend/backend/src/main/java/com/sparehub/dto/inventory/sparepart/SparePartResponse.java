package com.sparehub.dto.inventory.sparepart;



import com.sparehub.entity.inventory.SparePartStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SparePartResponse(

        Long id,

        String partNumber,

        String name,

        String description,

        String brand,

        String vehicleMake,

        String vehicleModel,

        String manufactureYear,

        BigDecimal costPrice,

        BigDecimal sellingPrice,

        Integer stockQuantity,

        Integer reorderLevel,

        String imageUrl,

        SparePartStatus status,

        boolean available,

        boolean lowStock,

        Long categoryId,

        String categoryName,

        Long version,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}
