package com.sparehub.service;

import com.sparehub.dto.CategoryDTO;
import com.sparehub.entity.Category;
import com.sparehub.exception.DuplicateResourceException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return convertToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.findByName(categoryDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Category", "name", categoryDTO.getName());
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setActive(categoryDTO.getActive() != null ? categoryDTO.getActive() : true);

        category = categoryRepository.save(category);
        return convertToDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (!existingCategory.getName().equals(categoryDTO.getName()) &&
            categoryRepository.findByName(categoryDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Category", "name", categoryDTO.getName());
        }

        existingCategory.setName(categoryDTO.getName());
        existingCategory.setDescription(categoryDTO.getDescription());
        existingCategory.setActive(categoryDTO.getActive() != null ? categoryDTO.getActive() : existingCategory.getActive());

        existingCategory = categoryRepository.save(existingCategory);
        return convertToDTO(existingCategory);
    }

    @Transactional
    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    public void activateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(true);
        categoryRepository.save(category);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setActive(category.getActive());
        return dto;
    }
}
