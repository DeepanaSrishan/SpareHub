package com.sparehub.service.impl;

import com.sparehub.dto.response.NotificationResponse;
import com.sparehub.entity.Notification;
import com.sparehub.entity.User;
import com.sparehub.enums.NotificationType;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.exception.UnauthorizedOperationException;
import com.sparehub.repository.NotificationRepository;
import com.sparehub.service.NotificationService;
import com.sparehub.util.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository
            notificationRepository;

    private final CurrentUserService
            currentUserService;

    @Override
    @Transactional
    public void createNotification(
            User user,
            NotificationType type,
            String title,
            String message
    ) {
        Notification notification =
                Notification.builder()
                        .user(user)
                        .notificationType(type)
                        .title(title)
                        .message(message)
                        .read(false)
                        .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse>
    getCurrentUserNotifications(
            boolean unreadOnly,
            Pageable pageable
    ) {
        User currentUser =
                currentUserService.getCurrentUser();

        Page<Notification> notifications;

        if (unreadOnly) {
            notifications =
                    notificationRepository
                            .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                    currentUser.getId(),
                                    pageable
                            );
        } else {
            notifications =
                    notificationRepository
                            .findByUserIdOrderByCreatedAtDesc(
                                    currentUser.getId(),
                                    pageable
                            );
        }

        return notifications.map(
                this::mapToResponse
        );
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(
            Long notificationId
    ) {
        User currentUser =
                currentUserService.getCurrentUser();

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification",
                                        "id",
                                        notificationId
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(currentUser.getId())) {

            throw new UnauthorizedOperationException(
                    "You cannot update another user's notification"
            );
        }

        if (!Boolean.TRUE.equals(
                notification.getRead()
        )) {
            notification.setRead(true);
            notification.setReadAt(
                    LocalDateTime.now()
            );

            notificationRepository.save(notification);
        }

        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {

        User currentUser =
                currentUserService.getCurrentUser();

        Page<Notification> unreadNotifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                currentUser.getId(),
                                Pageable.unpaged()
                        );

        LocalDateTime currentTime =
                LocalDateTime.now();

        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(currentTime);
        });

        notificationRepository.saveAll(
                unreadNotifications.getContent()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {

        User currentUser =
                currentUserService.getCurrentUser();

        return notificationRepository
                .countByUserIdAndReadFalse(
                        currentUser.getId()
                );
    }

    private NotificationResponse mapToResponse(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}