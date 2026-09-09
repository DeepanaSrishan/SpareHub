package com.sparehub.backend.controller;

import com.sparehub.backend.dto.UpdateProfileRequest;
import com.sparehub.backend.dto.UserProfileDto;
import com.sparehub.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // US-02: View customer profile
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable Integer id) {
        UserProfileDto profile = userService.getUserProfile(id);
        return ResponseEntity.ok(profile);
    }

    // US-02: Update customer profile
    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> updateProfile(@PathVariable Integer id,
                                                        @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileDto updated = userService.updateUserProfile(id, request);
        return ResponseEntity.ok(updated);
    }
}
