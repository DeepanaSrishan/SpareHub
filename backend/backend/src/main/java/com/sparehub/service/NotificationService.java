package com.sparehub.service;

import com.sparehub.dto.response.NotificationResponse;
import com.sparehub.entity.User;
import com.sparehub.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    void createNotification(
            User user,
            NotificationType type,
            String title,
            String message
    );

    Page<NotificationResponse>
    getCurrentUserNotifications(
            boolean unreadOnly,
            Pageable pageable
    );

    NotificationResponse markAsRead(
            Long notificationId
    );

    void markAllAsRead();

    long getUnreadCount();
}