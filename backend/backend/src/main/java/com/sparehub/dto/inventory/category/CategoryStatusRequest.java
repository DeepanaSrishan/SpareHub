package com.sparehub.dto.inventory.category;



import jakarta.validation.constraints.NotNull;

public record CategoryStatusRequest(

        @NotNull(
                message = "Category active status is required"
        )
        Boolean active

) {
}