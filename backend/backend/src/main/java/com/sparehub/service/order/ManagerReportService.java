package com.sparehub.service.order;



import com.sparehub.dto.response.order.PaymentReportResponse;
import com.sparehub.dto.response.order.SalesReportResponse;

import java.time.LocalDate;

public interface ManagerReportService {

    SalesReportResponse generateSalesReport(
            LocalDate startDate,
            LocalDate endDate
    );

    PaymentReportResponse generatePaymentReport(
            LocalDate startDate,
            LocalDate endDate
    );
}
