package com.sparehub.repository;

import com.sparehub.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    List<SubCategory> findByCategoryId(Long categoryId);
    List<SubCategory> findByCategoryIdAndActiveTrue(Long categoryId);
    List<SubCategory> findByActiveTrueOrderByCreatedAtDesc();
    Optional<SubCategory> findByNameAndCategoryId(String name, Long categoryId);
}
