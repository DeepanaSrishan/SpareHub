package com.sparehub.backend.dto;

import jakarta.validation.constraints.NotNull;

public class AssignLoyaltyTierRequest {

    @NotNull(message = "Tier ID is required")
    private Integer tierId;

    public AssignLoyaltyTierRequest() {}

    public Integer getTierId() {
        return tierId;
    }

    public void setTierId(Integer tierId) {
        this.tierId = tierId;
    }
}
