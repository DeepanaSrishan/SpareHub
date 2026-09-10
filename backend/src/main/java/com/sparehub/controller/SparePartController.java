package com.sparehub.controller;

import com.sparehub.dto.SparePartDTO;
import com.sparehub.service.SparePartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/spare-parts")
public class SparePartController {

    private final SparePartService sparePartService;

    public SparePartController(SparePartService sparePartService) {
        this.sparePartService = sparePartService;
    }

    @GetMapping
    public ResponseEntity<List<SparePartDTO>> getAllSpareParts() {
        return ResponseEntity.ok(sparePartService.getAllSpareParts());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SparePartDTO>> getActiveSpareParts() {
        return ResponseEntity.ok(sparePartService.getActiveSpareParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SparePartDTO> getSparePartById(@PathVariable Long id) {
        return ResponseEntity.ok(sparePartService.getSparePartById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<SparePartDTO> createSparePart(@Valid @RequestBody SparePartDTO sparePartDTO) {
        return ResponseEntity.ok(sparePartService.createSparePart(sparePartDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<SparePartDTO> updateSparePart(@PathVariable Long id, @Valid @RequestBody SparePartDTO sparePartDTO) {
        return ResponseEntity.ok(sparePartService.updateSparePart(id, sparePartDTO));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<Void> deactivateSparePart(@PathVariable Long id) {
        sparePartService.deactivateSparePart(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('INVENTORY_STAFF', 'MANAGER')")
    public ResponseEntity<Void> activateSparePart(@PathVariable Long id) {
        sparePartService.activateSparePart(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<SparePartDTO>> searchSpareParts(@RequestParam String keyword) {
        return ResponseEntity.ok(sparePartService.searchSpareParts(keyword));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<SparePartDTO>> filterSpareParts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subCategoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(sparePartService.filterSpareParts(categoryId, subCategoryId, brand, 
                minPrice, maxPrice, availability, active));
    }
}
