package com.sparehub.service;

import com.sparehub.dto.SubCategoryDTO;
import com.sparehub.entity.Category;
import com.sparehub.entity.SubCategory;
import com.sparehub.exception.DuplicateResourceException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.CategoryRepository;
import com.sparehub.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubCategoryService(SubCategoryRepository subCategoryRepository, CategoryRepository categoryRepository) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<SubCategoryDTO> getAllSubCategories() {
        return subCategoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubCategoryDTO> getSubCategoriesByCategory(Long categoryId) {
        return subCategoryRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubCategoryDTO> getActiveSubCategoriesByCategory(Long categoryId) {
        return subCategoryRepository.findByCategoryIdAndActiveTrue(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SubCategoryDTO getSubCategoryById(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", id));
        return convertToDTO(subCategory);
    }

    @Transactional
    public SubCategoryDTO createSubCategory(SubCategoryDTO subCategoryDTO) {
        Category category = categoryRepository.findById(subCategoryDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", subCategoryDTO.getCategoryId()));

        if (subCategoryRepository.findByNameAndCategoryId(subCategoryDTO.getName(), subCategoryDTO.getCategoryId()).isPresent()) {
            throw new DuplicateResourceException("SubCategory", "name", subCategoryDTO.getName());
        }

        SubCategory subCategory = new SubCategory();
        subCategory.setCategory(category);
        subCategory.setName(subCategoryDTO.getName());
        subCategory.setDescription(subCategoryDTO.getDescription());
        subCategory.setActive(subCategoryDTO.getActive() != null ? subCategoryDTO.getActive() : true);

        subCategory = subCategoryRepository.save(subCategory);
        return convertToDTO(subCategory);
    }

    @Transactional
    public SubCategoryDTO updateSubCategory(Long id, SubCategoryDTO subCategoryDTO) {
        SubCategory existingSubCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", id));

        Category category = categoryRepository.findById(subCategoryDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", subCategoryDTO.getCategoryId()));

        if (!existingSubCategory.getName().equals(subCategoryDTO.getName()) &&
            subCategoryRepository.findByNameAndCategoryId(subCategoryDTO.getName(), subCategoryDTO.getCategoryId()).isPresent()) {
            throw new DuplicateResourceException("SubCategory", "name", subCategoryDTO.getName());
        }

        existingSubCategory.setCategory(category);
        existingSubCategory.setName(subCategoryDTO.getName());
        existingSubCategory.setDescription(subCategoryDTO.getDescription());
        existingSubCategory.setActive(subCategoryDTO.getActive() != null ? subCategoryDTO.getActive() : existingSubCategory.getActive());

        existingSubCategory = subCategoryRepository.save(existingSubCategory);
        return convertToDTO(existingSubCategory);
    }

    @Transactional
    public void deactivateSubCategory(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", id));
        subCategory.setActive(false);
        subCategoryRepository.save(subCategory);
    }

    @Transactional
    public void activateSubCategory(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubCategory", id));
        subCategory.setActive(true);
        subCategoryRepository.save(subCategory);
    }

    private SubCategoryDTO convertToDTO(SubCategory subCategory) {
        SubCategoryDTO dto = new SubCategoryDTO();
        dto.setId(subCategory.getId());
        dto.setCategoryId(subCategory.getCategory().getId());
        dto.setCategoryName(subCategory.getCategory().getName());
        dto.setName(subCategory.getName());
        dto.setDescription(subCategory.getDescription());
        dto.setActive(subCategory.getActive());
        return dto;
    }
}
