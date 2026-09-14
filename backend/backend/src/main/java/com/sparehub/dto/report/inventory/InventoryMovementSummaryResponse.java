package com.sparehub.dto.report.inventory;



import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record InventoryMovementSummaryResponse(

        LocalDate fromDate,

        LocalDate toDate,

        long totalTransactions,

        long totalStockIn,

        long totalStockOut,

        long netStockMovement,

        List<InventoryMovementTypeSummary>
                movementByType,

        LocalDateTime generatedAt
) {
}
