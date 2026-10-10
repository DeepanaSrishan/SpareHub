package com.sparehub.service.inventory;

import com.sparehub.dto.inventory.reorder.ReorderRecommendationResponse;
import com.sparehub.dto.inventory.reorder.ReorderSummaryResponse;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.entity.supplier.PurchaseStatus;
import com.sparehub.entity.supplier.SupplierProduct;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.SparePartRepository;
import com.sparehub.repository.supplier.SupplierProductRepository;
import com.sparehub.repository.supplier.SupplierPurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReorderRecommendationServiceImpl implements ReorderRecommendationService {

    private final SparePartRepository sparePartRepository;
    private final SupplierPurchaseRepository supplierPurchaseRepository;
    private final SupplierProductRepository supplierProductRepository;

    @Override
    public ReorderSummaryResponse getReorderRecommendations(Boolean includeAdequate) {
        boolean showAll = Boolean.TRUE.equals(includeAdequate);

        List<SparePart> parts = sparePartRepository.findAll()
                .stream()
                .filter(part -> part.getStatus() == SparePartStatus.ACTIVE)
                .sorted(Comparator.comparing(SparePart::getName))
                .toList();

        List<ReorderRecommendationResponse> recommendations = new ArrayList<>();
        int criticalCount = 0;
        int pendingOrdersCoveredCount = 0;
        BigDecimal totalEstimatedCost = BigDecimal.ZERO;

        for (SparePart part : parts) {
            ReorderRecommendationResponse rec = evaluatePart(part);

            boolean needsReorder = rec.currentStock() <= rec.reorderLevel();

            if (rec.currentStock() == 0) {
                criticalCount++;
            }

            if ("ORDER_PENDING".equals(rec.urgencyStatus())) {
                pendingOrdersCoveredCount++;
            }

            if (needsReorder || showAll) {
                recommendations.add(rec);
                if (rec.estimatedTotalCost() != null) {
                    totalEstimatedCost = totalEstimatedCost.add(rec.estimatedTotalCost());
                }
            }
        }

        recommendations.sort((a, b) -> {
            int scoreA = getPriorityScore(a);
            int scoreB = getPriorityScore(b);
            return Integer.compare(scoreB, scoreA);
        });

        return new ReorderSummaryResponse(
                parts.size(),
                recommendations.size(),
                criticalCount,
                pendingOrdersCoveredCount,
                totalEstimatedCost.setScale(2, RoundingMode.HALF_UP),
                recommendations
        );
    }

    @Override
    public ReorderRecommendationResponse getRecommendationForPart(Long sparePartId) {
        SparePart part = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found with ID: " + sparePartId));
        return evaluatePart(part);
    }

    private ReorderRecommendationResponse evaluatePart(SparePart part) {
        int currentStock = part.getStockQuantity() == null ? 0 : Math.max(0, part.getStockQuantity());
        int reorderLevel = part.getReorderLevel() == null ? 5 : Math.max(1, part.getReorderLevel());
        int netShortage = Math.max(0, reorderLevel - currentStock);

        // Sum up outstanding quantities in ORDERED status
        List<com.sparehub.entity.supplier.SupplierPurchase> pendingPurchases =
                supplierPurchaseRepository.findAllBySparePartIdAndStatus(part.getId(), PurchaseStatus.ORDERED);

        int pendingOrdered = pendingPurchases.stream()
                .mapToInt(p -> {
                    int ordered = p.getOrderedQuantity() == null ? 0 : p.getOrderedQuantity();
                    int received = p.getReceivedQuantity() == null ? 0 : p.getReceivedQuantity();
                    return Math.max(0, ordered - received);
                })
                .sum();

        int effectiveStock = currentStock + pendingOrdered;

        // Replenishment policy: Target buffer = max(reorderLevel * 2, reorderLevel + 10)
        int targetStock = Math.max(reorderLevel * 2, reorderLevel + 10);
        int deficit = targetStock - effectiveStock;

        int suggestedQuantity;
        String urgencyStatus;
        StringBuilder reason = new StringBuilder();

        if (currentStock == 0) {
            urgencyStatus = "CRITICAL_OUT_OF_STOCK";
            reason.append("Stock is completely depleted (0 units). ");
        } else if (currentStock <= reorderLevel) {
            if (effectiveStock > reorderLevel) {
                urgencyStatus = "ORDER_PENDING";
                reason.append("Stock (").append(currentStock).append(") is at/below reorder level (")
                        .append(reorderLevel).append("), but ").append(pendingOrdered)
                        .append(" units are already on order across pending PO(s), bringing effective stock to ")
                        .append(effectiveStock).append(". ");
            } else {
                urgencyStatus = "LOW_STOCK_ALERT";
                reason.append("Stock (").append(currentStock).append(") is at/below reorder level (")
                        .append(reorderLevel).append("). Net shortage of ").append(netShortage).append(" units. ");
            }
        } else {
            urgencyStatus = "ADEQUATELY_STOCKED";
            reason.append("Stock (").append(currentStock).append(") is above reorder level (").append(reorderLevel).append("). ");
        }

        if ("ORDER_PENDING".equals(urgencyStatus)) {
            suggestedQuantity = 0;
            reason.append("No immediate duplicate order is necessary.");
        } else if (currentStock <= reorderLevel) {
            suggestedQuantity = Math.max(deficit, Math.max(10, netShortage));
            reason.append("Recommended replenishment: ").append(suggestedQuantity).append(" units to restore target buffer (")
                    .append(targetStock).append(").");
        } else {
            suggestedQuantity = 0;
            reason.append("No reorder required.");
        }

        // Active supplier offerings
        List<SupplierProduct> activeProducts =
                supplierProductRepository.findActiveSuppliersBySparePartId(part.getId())
                        .stream()
                        .filter(sp -> sp.getSupplier() != null && sp.getSupplier().isEligibleForPurchase())
                        .toList();

        List<ReorderRecommendationResponse.AvailableSupplierOption> availableSuppliers = activeProducts.stream()
                .map(sp -> new ReorderRecommendationResponse.AvailableSupplierOption(
                        sp.getSupplier().getId(),
                        sp.getSupplier().getSupplierCode(),
                        getSupplierDisplayName(sp.getSupplier()),
                        sp.getId(),
                        sp.getPurchasePrice(),
                        sp.getMinimumOrderQuantity(),
                        sp.getLeadTimeDays(),
                        Boolean.TRUE.equals(sp.getPreferred())
                ))
                .toList();

        // Resolve preferred supplier
        Optional<SupplierProduct> preferredOpt = activeProducts.stream()
                .filter(sp -> Boolean.TRUE.equals(sp.getPreferred()))
                .findFirst();

        SupplierProduct chosenSupplierProduct = preferredOpt.orElseGet(() ->
                activeProducts.isEmpty() ? null : activeProducts.get(0)
        );

        Long preferredSupplierId = null;
        String preferredSupplierCode = null;
        String preferredSupplierName = null;
        Long preferredSupplierProductId = null;
        BigDecimal unitPurchasePrice = null;
        Integer minimumOrderQuantity = null;
        Integer leadTimeDays = null;
        BigDecimal estimatedTotalCost = null;

        if (chosenSupplierProduct != null) {
            preferredSupplierId = chosenSupplierProduct.getSupplier().getId();
            preferredSupplierCode = chosenSupplierProduct.getSupplier().getSupplierCode();
            preferredSupplierName = getSupplierDisplayName(chosenSupplierProduct.getSupplier());
            preferredSupplierProductId = chosenSupplierProduct.getId();
            unitPurchasePrice = chosenSupplierProduct.getPurchasePrice();
            minimumOrderQuantity = chosenSupplierProduct.getMinimumOrderQuantity();
            leadTimeDays = chosenSupplierProduct.getLeadTimeDays();

            // Adjust suggested quantity to MOQ if order is needed
            if (suggestedQuantity > 0 && minimumOrderQuantity != null && suggestedQuantity < minimumOrderQuantity) {
                suggestedQuantity = minimumOrderQuantity;
                reason.append(" Adjusted to supplier minimum order quantity (MOQ: ").append(minimumOrderQuantity).append(").");
            }

            if (unitPurchasePrice != null && suggestedQuantity > 0) {
                estimatedTotalCost = unitPurchasePrice.multiply(BigDecimal.valueOf(suggestedQuantity))
                        .setScale(2, RoundingMode.HALF_UP);
            }
        } else if (part.getCostPrice() != null && suggestedQuantity > 0 && part.getCostPrice().compareTo(BigDecimal.ZERO) > 0) {
            estimatedTotalCost = part.getCostPrice().multiply(BigDecimal.valueOf(suggestedQuantity))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        String categoryName = part.getCategory() != null ? part.getCategory().getName() : "General";

        return new ReorderRecommendationResponse(
                part.getId(),
                part.getPartNumber(),
                part.getName(),
                part.getBrand(),
                categoryName,
                currentStock,
                reorderLevel,
                netShortage,
                pendingOrdered,
                effectiveStock,
                suggestedQuantity,
                preferredSupplierId,
                preferredSupplierCode,
                preferredSupplierName,
                preferredSupplierProductId,
                unitPurchasePrice,
                estimatedTotalCost,
                minimumOrderQuantity,
                leadTimeDays,
                reason.toString().trim(),
                urgencyStatus,
                availableSuppliers
        );
    }

    private int getPriorityScore(ReorderRecommendationResponse r) {
        return switch (r.urgencyStatus()) {
            case "CRITICAL_OUT_OF_STOCK" -> 400;
            case "LOW_STOCK_ALERT" -> 300;
            case "ORDER_PENDING" -> 100;
            default -> 0;
        };
    }

    private String getSupplierDisplayName(com.sparehub.entity.supplier.Supplier s) {
        if (s == null) return "";
        if (s.getCompanyName() != null && !s.getCompanyName().isBlank()) {
            return s.getCompanyName().trim();
        }
        if (s.getContactPerson() != null && !s.getContactPerson().isBlank()) {
            return s.getContactPerson().trim();
        }
        return s.getSupplierCode();
    }
}
