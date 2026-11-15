package com.sparehub.repository;

import com.sparehub.entity.Notification;
import com.sparehub.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    Page<Notification>
    findByUserIdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    Page<Notification>
    findByUserIdAndReadFalseOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    long countByUserIdAndReadFalse(Long userId);

    boolean existsByUserIdAndNotificationTypeAndMessage(
            Long userId,
            NotificationType notificationType,
            String message
    );
}