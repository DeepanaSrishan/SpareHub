package com.sparehub.service;

import com.sparehub.dto.SparePartDTO;
import com.sparehub.entity.Category;
import com.sparehub.entity.SparePart;
import com.sparehub.entity.SubCategory;
import com.sparehub.exception.DuplicateResourceException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.CategoryRepository;
import com.sparehub.repository.SparePartRepository;
import com.sparehub.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public SparePartService(SparePartRepository sparePartRepository, CategoryRepository categoryRepository,
                           SubCategoryRepository subCategoryRepository) {
        this.sparePartRepository = sparePartRepository;
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
    }

    public List<SparePartDTO> getAllSpareParts() {
        return sparePartRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SparePartDTO> getActiveSpareParts() {
        return sparePartRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SparePartDTO getSparePartById(Long id) {
        SparePart sparePart = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", id));
        return convertToDTO(sparePart);
    }

    @Transactional
    public SparePartDTO createSparePart(SparePartDTO sparePartDTO) {
        if (sparePartRepository.existsByPartNumber(sparePartDTO.getPartNumber())) {
            throw new DuplicateResourceException("SparePart", "partNumber", sparePartDTO.getPartNumber());
        }

        Category category = categoryRepository.findById(sparePartDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", sparePartDTO.getCategoryId()));

        SparePart sparePart = new SparePart();
        sparePart.setPartNumber(sparePartDTO.getPartNumber());
        sparePart.setName(sparePartDTO.getName());
        sparePart.setDescription(sparePartDTO.getDescription());
        sparePart.setBrand(sparePartDTO.getBrand());
        sparePart.setCategory(category);
        sparePart.setPrice(sparePartDTO.getPrice());
        sparePart.setStockQuantity(sparePartDTO.getStockQuantity());
        sparePart.setReorderLevel(sparePartDTO.getReorderLevel());
        sparePart.setImageUrl(sparePartDTO.getImageUrl());
        sparePart.setActive(sparePartDTO.getActive() != null ? sparePartDTO.getActive() : true);

        if (sparePartDTO.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(sparePartDTO.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", sparePartDTO.getSubCategoryId()));
            sparePart.setSubCategory(subCategory);
        }

        sparePart = sparePartRepository.save(sparePart);
        return convertToDTO(sparePart);
    }

    @Transactional
    public SparePartDTO updateSparePart(Long id, SparePartDTO sparePartDTO) {
        SparePart existingSparePart = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", id));

        if (!existingSparePart.getPartNumber().equals(sparePartDTO.getPartNumber()) &&
            sparePartRepository.existsByPartNumber(sparePartDTO.getPartNumber())) {
            throw new DuplicateResourceException("SparePart", "partNumber", sparePartDTO.getPartNumber());
        }

        Category category = categoryRepository.findById(sparePartDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", sparePartDTO.getCategoryId()));

        existingSparePart.setPartNumber(sparePartDTO.getPartNumber());
        existingSparePart.setName(sparePartDTO.getName());
        existingSparePart.setDescription(sparePartDTO.getDescription());
        existingSparePart.setBrand(sparePartDTO.getBrand());
        existingSparePart.setCategory(category);
        existingSparePart.setPrice(sparePartDTO.getPrice());
        existingSparePart.setReorderLevel(sparePartDTO.getReorderLevel());
        existingSparePart.setImageUrl(sparePartDTO.getImageUrl());
        existingSparePart.setActive(sparePartDTO.getActive() != null ? sparePartDTO.getActive() : existingSparePart.getActive());

        if (sparePartDTO.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(sparePartDTO.getSubCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SubCategory", sparePartDTO.getSubCategoryId()));
            existingSparePart.setSubCategory(subCategory);
        } else {
            existingSparePart.setSubCategory(null);
        }

        existingSparePart = sparePartRepository.save(existingSparePart);
        return convertToDTO(existingSparePart);
    }

    @Transactional
    public void deactivateSparePart(Long id) {
        SparePart sparePart = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", id));
        sparePart.setActive(false);
        sparePartRepository.save(sparePart);
    }

    @Transactional
    public void activateSparePart(Long id) {
        SparePart sparePart = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", id));
        sparePart.setActive(true);
        sparePartRepository.save(sparePart);
    }

    public List<SparePartDTO> searchSpareParts(String keyword) {
        return sparePartRepository.searchSpareParts(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SparePartDTO> filterSpareParts(Long categoryId, Long subCategoryId, String brand,
                                               Double minPrice, Double maxPrice, String availability, Boolean active) {
        return sparePartRepository.filterSpareParts(categoryId, subCategoryId, brand, minPrice, maxPrice, availability, active)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private SparePartDTO convertToDTO(SparePart sparePart) {
        SparePartDTO dto = new SparePartDTO();
        dto.setId(sparePart.getId());
        dto.setPartNumber(sparePart.getPartNumber());
        dto.setName(sparePart.getName());
        dto.setDescription(sparePart.getDescription());
        dto.setBrand(sparePart.getBrand());
        dto.setCategoryId(sparePart.getCategory().getId());
        dto.setCategoryName(sparePart.getCategory().getName());
        dto.setPrice(sparePart.getPrice());
        dto.setStockQuantity(sparePart.getStockQuantity());
        dto.setReorderLevel(sparePart.getReorderLevel());
        dto.setImageUrl(sparePart.getImageUrl());
        dto.setActive(sparePart.getActive());
        dto.setAvailabilityStatus(sparePart.getAvailabilityStatus());

        if (sparePart.getSubCategory() != null) {
            dto.setSubCategoryId(sparePart.getSubCategory().getId());
            dto.setSubCategoryName(sparePart.getSubCategory().getName());
        }

        return dto;
    }
}
