package com.sparehub.service.inventory;



import com.sparehub.dto.catalog.CatalogSparePartResponse;
import com.sparehub.dto.catalog.SparePartAvailabilityResponse;
import com.sparehub.entity.inventory.Category;
import com.sparehub.entity.inventory.SparePart;
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

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {

    private final SparePartRepository
            sparePartRepository;

    private final CategoryRepository
            categoryRepository;

    public Page<CatalogSparePartResponse>
    searchSpareParts(
            String search,
            Long categoryId,
            String brand,
            BigDecimal minimumPrice,
            BigDecimal maximumPrice,
            Boolean available,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        validatePagination(page, size);

        validatePriceRange(
                minimumPrice,
                maximumPrice
        );

        validateCategory(categoryId);

        String normalizedSearch =
                normalizeSearch(search);

        String normalizedBrand =
                normalizeSearch(brand);

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        createSort(
                                sortBy,
                                direction
                        )
                );

        return sparePartRepository
                .searchCatalog(
                        normalizedSearch,
                        categoryId,
                        normalizedBrand,
                        minimumPrice,
                        maximumPrice,
                        available,
                        pageable
                )
                .map(this::mapToCatalogResponse);
    }

    public CatalogSparePartResponse
    getSparePartDetails(
            Long sparePartId
    ) {
        SparePart sparePart =
                findActiveSparePart(sparePartId);

        return mapToCatalogResponse(sparePart);
    }

    public SparePartAvailabilityResponse
    getAvailability(
            Long sparePartId
    ) {
        SparePart sparePart =
                findActiveSparePart(sparePartId);

        boolean available =
                sparePart.isAvailable();

        String message;

        if (available) {
            message =
                    "Product is currently available";
        } else {
            message =
                    "Product is currently out of stock";
        }

        return new SparePartAvailabilityResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                available,
                sparePart.getStockQuantity(),
                message
        );
    }

    public List<String> getActiveBrands() {
        return sparePartRepository
                .findAllActiveBrands();
    }

    private SparePart findActiveSparePart(
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
                .findActiveCatalogItemById(
                        sparePartId
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Active spare part not found with ID: "
                                                + sparePartId
                                )
                );
    }

    private void validateCategory(
            Long categoryId
    ) {
        if (categoryId == null) {
            return;
        }

        if (categoryId <= 0) {
            throw new BadRequestException(
                    "Invalid category ID"
            );
        }

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
                    "The selected category is inactive"
            );
        }
    }

    private void validatePriceRange(
            BigDecimal minimumPrice,
            BigDecimal maximumPrice
    ) {
        if (
                minimumPrice != null &&
                        minimumPrice.signum() < 0
        ) {
            throw new BadRequestException(
                    "Minimum price cannot be negative"
            );
        }

        if (
                maximumPrice != null &&
                        maximumPrice.signum() < 0
        ) {
            throw new BadRequestException(
                    "Maximum price cannot be negative"
            );
        }

        if (
                minimumPrice != null &&
                        maximumPrice != null &&
                        minimumPrice.compareTo(
                                maximumPrice
                        ) > 0
        ) {
            throw new BadRequestException(
                    "Minimum price cannot be greater than maximum price"
            );
        }
    }

    private String normalizeSearch(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim()
                .replaceAll("\\s+", " ");
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
        List<String> allowedSortFields =
                List.of(
                        "name",
                        "partNumber",
                        "brand",
                        "sellingPrice",
                        "stockQuantity",
                        "createdAt"
                );

        String selectedSortField =
                allowedSortFields.contains(sortBy)
                        ? sortBy
                        : "name";

        Sort.Direction selectedDirection =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        return Sort.by(
                selectedDirection,
                selectedSortField
        );
    }

    private CatalogSparePartResponse
    mapToCatalogResponse(
            SparePart sparePart
    ) {
        boolean available =
                sparePart.isAvailable();

        String availabilityMessage =
                available
                        ? "In Stock"
                        : "Out of Stock";

        return new CatalogSparePartResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getDescription(),
                sparePart.getBrand(),
                sparePart.getVehicleMake(),
                sparePart.getVehicleModel(),
                sparePart.getManufactureYear(),
                sparePart.getSellingPrice(),
                sparePart.getStockQuantity(),
                sparePart.getImageUrl(),
                available,
                availabilityMessage,
                sparePart.getCategory().getId(),
                sparePart.getCategory().getName()
        );
    }
}