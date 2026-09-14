package com.sparehub.dto.supplier;



import com.sparehub.entity.supplier.SupplierPerformanceRating;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SupplierPerformanceResponse(

        Long supplierId,
        String supplierCode,
        String supplierName,
        String companyName,

        LocalDate startDate,
        LocalDate endDate,

        long totalPurchaseOrders,
        long receivedOrders,
        long pendingOrders,
        long cancelledOrders,

        long deliveriesWithExpectedDate,
        long onTimeDeliveries,
        long lateDeliveries,

        BigDecimal onTimeDeliveryRate,
        BigDecimal cancellationRate,
        BigDecimal completionRate,

        BigDecimal averageDeliveryDays,
        BigDecimal totalReceivedPurchaseValue,

        long suppliedProductCount,
        long preferredProductCount,

        BigDecimal performanceScore,
        SupplierPerformanceRating performanceRating

) {
}