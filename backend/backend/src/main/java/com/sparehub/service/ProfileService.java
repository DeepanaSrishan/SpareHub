package com.sparehub.service;

import com.sparehub.dto.request.ChangePasswordRequest;
import com.sparehub.dto.request.UpdateProfileRequest;
import com.sparehub.dto.response.ProfileResponse;

public interface ProfileService {

    ProfileResponse getCurrentProfile();

    ProfileResponse updateCurrentProfile(
            UpdateProfileRequest request
    );

    void changePassword(
            ChangePasswordRequest request
    );
}