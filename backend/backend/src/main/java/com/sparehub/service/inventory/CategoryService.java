package com.sparehub.service.inventory;





import com.sparehub.dto.inventory.category.CategoryRequest;
import com.sparehub.dto.inventory.category.CategoryResponse;
import com.sparehub.dto.inventory.category.CategoryStatusRequest;
import com.sparehub.entity.inventory.Category;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SparePartRepository sparePartRepository;

    public CategoryResponse createCategory(
            CategoryRequest request
    ) {
        String categoryName =
                normalizeRequiredText(request.name());

        if (
                categoryRepository
                        .existsByNameIgnoreCase(categoryName)
        ) {
            throw new BadRequestException(
                    "A category with this name already exists"
            );
        }

        Category category = new Category();

        category.setName(categoryName);
        category.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );
        category.setActive(true);

        Category savedCategory =
                categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(
            String search,
            Boolean active,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        validatePagination(page, size);

        Sort sort = createSort(sortBy, direction);

        Pageable pageable =
                PageRequest.of(page, size, sort);

        String normalizedSearch =
                search == null ? "" : search.trim();

        Page<Category> categories;

        if (
                !normalizedSearch.isBlank() &&
                        active != null
        ) {
            categories =
                    categoryRepository
                            .findByNameContainingIgnoreCaseAndActive(
                                    normalizedSearch,
                                    active,
                                    pageable
                            );
        } else if (!normalizedSearch.isBlank()) {
            categories =
                    categoryRepository
                            .findByNameContainingIgnoreCase(
                                    normalizedSearch,
                                    pageable
                            );
        } else if (active != null) {
            categories =
                    categoryRepository.findByActive(
                            active,
                            pageable
                    );
        } else {
            categories =
                    categoryRepository.findAll(pageable);
        }

        return categories.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(
            Long categoryId
    ) {
        return mapToResponse(
                findCategoryById(categoryId)
        );
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse>
    getActiveCategories() {
        return categoryRepository
                .findAllByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CategoryResponse updateCategory(
            Long categoryId,
            CategoryRequest request
    ) {
        Category category =
                findCategoryById(categoryId);

        String categoryName =
                normalizeRequiredText(request.name());

        if (
                categoryRepository
                        .existsByNameIgnoreCaseAndIdNot(
                                categoryName,
                                categoryId
                        )
        ) {
            throw new BadRequestException(
                    "A category with this name already exists"
            );
        }

        category.setName(categoryName);

        category.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );

        Category updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }

    public CategoryResponse updateCategoryStatus(
            Long categoryId,
            CategoryStatusRequest request
    ) {
        Category category =
                findCategoryById(categoryId);

        if (request.active()) {
            category.activate();
        } else {
            category.deactivate();
        }

        Category updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }

    public void deleteCategory(Long categoryId) {
        Category category =
                findCategoryById(categoryId);

        boolean hasSpareParts =
                sparePartRepository.existsByCategoryId(
                        categoryId
                );

        if (hasSpareParts) {
            throw new BadRequestException(
                    "This category cannot be deleted because spare parts are assigned to it. Deactivate the category instead."
            );
        }

        categoryRepository.delete(category);
    }

    private Category findCategoryById(
            Long categoryId
    ) {
        if (categoryId == null || categoryId <= 0) {
            throw new BadRequestException(
                    "Invalid category ID"
            );
        }

        return categoryRepository
                .findById(categoryId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Category not found with ID: "
                                        + categoryId
                        )
                );
    }

    private CategoryResponse mapToResponse(
            Category category
    ) {
        long sparePartCount =
                sparePartRepository.countByCategoryId(
                        category.getId()
                );

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                sparePartCount,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    private String normalizeRequiredText(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    "Category name is required"
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
        List<String> allowedSortFields = List.of(
                "id",
                "name",
                "active",
                "createdAt",
                "updatedAt"
        );

        String selectedSortField =
                allowedSortFields.contains(sortBy)
                        ? sortBy
                        : "name";

        Sort.Direction sortDirection =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        return Sort.by(
                sortDirection,
                selectedSortField
        );
    }
}
