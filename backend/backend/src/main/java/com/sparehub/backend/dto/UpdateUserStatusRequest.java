package com.sparehub.backend.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateUserStatusRequest {

    @NotNull(message = "Status is required")
    private Boolean isActive;

    public UpdateUserStatusRequest() {}

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
