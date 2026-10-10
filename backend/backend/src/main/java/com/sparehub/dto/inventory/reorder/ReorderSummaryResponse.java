package com.sparehub.dto.inventory.reorder;

import java.math.BigDecimal;
import java.util.List;

public record ReorderSummaryResponse(
        int totalPartsEvaluated,
        int recommendationsCount,
        int criticalShortageCount,
        int pendingOrdersCoveredCount,
        BigDecimal estimatedTotalProcurementCost,
        List<ReorderRecommendationResponse> recommendations
) {
}
