package com.sparehub.controller.report;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.report.ManagementDashboardResponse;
import com.sparehub.dto.report.ManagementReportFilter;
import com.sparehub.dto.report.ManagementReportResponse;
import com.sparehub.entity.report.ManagementReportType;
import com.sparehub.service.report.ManagementReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagementReportController {

    private final ManagementReportService
            managementReportService;

    @GetMapping("/dashboard")
    public ResponseEntity<
            ApiResponse<ManagementDashboardResponse>
            > getDashboard(

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        ManagementDashboardResponse response =
                managementReportService.getDashboardSummary(
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Management dashboard loaded successfully",
                        response
                )
        );
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<
            ApiResponse<ManagementReportResponse>
            > generateReport(

            @Valid
            @RequestBody ManagementReportFilter filter
    ) {
        ManagementReportResponse response =
                managementReportService.generateReport(filter);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Management report generated successfully",
                        response
                )
        );
    }

    @GetMapping(
            value = "/reports/export",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]> exportReport(

            @RequestParam
            ManagementReportType reportType,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false)
            Long productId,

            @RequestParam(required = false)
            Long supplierId,

            @RequestParam(required = false)
            String transactionType,

            @RequestParam(required = false)
            String orderStatus,

            @RequestParam(required = false)
            String paymentStatus
    ) {
        ManagementReportFilter filter =
                new ManagementReportFilter(
                        reportType,
                        startDate,
                        endDate,
                        productId,
                        supplierId,
                        transactionType,
                        orderStatus,
                        paymentStatus
                );

        byte[] csv = managementReportService
                .exportReportAsCsv(filter);

        String fileName = reportType.name()
                .toLowerCase()
                + "-report-"
                + LocalDate.now()
                + ".csv";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                fileName + "\""
                )
                .contentType(
                        new MediaType(
                                "text",
                                "csv"
                        )
                )
                .body(csv);
    }
}
