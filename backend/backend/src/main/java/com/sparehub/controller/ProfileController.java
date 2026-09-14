package com.sparehub.controller;

import com.sparehub.dto.request.ChangePasswordRequest;
import com.sparehub.dto.request.UpdateProfileRequest;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.ProfileResponse;
import com.sparehub.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<ProfileResponse>
            > getCurrentProfile() {

        ProfileResponse response =
                profileService.getCurrentProfile();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile retrieved successfully",
                        response
                )
        );
    }

    @PutMapping
    public ResponseEntity<
            ApiResponse<ProfileResponse>
            > updateCurrentProfile(

            @Valid
            @RequestBody
            UpdateProfileRequest request
    ) {
        ProfileResponse response =
                profileService
                        .updateCurrentProfile(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        response
                )
        );
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>>
    changePassword(

            @Valid
            @RequestBody
            ChangePasswordRequest request
    ) {
        profileService.changePassword(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password changed successfully"
                )
        );
    }
}