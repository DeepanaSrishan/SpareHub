package com.sparehub.controller.inventory;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.category.CategoryRequest;
import com.sparehub.dto.inventory.category.CategoryResponse;
import com.sparehub.dto.inventory.category.CategoryStatusRequest;
import com.sparehub.service.inventory.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>>
    createCategory(
            @Valid
            @RequestBody
            CategoryRequest request
    ) {
        CategoryResponse category =
                categoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Category created successfully",
                                category
                        )
                );
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<Page<CategoryResponse>>
            >
    getCategories(
            @RequestParam(
                    defaultValue = ""
            )
            String search,

            @RequestParam(
                    required = false
            )
            Boolean active,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size,

            @RequestParam(
                    defaultValue = "name"
            )
            String sortBy,

            @RequestParam(
                    defaultValue = "asc"
            )
            String direction
    ) {
        Page<CategoryResponse> categories =
                categoryService.getCategories(
                        search,
                        active,
                        page,
                        size,
                        sortBy,
                        direction
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Categories retrieved successfully",
                        categories
                )
        );
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            >
    getCategoryById(
            @PathVariable Long categoryId
    ) {
        CategoryResponse category =
                categoryService.getCategoryById(
                        categoryId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Category retrieved successfully",
                        category
                )
        );
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            >
    updateCategory(
            @PathVariable
            Long categoryId,

            @Valid
            @RequestBody
            CategoryRequest request
    ) {
        CategoryResponse category =
                categoryService.updateCategory(
                        categoryId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Category updated successfully",
                        category
                )
        );
    }

    @PatchMapping("/{categoryId}/status")
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            >
    updateCategoryStatus(
            @PathVariable
            Long categoryId,

            @Valid
            @RequestBody
            CategoryStatusRequest request
    ) {
        CategoryResponse category =
                categoryService.updateCategoryStatus(
                        categoryId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        request.active()
                                ? "Category activated successfully"
                                : "Category deactivated successfully",
                        category
                )
        );
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>>
    deleteCategory(
            @PathVariable Long categoryId
    ) {
        categoryService.deleteCategory(categoryId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Category deleted successfully",
                        null
                )
        );
    }
}