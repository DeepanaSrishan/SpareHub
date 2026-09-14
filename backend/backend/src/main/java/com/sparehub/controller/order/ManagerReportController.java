package com.sparehub.controller.order;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.response.order.PaymentReportResponse;
import com.sparehub.dto.response.order.SalesReportResponse;
import com.sparehub.service.order.ManagerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/manager/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagerReportController {

    private final ManagerReportService
            managerReportService;

    /*
     * US-42: Sales report
     *
     * Example:
     * /api/manager/reports/sales
     *
     * /api/manager/reports/sales
     * ?startDate=2026-09-01
     * &endDate=2026-09-30
     */
    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesReportResponse>>
    getSalesReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        SalesReportResponse response =
                managerReportService.generateSalesReport(
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales report generated successfully",
                        response
                )
        );
    }

    /*
     * US-43: Payment report
     */
    @GetMapping("/payments")
    public ResponseEntity<
            ApiResponse<PaymentReportResponse>
            > getPaymentReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        PaymentReportResponse response =
                managerReportService.generatePaymentReport(
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment report generated successfully",
                        response
                )
        );
    }
}
