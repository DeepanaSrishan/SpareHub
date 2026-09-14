package com.sparehub.dto.inventory.sparepart;



import com.sparehub.entity.inventory.SparePartStatus;
import jakarta.validation.constraints.NotNull;

public record SparePartStatusRequest(

        @NotNull(message = "Spare-part status is required")
        SparePartStatus status
) {
}