package com.sparehub.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class UpdateUserRolesRequest {

    @NotEmpty(message = "At least one role must be specified")
    private List<String> roleNames;

    public UpdateUserRolesRequest() {}

    public List<String> getRoleNames() {
        return roleNames;
    }

    public void setRoleNames(List<String> roleNames) {
        this.roleNames = roleNames;
    }
}
