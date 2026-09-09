package com.sparehub.backend.controller;

import com.sparehub.backend.dto.NotificationDto;
import com.sparehub.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // US-62: Customer views welcome messages & notifications
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@PathVariable Integer userId) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // US-62: Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
