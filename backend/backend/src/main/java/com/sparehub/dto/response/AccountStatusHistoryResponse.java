package com.sparehub.dto.response;

import com.sparehub.enums.AccountStatus;

import java.time.LocalDateTime;

public record AccountStatusHistoryResponse(

        Long id,

        AccountStatus previousStatus,

        AccountStatus newStatus,

        String reason,

        Long performedByUserId,

        String performedByName,

        LocalDateTime createdAt
) {
}