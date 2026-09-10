package com.sparehub.controller;

import com.sparehub.dto.CategoryDTO;
import com.sparehub.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CategoryDTO>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDTO));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<Void> deactivateCategory(@PathVariable Long id) {
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<Void> activateCategory(@PathVariable Long id) {
        categoryService.activateCategory(id);
        return ResponseEntity.ok().build();
    }
}
