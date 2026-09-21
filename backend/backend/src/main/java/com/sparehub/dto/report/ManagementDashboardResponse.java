package com.sparehub.dto.report;



import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ManagementDashboardResponse(

        SalesSummary sales,
        OrderSummary orders,
        InventorySummary inventory,
        SupplierSummary suppliers,
        PaymentSummary payments,

        LocalDateTime generatedAt
) {

    public record SalesSummary(
            long completedSales,
            BigDecimal grossSales,
            BigDecimal discounts,
            BigDecimal refunds,
            BigDecimal netSales
    ) {
    }

    public record OrderSummary(
            long totalOrders,
            long pendingOrders,
            long confirmedOrders,
            long completedOrders,
            long cancelledOrders
    ) {
    }

    public record InventorySummary(
            long totalProducts,
            long activeProducts,
            long inactiveProducts,
            long lowStockProducts,
            long outOfStockProducts,
            long totalStockUnits,
            BigDecimal estimatedStockValue
    ) {
    }

    public record SupplierSummary(
            long totalSuppliers,
            long activeSuppliers,
            long inactiveSuppliers,
            long pendingPurchases,
            long receivedPurchases,
            long cancelledPurchases
    ) {
    }

    public record PaymentSummary(
            long completedPayments,
            long pendingPayments,
            long failedPayments,
            long refundedPayments,
            BigDecimal totalReceivedAmount
    ) {
    }
}