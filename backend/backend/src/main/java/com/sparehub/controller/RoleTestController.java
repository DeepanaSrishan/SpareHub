package com.sparehub.controller;

import com.sparehub.dto.response.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/access")
public class RoleTestController {

    @GetMapping("/authenticated")
    public ApiResponse<Map<String, Object>>
    authenticatedUser(Authentication authentication) {

        Map<String, Object> data = Map.of(
                "email",
                authentication.getName(),

                "authorities",
                authentication.getAuthorities()
        );

        return ApiResponse.success(
                "Authenticated user access granted",
                data
        );
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<String> customerOnly() {

        return ApiResponse.success(
                "Customer access granted",
                "CUSTOMER"
        );
    }

    @GetMapping("/sales")
    @PreAuthorize(
            "hasAnyRole('SALES_STAFF', 'MANAGER')"
    )
    public ApiResponse<String> salesStaff() {

        return ApiResponse.success(
                "Sales access granted",
                "SALES_STAFF or MANAGER"
        );
    }

    @GetMapping("/inventory")
    @PreAuthorize(
            "hasAnyRole('INVENTORY_STAFF', 'MANAGER')"
    )
    public ApiResponse<String> inventoryStaff() {

        return ApiResponse.success(
                "Inventory access granted",
                "INVENTORY_STAFF or MANAGER"
        );
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<String> managerOnly() {

        return ApiResponse.success(
                "Manager access granted",
                "MANAGER"
        );
    }

    @GetMapping("/staff")
    @PreAuthorize("""
            hasAnyRole(
                'SALES_STAFF',
                'INVENTORY_STAFF',
                'MANAGER'
            )
            """)
    public ApiResponse<String> allStaff() {

        return ApiResponse.success(
                "Staff access granted",
                "Any staff role"
        );
    }
}