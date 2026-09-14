package com.sparehub.dto.inventory.alert;



import java.util.List;

public record LowStockDashboardResponse(

        long totalLowStockProducts,

        long openAlerts,

        long acknowledgedAlerts,

        List<LowStockResponse> products
) {
}
