package com.sparehub.service.report;


import com.sparehub.dto.report.ManagementDashboardResponse;
import com.sparehub.dto.report.ManagementReportFilter;
import com.sparehub.dto.report.ManagementReportResponse;

import java.time.LocalDate;

public interface ManagementReportService {

    ManagementDashboardResponse getDashboardSummary(
            LocalDate startDate,
            LocalDate endDate
    );

    ManagementReportResponse generateReport(
            ManagementReportFilter filter
    );

    byte[] exportReportAsCsv(
            ManagementReportFilter filter
    );
}
