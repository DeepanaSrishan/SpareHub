package com.sparehub.controller.inventory;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.category.CategoryResponse;
import com.sparehub.service.inventory.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/categories")
@RequiredArgsConstructor
public class CatalogCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<CategoryResponse>>
            >
    getActiveCategories() {
        List<CategoryResponse> categories =
                categoryService.getActiveCategories();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active categories retrieved successfully",
                        categories
                )
        );
    }
}
