package com.sparehub.controller;

import com.sparehub.dto.SubCategoryDTO;
import com.sparehub.service.SubCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subcategories")
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    public SubCategoryController(SubCategoryService subCategoryService) {
        this.subCategoryService = subCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<SubCategoryDTO>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryService.getAllSubCategories());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategoryDTO>> getSubCategoriesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(subCategoryService.getSubCategoriesByCategory(categoryId));
    }

    @GetMapping("/category/{categoryId}/active")
    public ResponseEntity<List<SubCategoryDTO>> getActiveSubCategoriesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(subCategoryService.getActiveSubCategoriesByCategory(categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> getSubCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(subCategoryService.getSubCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<SubCategoryDTO> createSubCategory(@Valid @RequestBody SubCategoryDTO subCategoryDTO) {
        return ResponseEntity.ok(subCategoryService.createSubCategory(subCategoryDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(@PathVariable Long id, @Valid @RequestBody SubCategoryDTO subCategoryDTO) {
        return ResponseEntity.ok(subCategoryService.updateSubCategory(id, subCategoryDTO));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<Void> deactivateSubCategory(@PathVariable Long id) {
        subCategoryService.deactivateSubCategory(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<Void> activateSubCategory(@PathVariable Long id) {
        subCategoryService.activateSubCategory(id);
        return ResponseEntity.ok().build();
    }
}
