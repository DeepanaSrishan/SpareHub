package com.sparehub.service.report;



import com.sparehub.dto.inventory.stock.InventoryTransactionResponse;
import com.sparehub.dto.report.inventory.CategoryInventorySummaryResponse;
import com.sparehub.dto.report.inventory.InventoryMovementSummaryResponse;
import com.sparehub.dto.report.inventory.InventoryMovementTypeSummary;
import com.sparehub.dto.report.inventory.InventoryReportSummaryResponse;
import com.sparehub.dto.report.inventory.InventoryStockReportResponse;
import com.sparehub.entity.inventory.InventoryTransaction;
import com.sparehub.entity.inventory.InventoryTransactionType;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.repository.CategoryRepository;
import com.sparehub.repository.InventoryTransactionRepository;
import com.sparehub.repository.SparePartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryReportService {

    private final SparePartRepository
            sparePartRepository;

    private final CategoryRepository
            categoryRepository;

    private final InventoryTransactionRepository
            inventoryTransactionRepository;

    public InventoryReportSummaryResponse
    getInventorySummary() {
        List<SparePart> spareParts =
                sparePartRepository
                        .findAllWithCategory();

        long activeProducts =
                spareParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.ACTIVE
                        )
                        .count();

        long inactiveProducts =
                spareParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.INACTIVE
                        )
                        .count();

        long discontinuedProducts =
                spareParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus
                                        .DISCONTINUED
                        )
                        .count();

        long lowStockProducts =
                spareParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.ACTIVE
                        )
                        .filter(SparePart::isLowStock)
                        .count();

        long outOfStockProducts =
                spareParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.ACTIVE
                        )
                        .filter(part ->
                                part.getStockQuantity() == 0
                        )
                        .count();

        long totalStockQuantity =
                spareParts.stream()
                        .mapToLong(part ->
                                part.getStockQuantity() == null
                                        ? 0
                                        : part.getStockQuantity()
                        )
                        .sum();

        BigDecimal totalCostValue =
                spareParts.stream()
                        .map(this::calculateStockCostValue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalSellingValue =
                spareParts.stream()
                        .map(this::calculateStockSellingValue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal potentialProfitValue =
                totalSellingValue.subtract(
                        totalCostValue
                );

        return new InventoryReportSummaryResponse(
                categoryRepository.count(),
                spareParts.size(),
                activeProducts,
                inactiveProducts,
                discontinuedProducts,
                lowStockProducts,
                outOfStockProducts,
                totalStockQuantity,
                totalCostValue,
                totalSellingValue,
                potentialProfitValue,
                createCategorySummaries(spareParts),
                LocalDateTime.now()
        );
    }

    public Page<InventoryStockReportResponse>
    getStockReport(
            String search,
            SparePartStatus status,
            Long categoryId,
            Boolean lowStock,
            Boolean available,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        validatePagination(page, size);

        String keyword =
                search == null
                        ? ""
                        : search.trim();

        /*
         * Repository query එකෙන් search/status/category
         * filters apply කරනවා.
         */
        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        createStockSort(
                                sortBy,
                                direction
                        )
                );

        return sparePartRepository
                .searchInventoryReport(
                        keyword,
                        status,
                        categoryId,
                        lowStock,
                        available,
                        pageable
                )
                .map(this::mapToStockReport);

        /*
         * lowStock/available filters database query එකට
         * add කිරීම Step 6 query duplicate කරන නිසා,
         * reporting සඳහා filtered result එක map කරනවා.
         *
         * Exact totalElements අවශ්‍ය production report එකකට
         * මේ filters repository query එකට මාරු කරන්න.
         */

    }

    public InventoryMovementSummaryResponse
    getMovementSummary(
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateRange dateRange =
                createDateRange(
                        fromDate,
                        toDate
                );

        List<InventoryTransaction> transactions =
                inventoryTransactionRepository
                        .findAllForMovementReport(
                                dateRange.fromDateTime(),
                                dateRange.toDateTime()
                        );

        long totalStockIn =
                transactions.stream()
                        .mapToLong(transaction ->
                                Math.max(
                                        transaction
                                                .getQuantityChange(),
                                        0
                                )
                        )
                        .sum();

        long totalStockOut =
                transactions.stream()
                        .mapToLong(transaction ->
                                Math.abs(
                                        Math.min(
                                                transaction
                                                        .getQuantityChange(),
                                                0
                                        )
                                )
                        )
                        .sum();

        long netStockMovement =
                transactions.stream()
                        .mapToLong(
                                InventoryTransaction
                                        ::getQuantityChange
                        )
                        .sum();

        Map<InventoryTransactionType, List<InventoryTransaction>>
                groupedTransactions =
                new EnumMap<>(
                        InventoryTransactionType.class
                );

        for (
                InventoryTransaction transaction
                : transactions
        ) {
            groupedTransactions
                    .computeIfAbsent(
                            transaction
                                    .getTransactionType(),
                            ignored ->
                                    new ArrayList<>()
                    )
                    .add(transaction);
        }

        List<InventoryMovementTypeSummary>
                movementByType =
                groupedTransactions
                        .entrySet()
                        .stream()
                        .map(entry ->
                                new InventoryMovementTypeSummary(
                                        entry.getKey(),
                                        entry.getValue()
                                                .size(),
                                        entry.getValue()
                                                .stream()
                                                .mapToLong(
                                                        InventoryTransaction
                                                                ::getQuantityChange
                                                )
                                                .sum()
                                )
                        )
                        .toList();

        return new InventoryMovementSummaryResponse(
                dateRange.fromDate(),
                dateRange.toDate(),
                transactions.size(),
                totalStockIn,
                totalStockOut,
                netStockMovement,
                movementByType,
                LocalDateTime.now()
        );
    }

    public Page<InventoryTransactionResponse>
    getTransactionReport(
            Long sparePartId,
            InventoryTransactionType type,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        validatePagination(page, size);

        DateRange dateRange =
                createDateRange(
                        fromDate,
                        toDate
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
                        dateRange.fromDateTime(),
                        dateRange.toDateTime(),
                        pageable
                )
                .map(this::mapTransaction);
    }

    private List<CategoryInventorySummaryResponse>
    createCategorySummaries(
            List<SparePart> spareParts
    ) {
        Map<Long, List<SparePart>> categoryGroups =
                new LinkedHashMap<>();

        for (SparePart part : spareParts) {
            categoryGroups
                    .computeIfAbsent(
                            part.getCategory().getId(),
                            ignored ->
                                    new ArrayList<>()
                    )
                    .add(part);
        }

        return categoryGroups.values()
                .stream()
                .map(this::createCategorySummary)
                .toList();
    }

    private CategoryInventorySummaryResponse
    createCategorySummary(
            List<SparePart> categoryParts
    ) {
        SparePart firstPart =
                categoryParts.get(0);

        long activeProducts =
                categoryParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.ACTIVE
                        )
                        .count();

        long lowStockProducts =
                categoryParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.ACTIVE
                        )
                        .filter(SparePart::isLowStock)
                        .count();

        long outOfStockProducts =
                categoryParts.stream()
                        .filter(part ->
                                part.getStatus()
                                        == SparePartStatus.ACTIVE
                        )
                        .filter(part ->
                                part.getStockQuantity() == 0
                        )
                        .count();

        long stockQuantity =
                categoryParts.stream()
                        .mapToLong(part ->
                                part.getStockQuantity() == null
                                        ? 0
                                        : part.getStockQuantity()
                        )
                        .sum();

        BigDecimal costValue =
                categoryParts.stream()
                        .map(this::calculateStockCostValue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal sellingValue =
                categoryParts.stream()
                        .map(this::calculateStockSellingValue)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new CategoryInventorySummaryResponse(
                firstPart.getCategory().getId(),
                firstPart.getCategory().getName(),
                categoryParts.size(),
                activeProducts,
                lowStockProducts,
                outOfStockProducts,
                stockQuantity,
                costValue,
                sellingValue
        );
    }

    private InventoryStockReportResponse
    mapToStockReport(
            SparePart sparePart
    ) {
        BigDecimal costValue =
                calculateStockCostValue(
                        sparePart
                );

        BigDecimal sellingValue =
                calculateStockSellingValue(
                        sparePart
                );

        return new InventoryStockReportResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getBrand(),
                sparePart.getCategory().getId(),
                sparePart.getCategory().getName(),
                sparePart.getCostPrice(),
                sparePart.getSellingPrice(),
                sparePart.getStockQuantity(),
                sparePart.getReorderLevel(),
                sparePart.isAvailable(),
                sparePart.isLowStock(),
                costValue,
                sellingValue,
                sellingValue.subtract(costValue),
                sparePart.getStatus()
        );
    }

    private InventoryTransactionResponse
    mapTransaction(
            InventoryTransaction transaction
    ) {
        return new InventoryTransactionResponse(
                transaction.getId(),
                transaction.getSparePart().getId(),
                transaction.getSparePart()
                        .getPartNumber(),
                transaction.getSparePart().getName(),
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

    private BigDecimal calculateStockCostValue(
            SparePart sparePart
    ) {
        BigDecimal quantity =
                BigDecimal.valueOf(
                        sparePart.getStockQuantity() == null
                                ? 0
                                : sparePart
                                .getStockQuantity()
                );

        return sparePart
                .getCostPrice()
                .multiply(quantity);
    }

    private BigDecimal calculateStockSellingValue(
            SparePart sparePart
    ) {
        BigDecimal quantity =
                BigDecimal.valueOf(
                        sparePart.getStockQuantity() == null
                                ? 0
                                : sparePart
                                .getStockQuantity()
                );

        return sparePart
                .getSellingPrice()
                .multiply(quantity);
    }

    private DateRange createDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {
        LocalDate selectedToDate =
                toDate == null
                        ? LocalDate.now()
                        : toDate;

        LocalDate selectedFromDate =
                fromDate == null
                        ? selectedToDate.minusDays(29)
                        : fromDate;

        if (
                selectedFromDate.isAfter(
                        selectedToDate
                )
        ) {
            throw new BadRequestException(
                    "From date cannot be after to date"
            );
        }

        return new DateRange(
                selectedFromDate,
                selectedToDate,
                selectedFromDate.atStartOfDay(),
                selectedToDate.atTime(
                        LocalTime.MAX
                )
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

        if (size < 1 || size > 100) {
            throw new BadRequestException(
                    "Page size must be between 1 and 100"
            );
        }
    }

    private Sort createStockSort(
            String sortBy,
            String direction
    ) {
        List<String> allowedFields =
                List.of(
                        "name",
                        "partNumber",
                        "brand",
                        "costPrice",
                        "sellingPrice",
                        "stockQuantity",
                        "reorderLevel",
                        "status",
                        "createdAt"
                );

        String selectedField =
                allowedFields.contains(sortBy)
                        ? sortBy
                        : "name";

        Sort.Direction selectedDirection =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        return Sort.by(
                selectedDirection,
                selectedField
        );
    }

    private record DateRange(
            LocalDate fromDate,
            LocalDate toDate,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTime
    ) {
    }
}