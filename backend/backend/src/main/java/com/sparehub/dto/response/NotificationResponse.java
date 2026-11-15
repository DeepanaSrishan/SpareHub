package com.sparehub.dto.response;

import com.sparehub.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(

        Long id,

        NotificationType notificationType,

        String title,

        String message,

        Boolean read,

        LocalDateTime readAt,

        LocalDateTime createdAt
) {
}