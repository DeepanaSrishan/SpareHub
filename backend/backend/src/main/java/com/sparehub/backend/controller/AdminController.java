package com.sparehub.backend.controller;

import com.sparehub.backend.dto.CreateStaffRequest;
import com.sparehub.backend.dto.UpdateUserRolesRequest;
import com.sparehub.backend.dto.UpdateUserStatusRequest;
import com.sparehub.backend.dto.UserProfileDto;
import com.sparehub.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // Manager views all users for RBAC management
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        List<UserProfileDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Manager creates sales or inventory staff account
    @PostMapping("/users/staff")
    public ResponseEntity<UserProfileDto> createStaffAccount(
            @Valid @RequestBody CreateStaffRequest request) {
        UserProfileDto created = userService.createStaffUser(request);
        return ResponseEntity.ok(created);
    }

    // US-07: Manager updates user roles
    @PutMapping("/users/{id}/roles")
    public ResponseEntity<UserProfileDto> updateUserRoles(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateUserRolesRequest request) {
        UserProfileDto updated = userService.updateUserRoles(id, request.getRoleNames());
        return ResponseEntity.ok(updated);
    }

    // US-07: Manager activates or deactivates an account
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserProfileDto> updateUserStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserProfileDto updated = userService.updateUserStatus(id, request.getIsActive());
        return ResponseEntity.ok(updated);
    }

    // US-07: Manager views overall RBAC system statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = userService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
}
