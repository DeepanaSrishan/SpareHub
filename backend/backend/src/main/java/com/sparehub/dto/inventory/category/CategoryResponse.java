package com.sparehub.dto.inventory.category;


import java.time.LocalDateTime;

public record CategoryResponse(

        Long id,

        String name,

        String description,

        boolean active,

        long sparePartCount,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}