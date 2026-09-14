package com.sparehub.dto.response.order;



import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record SalesReportResponse(

        LocalDate startDate,
        LocalDate endDate,

        Long totalOrders,
        Long completedOrders,
        Long cancelledOrders,
        Long pendingOrders,

        Integer totalUnitsSold,

        BigDecimal grossSales,
        BigDecimal totalDiscounts,
        BigDecimal averageOrderValue,

        Map<String, Long> ordersByStatus,
        List<ProductSalesSummary> productSales
) {
}
