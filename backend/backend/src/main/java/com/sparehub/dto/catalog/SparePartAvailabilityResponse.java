package com.sparehub.dto.catalog;



public record SparePartAvailabilityResponse(

        Long sparePartId,

        String partNumber,

        String name,

        boolean available,

        Integer availableQuantity,

        String message
) {
}
