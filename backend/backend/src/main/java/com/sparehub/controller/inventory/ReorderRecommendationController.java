package com.sparehub.controller.inventory;

import com.sparehub.dto.inventory.reorder.ReorderRecommendationResponse;
import com.sparehub.dto.inventory.reorder.ReorderSummaryResponse;
import com.sparehub.dto.response.ApiResponse;
import com.sparehub.service.inventory.ReorderRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/inventory/reorder-recommendations", "/api/reorder-recommendations", "/inventory/reorder-recommendations"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
public class ReorderRecommendationController {

    private final ReorderRecommendationService reorderRecommendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReorderSummaryResponse>> getRecommendations(
            @RequestParam(required = false, defaultValue = "false") Boolean includeAdequate
    ) {
        ReorderSummaryResponse response = reorderRecommendationService.getReorderRecommendations(includeAdequate);
        return ResponseEntity.ok(ApiResponse.success("Reorder recommendations calculated successfully", response));
    }

    @GetMapping("/{sparePartId}")
    public ResponseEntity<ApiResponse<ReorderRecommendationResponse>> getRecommendationForPart(
            @PathVariable Long sparePartId
    ) {
        ReorderRecommendationResponse response = reorderRecommendationService.getRecommendationForPart(sparePartId);
        return ResponseEntity.ok(ApiResponse.success("Part reorder recommendation calculated successfully", response));
    }
}
