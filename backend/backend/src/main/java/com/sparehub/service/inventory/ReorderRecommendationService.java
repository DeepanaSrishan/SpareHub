package com.sparehub.service.inventory;

import com.sparehub.dto.inventory.reorder.ReorderRecommendationResponse;
import com.sparehub.dto.inventory.reorder.ReorderSummaryResponse;

public interface ReorderRecommendationService {

    ReorderSummaryResponse getReorderRecommendations(Boolean includeAdequate);

    ReorderRecommendationResponse getRecommendationForPart(Long sparePartId);
}
