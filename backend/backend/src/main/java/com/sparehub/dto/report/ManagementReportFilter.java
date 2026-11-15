package com.sparehub.dto.report;


import com.sparehub.entity.report.ManagementReportType;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record ManagementReportFilter(

        @NotNull(message = "Report type is required")
        ManagementReportType reportType,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate startDate,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate endDate,

        Long productId,

        Long supplierId,

        String transactionType,

        String orderStatus,

        String paymentStatus
) {
}