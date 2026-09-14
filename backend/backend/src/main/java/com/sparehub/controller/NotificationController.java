package com.sparehub.controller;

import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.NotificationResponse;
import com.sparehub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService
            notificationService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<Page<NotificationResponse>>
            > getMyNotifications(

            @RequestParam(defaultValue = "false")
            boolean unreadOnly,

            Pageable pageable
    ) {
        Page<NotificationResponse> response =
                notificationService
                        .getCurrentUserNotifications(
                                unreadOnly,
                                pageable
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notifications retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<
            ApiResponse<Map<String, Long>>
            > getUnreadCount() {

        long unreadCount =
                notificationService
                        .getUnreadCount();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Unread notification count retrieved",
                        Map.of(
                                "unreadCount",
                                unreadCount
                        )
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<
            ApiResponse<NotificationResponse>
            > markAsRead(

            @PathVariable
            Long notificationId
    ) {
        NotificationResponse response =
                notificationService
                        .markAsRead(notificationId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification marked as read",
                        response
                )
        );
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>>
    markAllAsRead() {

        notificationService.markAllAsRead();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All notifications marked as read"
                )
        );
    }
}