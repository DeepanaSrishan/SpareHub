package com.sparehub.repository;



import com.sparehub.entity.inventory.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    Optional<Category> findByNameIgnoreCase(
            String name
    );

    boolean existsByNameIgnoreCase(
            String name
    );

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            Long id
    );

    List<Category> findAllByActiveTrueOrderByNameAsc();

    Page<Category> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );

    Page<Category> findByActive(
            boolean active,
            Pageable pageable
    );

    Page<Category>
    findByNameContainingIgnoreCaseAndActive(
            String name,
            boolean active,
            Pageable pageable
    );
}