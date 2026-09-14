package com.sparehub.service.inventory;



import com.sparehub.dto.inventory.sparepart.SparePartCreateRequest;
import com.sparehub.dto.inventory.sparepart.SparePartResponse;
import com.sparehub.dto.inventory.sparepart.SparePartStatusRequest;
import com.sparehub.dto.inventory.sparepart.SparePartUpdateRequest;
import com.sparehub.entity.inventory.Category;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.CategoryRepository;
import com.sparehub.repository.SparePartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sparehub.service.inventory.InventoryTransactionService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryTransactionService
            inventoryTransactionService;
    private final LowStockAlertService
            lowStockAlertService;

    public SparePartResponse createSparePart(
            SparePartCreateRequest request
    ) {
        String partNumber =
                normalizePartNumber(request.partNumber());

        if (
                sparePartRepository
                        .existsByPartNumberIgnoreCase(
                                partNumber
                        )
        ) {
            throw new BadRequestException(
                    "A spare part with this part number already exists"
            );
        }

        Category category =
                getActiveCategory(request.categoryId());

        validatePrices(
                request.costPrice(),
                request.sellingPrice()
        );

        SparePart sparePart = new SparePart();

        sparePart.setPartNumber(partNumber);
        sparePart.setName(
                normalizeRequiredText(request.name())
        );
        sparePart.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );
        sparePart.setBrand(
                normalizeRequiredText(request.brand())
        );
        sparePart.setVehicleMake(
                normalizeOptionalText(
                        request.vehicleMake()
                )
        );
        sparePart.setVehicleModel(
                normalizeOptionalText(
                        request.vehicleModel()
                )
        );
        sparePart.setManufactureYear(
                normalizeOptionalText(
                        request.manufactureYear()
                )
        );
        sparePart.setCostPrice(
                normalizeMoney(request.costPrice())
        );
        sparePart.setSellingPrice(
                normalizeMoney(request.sellingPrice())
        );
        sparePart.changeStockQuantity(
                request.stockQuantity()
        );
        sparePart.changeReorderLevel(
                request.reorderLevel()
        );
        sparePart.setImageUrl(
                normalizeOptionalText(
                        request.imageUrl()
                )
        );
        sparePart.setStatus(
                SparePartStatus.ACTIVE
        );
        sparePart.setCategory(category);

        SparePart savedSparePart =
                sparePartRepository.save(sparePart);
        inventoryTransactionService.recordInitialStock(
                savedSparePart
        );

        return mapToResponse(savedSparePart);
    }

    @Transactional(readOnly = true)
    public Page<SparePartResponse> getInventorySpareParts(
            String search,
            SparePartStatus status,
            Long categoryId,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        validatePagination(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                createSort(sortBy, direction)
        );

        String keyword =
                search == null ? "" : search.trim();

        return sparePartRepository
                .searchInventory(
                        keyword,
                        status,
                        categoryId,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SparePartResponse getSparePartById(
            Long sparePartId
    ) {
        return mapToResponse(
                findSparePartById(sparePartId)
        );
    }

    @Transactional(readOnly = true)
    public Page<SparePartResponse>
    getActiveCatalogSpareParts(
            int page,
            int size
    ) {
        validatePagination(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.ASC,
                        "name"
                )
        );

        return sparePartRepository
                .findByStatus(
                        SparePartStatus.ACTIVE,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SparePartResponse
    getActiveCatalogSparePartById(
            Long sparePartId
    ) {
        SparePart sparePart =
                findSparePartById(sparePartId);

        if (
                sparePart.getStatus()
                        != SparePartStatus.ACTIVE
        ) {
            throw new ResourceNotFoundException(
                    "Active spare part not found with ID: "
                            + sparePartId
            );
        }

        return mapToResponse(sparePart);
    }

    public SparePartResponse updateSparePart(
            Long sparePartId,
            SparePartUpdateRequest request
    ) {
        SparePart sparePart =
                findSparePartById(sparePartId);

        String partNumber =
                normalizePartNumber(request.partNumber());

        if (
                sparePartRepository
                        .existsByPartNumberIgnoreCaseAndIdNot(
                                partNumber,
                                sparePartId
                        )
        ) {
            throw new BadRequestException(
                    "A spare part with this part number already exists"
            );
        }

        Category category =
                getActiveCategory(request.categoryId());

        validatePrices(
                request.costPrice(),
                request.sellingPrice()
        );

        sparePart.setPartNumber(partNumber);
        sparePart.setName(
                normalizeRequiredText(request.name())
        );
        sparePart.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );
        sparePart.setBrand(
                normalizeRequiredText(request.brand())
        );
        sparePart.setVehicleMake(
                normalizeOptionalText(
                        request.vehicleMake()
                )
        );
        sparePart.setVehicleModel(
                normalizeOptionalText(
                        request.vehicleModel()
                )
        );
        sparePart.setManufactureYear(
                normalizeOptionalText(
                        request.manufactureYear()
                )
        );
        sparePart.setCostPrice(
                normalizeMoney(request.costPrice())
        );
        sparePart.setSellingPrice(
                normalizeMoney(request.sellingPrice())
        );
        sparePart.changeReorderLevel(
                request.reorderLevel()
        );
        sparePart.setImageUrl(
                normalizeOptionalText(
                        request.imageUrl()
                )
        );
        sparePart.setCategory(category);

        SparePart updatedSparePart =
                sparePartRepository.save(sparePart);
        lowStockAlertService.evaluateLowStock(
                updatedSparePart
        );

        return mapToResponse(updatedSparePart);
    }

    public SparePartResponse updateSparePartStatus(
            Long sparePartId,
            SparePartStatusRequest request
    ) {
        SparePart sparePart =
                findSparePartById(sparePartId);

        switch (request.status()) {
            case ACTIVE -> {
                if (!sparePart.getCategory().isActive()) {
                    throw new BadRequestException(
                            "A spare part cannot be activated while its category is inactive"
                    );
                }

                sparePart.activate();
            }

            case INACTIVE ->
                    sparePart.deactivate();

            case DISCONTINUED ->
                    sparePart.discontinue();
        }

        SparePart updatedSparePart =
                sparePartRepository.save(sparePart);

        return mapToResponse(updatedSparePart);
    }

    /*
     * Physical deletion වෙනුවට soft delete භාවිත කරනවා.
     * Order සහ inventory history පසුව ආරක්ෂා කිරීමට
     * record එක DISCONTINUED කරනවා.
     */
    public SparePartResponse discontinueSparePart(
            Long sparePartId
    ) {
        SparePart sparePart =
                findSparePartById(sparePartId);

        sparePart.discontinue();

        SparePart updatedSparePart =
                sparePartRepository.save(sparePart);

        lowStockAlertService.evaluateLowStock(
                updatedSparePart
        );

        return mapToResponse(updatedSparePart);
    }

    private SparePart findSparePartById(
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
                .findDetailedById(sparePartId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Spare part not found with ID: "
                                                + sparePartId
                                )
                );
    }

    private Category getActiveCategory(
            Long categoryId
    ) {
        Category category =
                categoryRepository
                        .findById(categoryId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Category not found with ID: "
                                                        + categoryId
                                        )
                        );

        if (!category.isActive()) {
            throw new BadRequestException(
                    "Cannot assign a spare part to an inactive category"
            );
        }

        return category;
    }

    private void validatePrices(
            BigDecimal costPrice,
            BigDecimal sellingPrice
    ) {
        if (
                costPrice == null ||
                        sellingPrice == null
        ) {
            throw new BadRequestException(
                    "Cost price and selling price are required"
            );
        }

        if (costPrice.signum() < 0) {
            throw new BadRequestException(
                    "Cost price cannot be negative"
            );
        }

        if (sellingPrice.signum() <= 0) {
            throw new BadRequestException(
                    "Selling price must be greater than zero"
            );
        }

        if (
                sellingPrice.compareTo(costPrice) < 0
        ) {
            throw new BadRequestException(
                    "Selling price cannot be lower than cost price"
            );
        }
    }

    private String normalizePartNumber(
            String value
    ) {
        String normalized =
                normalizeRequiredText(value)
                        .toUpperCase(Locale.ROOT);

        return normalized.replaceAll("\\s+", "-");
    }

    private String normalizeRequiredText(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    "Required text value cannot be empty"
            );
        }

        return value.trim()
                .replaceAll("\\s+", " ");
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim()
                .replaceAll("\\s+", " ");
    }

    private BigDecimal normalizeMoney(
            BigDecimal value
    ) {
        return value.setScale(
                2,
                RoundingMode.HALF_UP
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

    private Sort createSort(
            String sortBy,
            String direction
    ) {
        List<String> allowedFields = List.of(
                "id",
                "partNumber",
                "name",
                "brand",
                "costPrice",
                "sellingPrice",
                "stockQuantity",
                "reorderLevel",
                "status",
                "createdAt",
                "updatedAt"
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

    private SparePartResponse mapToResponse(
            SparePart sparePart
    ) {
        return new SparePartResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getDescription(),
                sparePart.getBrand(),
                sparePart.getVehicleMake(),
                sparePart.getVehicleModel(),
                sparePart.getManufactureYear(),
                sparePart.getCostPrice(),
                sparePart.getSellingPrice(),
                sparePart.getStockQuantity(),
                sparePart.getReorderLevel(),
                sparePart.getImageUrl(),
                sparePart.getStatus(),
                sparePart.isAvailable(),
                sparePart.isLowStock(),
                sparePart.getCategory().getId(),
                sparePart.getCategory().getName(),
                sparePart.getVersion(),
                sparePart.getCreatedAt(),
                sparePart.getUpdatedAt()
        );
    }
}
