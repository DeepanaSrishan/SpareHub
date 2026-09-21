package com.sparehub.dto.report;


import com.sparehub.entity.report.ManagementReportType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ManagementReportResponse(

        ManagementReportType reportType,

        LocalDate startDate,
        LocalDate endDate,

        Long productId,
        Long supplierId,
        String transactionType,

        long totalRecords,
        BigDecimal totalAmount,

        List<Map<String, Object>> records,

        LocalDateTime generatedAt
) {
}
