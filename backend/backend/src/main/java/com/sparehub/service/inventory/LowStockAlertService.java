package com.sparehub.service.inventory;



import com.sparehub.dto.inventory.alert.LowStockAlertResponse;
import com.sparehub.dto.inventory.alert.LowStockDashboardResponse;
import com.sparehub.dto.inventory.alert.LowStockResponse;
import com.sparehub.dto.inventory.alert.ReorderLevelRequest;
import com.sparehub.entity.inventory.InventoryAlertStatus;
import com.sparehub.entity.inventory.LowStockAlert;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.LowStockAlertRepository;
import com.sparehub.repository.SparePartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class LowStockAlertService {

    private static final Set<InventoryAlertStatus>
            ACTIVE_ALERT_STATUSES =
            Set.of(
                    InventoryAlertStatus.OPEN,
                    InventoryAlertStatus.ACKNOWLEDGED
            );

    private final LowStockAlertRepository
            lowStockAlertRepository;

    private final SparePartRepository
            sparePartRepository;

    /*
     * Stock හෝ reorder level වෙනස් කරන සෑම අවස්ථාවකම
     * මේ method එක call කරන්න.
     */
    public void evaluateLowStock(
            SparePart sparePart
    ) {
        boolean shouldHaveAlert =
                sparePart.getStatus()
                        == SparePartStatus.ACTIVE
                        && sparePart.isLowStock();

        var existingAlert =
                lowStockAlertRepository
                        .findFirstBySparePartIdAndStatusInOrderByCreatedAtDesc(
                                sparePart.getId(),
                                ACTIVE_ALERT_STATUSES
                        );

        if (shouldHaveAlert) {
            if (existingAlert.isPresent()) {
                LowStockAlert alert =
                        existingAlert.get();

                alert.setStockQuantity(
                        sparePart.getStockQuantity()
                );

                alert.setReorderLevel(
                        sparePart.getReorderLevel()
                );

                alert.setMessage(
                        createAlertMessage(sparePart)
                );

                lowStockAlertRepository.save(alert);
                return;
            }

            LowStockAlert alert =
                    new LowStockAlert();

            alert.setSparePart(sparePart);
            alert.setStockQuantity(
                    sparePart.getStockQuantity()
            );
            alert.setReorderLevel(
                    sparePart.getReorderLevel()
            );
            alert.setMessage(
                    createAlertMessage(sparePart)
            );
            alert.setStatus(
                    InventoryAlertStatus.OPEN
            );

            lowStockAlertRepository.save(alert);
            return;
        }

        resolveActiveAlerts(sparePart.getId());
    }

    public LowStockResponse updateReorderLevel(
            Long sparePartId,
            ReorderLevelRequest request
    ) {
        SparePart sparePart =
                findSparePartForUpdate(sparePartId);

        if (
                sparePart.getStatus()
                        == SparePartStatus.DISCONTINUED
        ) {
            throw new BadRequestException(
                    "Reorder level cannot be changed for a discontinued spare part"
            );
        }

        sparePart.changeReorderLevel(
                request.reorderLevel()
        );

        SparePart updatedSparePart =
                sparePartRepository.save(sparePart);

        evaluateLowStock(updatedSparePart);

        return mapToLowStockResponse(
                updatedSparePart
        );
    }

    @Transactional(readOnly = true)
    public List<LowStockResponse>
    getLowStockProducts() {
        return sparePartRepository
                .findLowStockSpareParts()
                .stream()
                .map(this::mapToLowStockResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LowStockDashboardResponse
    getLowStockDashboard() {
        List<LowStockResponse> products =
                getLowStockProducts();

        return new LowStockDashboardResponse(
                products.size(),
                lowStockAlertRepository.countByStatus(
                        InventoryAlertStatus.OPEN
                ),
                lowStockAlertRepository.countByStatus(
                        InventoryAlertStatus
                                .ACKNOWLEDGED
                ),
                products
        );
    }

    @Transactional(readOnly = true)
    public Page<LowStockAlertResponse> getAlerts(
            InventoryAlertStatus status,
            int page,
            int size
    ) {
        validatePagination(page, size);

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<LowStockAlert> alerts;

        if (status == null) {
            alerts =
                    lowStockAlertRepository
                            .findAllByOrderByCreatedAtDesc(
                                    pageable
                            );
        } else {
            alerts =
                    lowStockAlertRepository
                            .findByStatusOrderByCreatedAtDesc(
                                    status,
                                    pageable
                            );
        }

        return alerts.map(this::mapToAlertResponse);
    }

    public LowStockAlertResponse acknowledgeAlert(
            Long alertId
    ) {
        LowStockAlert alert =
                findAlertById(alertId);

        if (
                alert.getStatus()
                        == InventoryAlertStatus.RESOLVED
        ) {
            throw new BadRequestException(
                    "A resolved alert cannot be acknowledged"
            );
        }

        if (
                alert.getStatus()
                        == InventoryAlertStatus
                        .ACKNOWLEDGED
        ) {
            return mapToAlertResponse(alert);
        }

        alert.acknowledge(
                getAuthenticatedEmail()
        );

        return mapToAlertResponse(
                lowStockAlertRepository.save(alert)
        );
    }

    public void evaluateAllSpareParts() {
        List<SparePart> spareParts =
                sparePartRepository.findAll();

        for (SparePart sparePart : spareParts) {
            evaluateLowStock(sparePart);
        }
    }

    private void resolveActiveAlerts(
            Long sparePartId
    ) {
        List<LowStockAlert> activeAlerts =
                lowStockAlertRepository
                        .findAllBySparePartIdAndStatusIn(
                                sparePartId,
                                ACTIVE_ALERT_STATUSES
                        );

        for (LowStockAlert alert : activeAlerts) {
            alert.resolve();
        }

        lowStockAlertRepository.saveAll(
                activeAlerts
        );
    }

    private SparePart findSparePartForUpdate(
            Long sparePartId
    ) {
        if (
                sparePartId == null ||
                        sparePartId <= 0
        ) {
            throw new BadRequestException(
                    "Invalid spare-part ID"
            );
        }

        return sparePartRepository
                .findByIdForStockUpdate(sparePartId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Spare part not found with ID: "
                                                + sparePartId
                                )
                );
    }

    private LowStockAlert findAlertById(
            Long alertId
    ) {
        if (alertId == null || alertId <= 0) {
            throw new BadRequestException(
                    "Invalid alert ID"
            );
        }

        return lowStockAlertRepository
                .findById(alertId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Low-stock alert not found with ID: "
                                                + alertId
                                )
                );
    }

    private LowStockResponse mapToLowStockResponse(
            SparePart sparePart
    ) {
        int shortageQuantity = Math.max(
                sparePart.getReorderLevel()
                        - sparePart.getStockQuantity()
                        + 1,
                0
        );

        return new LowStockResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getBrand(),
                sparePart.getCategory().getName(),
                sparePart.getStockQuantity(),
                sparePart.getReorderLevel(),
                shortageQuantity,
                sparePart.getStatus(),
                sparePart.isAvailable(),
                sparePart.isLowStock()
        );
    }

    private LowStockAlertResponse mapToAlertResponse(
            LowStockAlert alert
    ) {
        return new LowStockAlertResponse(
                alert.getId(),
                alert.getSparePart().getId(),
                alert.getSparePart().getPartNumber(),
                alert.getSparePart().getName(),
                alert.getStockQuantity(),
                alert.getReorderLevel(),
                alert.getMessage(),
                alert.getStatus(),
                alert.getAcknowledgedByEmail(),
                alert.getAcknowledgedAt(),
                alert.getResolvedAt(),
                alert.getCreatedAt(),
                alert.getUpdatedAt()
        );
    }

    private String createAlertMessage(
            SparePart sparePart
    ) {
        return "Low stock detected for "
                + sparePart.getName()
                + " ("
                + sparePart.getPartNumber()
                + "). Current stock: "
                + sparePart.getStockQuantity()
                + ", reorder level: "
                + sparePart.getReorderLevel()
                + ".";
    }

    private String getAuthenticatedEmail() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null ||
                        !authentication.isAuthenticated() ||
                        authentication.getName() == null ||
                        authentication.getName().isBlank() ||
                        "anonymousUser".equals(
                                authentication.getName()
                        )
        ) {
            return "SYSTEM";
        }

        return authentication.getName();
    }

    private void validatePagination(
            int page,
            int size
    ) {
        if (page < 0) {
            throw new BadRequestException(
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "Page size must be between 1 and 100"
            );
        }
    }
}