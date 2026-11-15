package com.sparehub.service.inventory;

import com.sparehub.dto.inventory.stock.InventoryTransactionResponse;
import com.sparehub.dto.inventory.stock.StockAdjustmentRequest;
import com.sparehub.dto.inventory.stock.StockSummaryResponse;
import com.sparehub.entity.inventory.InventoryTransaction;
import com.sparehub.entity.inventory.InventoryTransactionType;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.InventoryTransactionRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryTransactionService {

    private static final Set<InventoryTransactionType>
            MANUAL_ADJUSTMENT_TYPES =
            EnumSet.of(
                    InventoryTransactionType.STOCK_IN,
                    InventoryTransactionType.DAMAGED,
                    InventoryTransactionType.MISSING,
                    InventoryTransactionType
                            .CORRECTION_INCREASE,
                    InventoryTransactionType
                            .CORRECTION_DECREASE
            );

    private final SparePartRepository
            sparePartRepository;

    private final InventoryTransactionRepository
            inventoryTransactionRepository;

    private final LowStockAlertService
            lowStockAlertService;

    public StockSummaryResponse adjustStock(
            Long sparePartId,
            StockAdjustmentRequest request
    ) {
        validateManualAdjustmentType(
                request.adjustmentType()
        );

        SparePart sparePart =
                findSparePartForStockUpdate(
                        sparePartId
                );

        if (
                sparePart.getStatus()
                        == SparePartStatus.DISCONTINUED
        ) {
            throw new BadRequestException(
                    "Stock cannot be adjusted for a discontinued spare part"
            );
        }

        int quantityBefore =
                sparePart.getStockQuantity();

        int signedQuantity =
                calculateSignedQuantity(
                        request.adjustmentType(),
                        request.quantity()
                );

        int quantityAfter =
                quantityBefore + signedQuantity;

        if (quantityAfter < 0) {
            throw new BadRequestException(
                    "Insufficient stock. Current stock quantity is "
                            + quantityBefore
            );
        }

        sparePart.changeStockQuantity(
                quantityAfter
        );

        SparePart updatedSparePart =
                sparePartRepository.save(
                        sparePart
                );

        InventoryTransaction transaction =
                createTransaction(
                        updatedSparePart,
                        request.adjustmentType(),
                        signedQuantity,
                        quantityBefore,
                        quantityAfter,
                        normalizeReason(
                                request.reason()
                        ),
                        normalizeOptionalText(
                                request.referenceNumber()
                        ),
                        "MANUAL",
                        null,
                        getAuthenticatedEmail()
                );

        InventoryTransaction savedTransaction =
                inventoryTransactionRepository.save(
                        transaction
                );

        lowStockAlertService.evaluateLowStock(
                updatedSparePart
        );

        return mapToStockSummary(
                updatedSparePart,
                savedTransaction
        );
    }

    /*
     * Spare part එකක් create කරන අවස්ථාවේ
     * initial stock transaction එක record කරනවා.
     *
     * Stock quantity එක zero වුණත් low-stock
     * alert එක evaluate කරනවා.
     */
    public void recordInitialStock(
            SparePart sparePart
    ) {
        if (
                sparePart.getStockQuantity() != null &&
                        sparePart.getStockQuantity() > 0
        ) {
            InventoryTransaction transaction =
                    createTransaction(
                            sparePart,
                            InventoryTransactionType
                                    .INITIAL_STOCK,
                            sparePart.getStockQuantity(),
                            0,
                            sparePart.getStockQuantity(),
                            "Initial stock recorded when spare part was created",
                            null,
                            "PRODUCT_CREATION",
                            sparePart.getId(),
                            getAuthenticatedEmail()
                    );

            inventoryTransactionRepository.save(
                    transaction
            );
        }

        lowStockAlertService.evaluateLowStock(
                sparePart
        );
    }

    /*
     * Epic 3 sale completion logic එකෙන්
     * call කරන method එක.
     */
    public void recordSaleStockReduction(
            Long sparePartId,
            Integer quantity,
            Long orderId,
            String orderNumber
    ) {
        if (
                quantity == null ||
                        quantity <= 0
        ) {
            throw new BadRequestException(
                    "Sale quantity must be greater than zero"
            );
        }

        SparePart sparePart =
                findSparePartForStockUpdate(
                        sparePartId
                );

        if (
                sparePart.getStatus()
                        != SparePartStatus.ACTIVE
        ) {
            throw new BadRequestException(
                    "Only active spare parts can be sold"
            );
        }

        int quantityBefore =
                sparePart.getStockQuantity();

        if (quantityBefore < quantity) {
            throw new BadRequestException(
                    "Insufficient stock for spare part: "
                            + sparePart.getPartNumber()
            );
        }

        sparePart.decreaseStock(
                quantity
        );

        SparePart updatedSparePart =
                sparePartRepository.save(
                        sparePart
                );

        InventoryTransaction transaction =
                createTransaction(
                        updatedSparePart,
                        InventoryTransactionType.SALE,
                        -quantity,
                        quantityBefore,
                        updatedSparePart
                                .getStockQuantity(),
                        "Stock deducted for completed sale",
                        orderNumber,
                        "ORDER",
                        orderId,
                        getAuthenticatedEmail()
                );

        inventoryTransactionRepository.save(
                transaction
        );

        lowStockAlertService.evaluateLowStock(
                updatedSparePart
        );
    }

    /*
     * Eligible cancellation එකකින්
     * stock restore කරන method එක.
     */
    public void recordSaleReversal(
            Long sparePartId,
            Integer quantity,
            Long orderId,
            String orderNumber
    ) {
        if (
                quantity == null ||
                        quantity <= 0
        ) {
            throw new BadRequestException(
                    "Reversal quantity must be greater than zero"
            );
        }

        SparePart sparePart =
                findSparePartForStockUpdate(
                        sparePartId
                );

        int quantityBefore =
                sparePart.getStockQuantity();

        sparePart.increaseStock(
                quantity
        );

        SparePart updatedSparePart =
                sparePartRepository.save(
                        sparePart
                );

        InventoryTransaction transaction =
                createTransaction(
                        updatedSparePart,
                        InventoryTransactionType
                                .SALE_REVERSAL,
                        quantity,
                        quantityBefore,
                        updatedSparePart
                                .getStockQuantity(),
                        "Stock restored after order cancellation",
                        orderNumber,
                        "ORDER",
                        orderId,
                        getAuthenticatedEmail()
                );

        inventoryTransactionRepository.save(
                transaction
        );

        lowStockAlertService.evaluateLowStock(
                updatedSparePart
        );
    }

    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse>
    getSparePartTransactionHistory(
            Long sparePartId,
            int page,
            int size
    ) {
        validatePagination(
                page,
                size
        );

        if (
                !sparePartRepository.existsById(
                        sparePartId
                )
        ) {
            throw new ResourceNotFoundException(
                    "Spare part not found with ID: "
                            + sparePartId
            );
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return inventoryTransactionRepository
                .findBySparePartIdOrderByCreatedAtDesc(
                        sparePartId,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse>
    getAllTransactionHistory(
            Long sparePartId,
            InventoryTransactionType type,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        validatePagination(
                page,
                size
        );

        if (
                fromDate != null &&
                        toDate != null &&
                        fromDate.isAfter(toDate)
        ) {
            throw new BadRequestException(
                    "From date cannot be after to date"
            );
        }

        LocalDateTime fromDateTime =
                fromDate == null
                        ? null
                        : fromDate.atStartOfDay();

        LocalDateTime toDateTime =
                toDate == null
                        ? null
                        : toDate.atTime(
                        LocalTime.MAX
                );

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return inventoryTransactionRepository
                .searchTransactionHistory(
                        sparePartId,
                        type,
                        fromDateTime,
                        toDateTime,
                        pageable
                )
                .map(this::mapToResponse);
    }

    private SparePart findSparePartForStockUpdate(
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
                .findByIdForStockUpdate(
                        sparePartId
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Spare part not found with ID: "
                                                + sparePartId
                                )
                );
    }

    private void validateManualAdjustmentType(
            InventoryTransactionType type
    ) {
        if (
                type == null ||
                        !MANUAL_ADJUSTMENT_TYPES.contains(
                                type
                        )
        ) {
            throw new BadRequestException(
                    "Invalid manual stock adjustment type"
            );
        }
    }

    private int calculateSignedQuantity(
            InventoryTransactionType type,
            int quantity
    ) {
        return switch (type) {
            case STOCK_IN,
                 CORRECTION_INCREASE -> quantity;

            case DAMAGED,
                 MISSING,
                 CORRECTION_DECREASE -> -quantity;

            default ->
                    throw new BadRequestException(
                            "Unsupported manual adjustment type"
                    );
        };
    }

    private InventoryTransaction createTransaction(
            SparePart sparePart,
            InventoryTransactionType type,
            Integer quantityChange,
            Integer quantityBefore,
            Integer quantityAfter,
            String reason,
            String referenceNumber,
            String referenceType,
            Long referenceId,
            String performedByEmail
    ) {
        InventoryTransaction transaction =
                new InventoryTransaction();

        transaction.setSparePart(
                sparePart
        );

        transaction.setTransactionType(
                type
        );

        transaction.setQuantityChange(
                quantityChange
        );

        transaction.setQuantityBefore(
                quantityBefore
        );

        transaction.setQuantityAfter(
                quantityAfter
        );

        transaction.setReason(
                reason
        );

        transaction.setReferenceNumber(
                referenceNumber
        );

        transaction.setReferenceType(
                referenceType
        );

        transaction.setReferenceId(
                referenceId
        );

        transaction.setPerformedByEmail(
                performedByEmail
        );

        return transaction;
    }

    private StockSummaryResponse mapToStockSummary(
            SparePart sparePart,
            InventoryTransaction transaction
    ) {
        return new StockSummaryResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getStockQuantity(),
                sparePart.getReorderLevel(),
                sparePart.isAvailable(),
                sparePart.isLowStock(),
                mapToResponse(transaction)
        );
    }

    private InventoryTransactionResponse mapToResponse(
            InventoryTransaction transaction
    ) {
        return new InventoryTransactionResponse(
                transaction.getId(),
                transaction.getSparePart()
                        .getId(),
                transaction.getSparePart()
                        .getPartNumber(),
                transaction.getSparePart()
                        .getName(),
                transaction.getTransactionType(),
                transaction.getQuantityChange(),
                transaction.getQuantityBefore(),
                transaction.getQuantityAfter(),
                transaction.getReason(),
                transaction.getReferenceNumber(),
                transaction.getReferenceType(),
                transaction.getReferenceId(),
                transaction.getPerformedByEmail(),
                transaction.getCreatedAt()
        );
    }

    private String getAuthenticatedEmail() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null ||
                        !authentication.isAuthenticated()
        ) {
            return "SYSTEM";
        }

        String username =
                authentication.getName();

        if (
                username == null ||
                        username.isBlank() ||
                        "anonymousUser".equals(username)
        ) {
            return "SYSTEM";
        }

        return username;
    }

    private String normalizeReason(
            String reason
    ) {
        if (
                reason == null ||
                        reason.isBlank()
        ) {
            throw new BadRequestException(
                    "A reason is required for every stock adjustment"
            );
        }

        return reason.trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null ||
                        value.isBlank()
        ) {
            return null;
        }

        return value.trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
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

        if (
                size < 1 ||
                        size > 100
        ) {
            throw new BadRequestException(
                    "Page size must be between 1 and 100"
            );
        }
    }
    public void recordSupplierPurchaseReceipt(
            Long sparePartId,
            Integer quantity,
            Long supplierId,
            String supplierCode,
            Long purchaseId,
            String purchaseNumber
    ) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException(
                    "Received quantity must be greater than zero"
            );
        }

        SparePart sparePart =
                findSparePartForStockUpdate(
                        sparePartId
                );

        if (
                sparePart.getStatus()
                        == SparePartStatus.DISCONTINUED
        ) {
            throw new BadRequestException(
                    "Stock cannot be received for a discontinued spare part"
            );
        }

        int quantityBefore =
                sparePart.getStockQuantity();

        sparePart.increaseStock(quantity);

        SparePart updatedSparePart =
                sparePartRepository.save(
                        sparePart
                );

        String supplierReference =
                supplierCode == null ||
                        supplierCode.isBlank()
                        ? "Supplier ID " + supplierId
                        : supplierCode.trim();

        InventoryTransaction transaction =
                createTransaction(
                        updatedSparePart,
                        InventoryTransactionType.PURCHASE,
                        quantity,
                        quantityBefore,
                        updatedSparePart
                                .getStockQuantity(),
                        "Stock received from supplier "
                                + supplierReference,
                        normalizeOptionalText(
                                purchaseNumber
                        ),
                        "SUPPLIER_PURCHASE",
                        purchaseId,
                        getAuthenticatedEmail()
                );

        inventoryTransactionRepository.save(
                transaction
        );

        lowStockAlertService.evaluateLowStock(
                updatedSparePart
        );
    }
}