package com.sparehub.repository;

import com.sparehub.entity.SparePart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, Long> {
    Optional<SparePart> findByPartNumber(String partNumber);
    Boolean existsByPartNumber(String partNumber);
    
    List<SparePart> findByActiveTrueOrderByCreatedAtDesc();
    List<SparePart> findByActiveFalseOrderByCreatedAtDesc();
    List<SparePart> findByCategoryId(Long categoryId);
    List<SparePart> findBySubCategoryId(Long subCategoryId);
    List<SparePart> findByBrand(String brand);
    
    @Query("SELECT sp FROM SparePart sp WHERE sp.active = true AND " +
           "(LOWER(sp.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<SparePart> searchSpareParts(@Param("keyword") String keyword);
    
    @Query("SELECT sp FROM SparePart sp WHERE sp.active = true AND " +
           "sp.stockQuantity <= sp.reorderLevel AND sp.stockQuantity > 0")
    List<SparePart> findLowStockItems();
    
    @Query("SELECT sp FROM SparePart sp WHERE sp.active = true AND sp.stockQuantity = 0")
    List<SparePart> findOutOfStockItems();
    
    @Query("SELECT sp FROM SparePart sp WHERE (:categoryId IS NULL OR sp.category.id = :categoryId) AND " +
           "(:subCategoryId IS NULL OR sp.subCategory.id = :subCategoryId) AND " +
           "(:brand IS NULL OR sp.brand = :brand) AND " +
           "(:minPrice IS NULL OR sp.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR sp.price <= :maxPrice) AND " +
           "(:availability IS NULL OR " +
           "CASE WHEN :availability = 'IN_STOCK' THEN sp.stockQuantity > sp.reorderLevel " +
           "WHEN :availability = 'LOW_STOCK' THEN sp.stockQuantity <= sp.reorderLevel AND sp.stockQuantity > 0 " +
           "WHEN :availability = 'OUT_OF_STOCK' THEN sp.stockQuantity = 0 " +
           "WHEN :availability = 'INACTIVE' THEN sp.active = false " +
           "ELSE true END) AND " +
           "(:active IS NULL OR sp.active = :active)")
    List<SparePart> filterSpareParts(@Param("categoryId") Long categoryId,
                                      @Param("subCategoryId") Long subCategoryId,
                                      @Param("brand") String brand,
                                      @Param("minPrice") Double minPrice,
                                      @Param("maxPrice") Double maxPrice,
                                      @Param("availability") String availability,
                                      @Param("active") Boolean active);
}
