package com.sparehub.controller.manager;

import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.UserAdminResponse;
import com.sparehub.entity.AccountStatusHistory;
import com.sparehub.entity.User;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.NotificationType;
import com.sparehub.enums.Role;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.AccountStatusHistoryRepository;
import com.sparehub.repository.UserRepository;
import com.sparehub.service.NotificationService;
import com.sparehub.util.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/manager/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class UserManagementController {

    private final UserRepository userRepository;
    private final AccountStatusHistoryRepository accountStatusHistoryRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    /*
     * US-07: Role-based user listing and management
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserAdminResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Specification<User> spec = (root, query, cb) -> {
            var predicate = cb.conjunction();

            if (search != null && !search.trim().isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                var nameLike = cb.like(cb.lower(root.get("fullName")), searchPattern);
                var emailLike = cb.like(cb.lower(root.get("email")), searchPattern);
                predicate = cb.and(predicate, cb.or(nameLike, emailLike));
            }

            if (role != null) {
                predicate = cb.and(predicate, cb.equal(root.get("role"), role));
            }

            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("accountStatus"), status));
            }

            return predicate;
        };

        Page<UserAdminResponse> result = userRepository.findAll(spec, pageable)
                .map(UserAdminResponse::fromUser);

        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", result));
    }

    /*
     * View user details
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserAdminResponse>> getUserById(
            @PathVariable Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", UserAdminResponse.fromUser(user)));
    }

    /*
     * US-11: Activate or deactivate customer/user accounts
     */
    @PatchMapping("/{userId}/status")
    @Transactional
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateAccountStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body
    ) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User currentManager = currentUserService.getCurrentUser();

        if (targetUser.getId().equals(currentManager.getId())) {
            throw new BadRequestException("You cannot change the status of your own account");
        }

        Object statusObj = body.get("accountStatus");
        if (statusObj == null) {
            statusObj = body.get("status");
        }
        if (statusObj == null) {
            throw new BadRequestException("accountStatus is required");
        }

        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(statusObj.toString().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid accountStatus: " + statusObj);
        }

        AccountStatus previousStatus = targetUser.getAccountStatus();
        if (previousStatus == newStatus) {
            throw new BadRequestException("User account is already in status: " + newStatus);
        }

        String reason = body.get("reason") != null ? body.get("reason").toString().trim() : "Account status updated by manager";

        targetUser.setAccountStatus(newStatus);
        User savedUser = userRepository.save(targetUser);

        AccountStatusHistory history = AccountStatusHistory.builder()
                .customer(savedUser)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .reason(reason)
                .performedByUserId(currentManager.getId())
                .performedByName(currentManager.getFullName())
                .build();
        accountStatusHistoryRepository.save(history);

        notificationService.createNotification(
                savedUser,
                NotificationType.GENERAL,
                "Account status updated",
                "Your SpareHub account status has been changed to " + newStatus + "."
        );

        return ResponseEntity.ok(ApiResponse.success("Account status updated successfully", UserAdminResponse.fromUser(savedUser)));
    }
}
