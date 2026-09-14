package com.sparehub.dto.inventory.sparepart;



import java.math.BigDecimal;

public record CatalogSparePartResponse(

        Long id,

        String partNumber,

        String name,

        String description,

        String brand,

        String vehicleMake,

        String vehicleModel,

        String manufactureYear,

        BigDecimal sellingPrice,

        Integer stockQuantity,

        String imageUrl,

        boolean available,

        boolean lowStock,

        Long categoryId,

        String categoryName
) {
}
