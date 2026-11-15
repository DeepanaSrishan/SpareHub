package com.sparehub.repository;

import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.inventory.SparePartStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SparePartRepository
        extends JpaRepository<SparePart, Long> {

    boolean existsByPartNumberIgnoreCase(
            String partNumber
    );

    boolean existsByPartNumberIgnoreCaseAndIdNot(
            String partNumber,
            Long id
    );

    Optional<SparePart> findByPartNumberIgnoreCase(
            String partNumber
    );

    boolean existsByCategoryId(
            Long categoryId
    );

    long countByCategoryId(
            Long categoryId
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT sparePart
            FROM SparePart sparePart
            WHERE sparePart.id = :id
            """)
    Optional<SparePart> findWithCategoryById(
            @Param("id") Long id
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT sparePart
            FROM SparePart sparePart
            WHERE sparePart.id = :id
            """)
    Optional<SparePart> findDetailedById(
            @Param("id") Long id
    );

    @EntityGraph(attributePaths = "category")
    Page<SparePart> findByStatus(
            SparePartStatus status,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT sparePart
                    FROM SparePart sparePart
                    JOIN FETCH sparePart.category category
                    WHERE sparePart.status = :status
                      AND (
                            LOWER(sparePart.name)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(sparePart.partNumber)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(sparePart.brand)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(category.name)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                      )
                    """,
            countQuery = """
                    SELECT COUNT(sparePart)
                    FROM SparePart sparePart
                    JOIN sparePart.category category
                    WHERE sparePart.status = :status
                      AND (
                            LOWER(sparePart.name)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(sparePart.partNumber)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(sparePart.brand)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(category.name)
                                LIKE LOWER(CONCAT('%', :keyword, '%'))
                      )
                    """
    )
    Page<SparePart> searchActiveSpareParts(
            @Param("status")
            SparePartStatus status,

            @Param("keyword")
            String keyword,

            Pageable pageable
    );

    @Query(
            value = """
                    SELECT sparePart
                    FROM SparePart sparePart
                    JOIN FETCH sparePart.category category
                    WHERE sparePart.status = :status
                      AND (
                            :categoryId IS NULL
                            OR category.id = :categoryId
                      )
                      AND (
                            :brand IS NULL
                            OR LOWER(sparePart.brand) =
                               LOWER(:brand)
                      )
                      AND (
                            :minimumPrice IS NULL
                            OR sparePart.sellingPrice >=
                               :minimumPrice
                      )
                      AND (
                            :maximumPrice IS NULL
                            OR sparePart.sellingPrice <=
                               :maximumPrice
                      )
                      AND (
                            :availableOnly = false
                            OR sparePart.stockQuantity > 0
                      )
                    """,
            countQuery = """
                    SELECT COUNT(sparePart)
                    FROM SparePart sparePart
                    JOIN sparePart.category category
                    WHERE sparePart.status = :status
                      AND (
                            :categoryId IS NULL
                            OR category.id = :categoryId
                      )
                      AND (
                            :brand IS NULL
                            OR LOWER(sparePart.brand) =
                               LOWER(:brand)
                      )
                      AND (
                            :minimumPrice IS NULL
                            OR sparePart.sellingPrice >=
                               :minimumPrice
                      )
                      AND (
                            :maximumPrice IS NULL
                            OR sparePart.sellingPrice <=
                               :maximumPrice
                      )
                      AND (
                            :availableOnly = false
                            OR sparePart.stockQuantity > 0
                      )
                    """
    )
    Page<SparePart> filterSpareParts(
            @Param("status")
            SparePartStatus status,

            @Param("categoryId")
            Long categoryId,

            @Param("brand")
            String brand,

            @Param("minimumPrice")
            BigDecimal minimumPrice,

            @Param("maximumPrice")
            BigDecimal maximumPrice,

            @Param("availableOnly")
            boolean availableOnly,

            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    @Query(
            value = """
                    SELECT sparePart
                    FROM SparePart sparePart
                    WHERE (
                        :keyword = ''
                        OR LOWER(sparePart.name)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(sparePart.partNumber)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(sparePart.brand)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(sparePart.category.name)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                    )
                    AND (
                        :status IS NULL
                        OR sparePart.status = :status
                    )
                    AND (
                        :categoryId IS NULL
                        OR sparePart.category.id = :categoryId
                    )
                    """,
            countQuery = """
                    SELECT COUNT(sparePart)
                    FROM SparePart sparePart
                    WHERE (
                        :keyword = ''
                        OR LOWER(sparePart.name)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(sparePart.partNumber)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(sparePart.brand)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(sparePart.category.name)
                            LIKE LOWER(CONCAT('%', :keyword, '%'))
                    )
                    AND (
                        :status IS NULL
                        OR sparePart.status = :status
                    )
                    AND (
                        :categoryId IS NULL
                        OR sparePart.category.id = :categoryId
                    )
                    """
    )
    Page<SparePart> searchInventory(
            @Param("keyword")
            String keyword,

            @Param("status")
            SparePartStatus status,

            @Param("categoryId")
            Long categoryId,

            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT sparePart
            FROM SparePart sparePart
            WHERE sparePart.status = 'ACTIVE'
              AND sparePart.stockQuantity
                    <= sparePart.reorderLevel
            ORDER BY sparePart.stockQuantity ASC
            """)
    List<SparePart> findLowStockSpareParts();

    @EntityGraph(attributePaths = "category")
    @Query(
            value = """
                    SELECT sparePart
                    FROM SparePart sparePart
                    WHERE sparePart.status = 'ACTIVE'
                      AND sparePart.category.active = true
                      AND (
                            :search = ''
                            OR LOWER(sparePart.name)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.partNumber)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.brand)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.category.name)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.vehicleMake)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.vehicleModel)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                      )
                      AND (
                            :categoryId IS NULL
                            OR sparePart.category.id =
                                :categoryId
                      )
                      AND (
                            :brand = ''
                            OR LOWER(sparePart.brand) =
                                LOWER(:brand)
                      )
                      AND (
                            :minimumPrice IS NULL
                            OR sparePart.sellingPrice >=
                                :minimumPrice
                      )
                      AND (
                            :maximumPrice IS NULL
                            OR sparePart.sellingPrice <=
                                :maximumPrice
                      )
                      AND (
                            :available IS NULL
                            OR (
                                :available = true
                                AND sparePart.stockQuantity > 0
                            )
                            OR (
                                :available = false
                                AND sparePart.stockQuantity = 0
                            )
                      )
                    """,
            countQuery = """
                    SELECT COUNT(sparePart)
                    FROM SparePart sparePart
                    WHERE sparePart.status = 'ACTIVE'
                      AND sparePart.category.active = true
                      AND (
                            :search = ''
                            OR LOWER(sparePart.name)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.partNumber)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.brand)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.category.name)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.vehicleMake)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                            OR LOWER(sparePart.vehicleModel)
                                LIKE LOWER(
                                    CONCAT('%', :search, '%')
                                )
                      )
                      AND (
                            :categoryId IS NULL
                            OR sparePart.category.id =
                                :categoryId
                      )
                      AND (
                            :brand = ''
                            OR LOWER(sparePart.brand) =
                                LOWER(:brand)
                      )
                      AND (
                            :minimumPrice IS NULL
                            OR sparePart.sellingPrice >=
                                :minimumPrice
                      )
                      AND (
                            :maximumPrice IS NULL
                            OR sparePart.sellingPrice <=
                                :maximumPrice
                      )
                      AND (
                            :available IS NULL
                            OR (
                                :available = true
                                AND sparePart.stockQuantity > 0
                            )
                            OR (
                                :available = false
                                AND sparePart.stockQuantity = 0
                            )
                      )
                    """
    )
    Page<SparePart> searchCatalog(
            @Param("search")
            String search,

            @Param("categoryId")
            Long categoryId,

            @Param("brand")
            String brand,

            @Param("minimumPrice")
            BigDecimal minimumPrice,

            @Param("maximumPrice")
            BigDecimal maximumPrice,

            @Param("available")
            Boolean available,

            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    @Query(
            value = """
                    SELECT sparePart
                    FROM SparePart sparePart
                    WHERE (
                        :search = ''
                        OR LOWER(sparePart.name)
                            LIKE LOWER(
                                CONCAT('%', :search, '%')
                            )
                        OR LOWER(sparePart.partNumber)
                            LIKE LOWER(
                                CONCAT('%', :search, '%')
                            )
                        OR LOWER(sparePart.brand)
                            LIKE LOWER(
                                CONCAT('%', :search, '%')
                            )
                    )
                    AND (
                        :status IS NULL
                        OR sparePart.status = :status
                    )
                    AND (
                        :categoryId IS NULL
                        OR sparePart.category.id =
                            :categoryId
                    )
                    AND (
                        :lowStock IS NULL
                        OR (
                            :lowStock = true
                            AND sparePart.stockQuantity
                                <= sparePart.reorderLevel
                        )
                        OR (
                            :lowStock = false
                            AND sparePart.stockQuantity
                                > sparePart.reorderLevel
                        )
                    )
                    AND (
                        :available IS NULL
                        OR (
                            :available = true
                            AND sparePart.status = 'ACTIVE'
                            AND sparePart.stockQuantity > 0
                        )
                        OR (
                            :available = false
                            AND (
                                sparePart.status <> 'ACTIVE'
                                OR sparePart.stockQuantity = 0
                            )
                        )
                    )
                    """,
            countQuery = """
                    SELECT COUNT(sparePart)
                    FROM SparePart sparePart
                    WHERE (
                        :search = ''
                        OR LOWER(sparePart.name)
                            LIKE LOWER(
                                CONCAT('%', :search, '%')
                            )
                        OR LOWER(sparePart.partNumber)
                            LIKE LOWER(
                                CONCAT('%', :search, '%')
                            )
                        OR LOWER(sparePart.brand)
                            LIKE LOWER(
                                CONCAT('%', :search, '%')
                            )
                    )
                    AND (
                        :status IS NULL
                        OR sparePart.status = :status
                    )
                    AND (
                        :categoryId IS NULL
                        OR sparePart.category.id =
                            :categoryId
                    )
                    AND (
                        :lowStock IS NULL
                        OR (
                            :lowStock = true
                            AND sparePart.stockQuantity
                                <= sparePart.reorderLevel
                        )
                        OR (
                            :lowStock = false
                            AND sparePart.stockQuantity
                                > sparePart.reorderLevel
                        )
                    )
                    AND (
                        :available IS NULL
                        OR (
                            :available = true
                            AND sparePart.status = 'ACTIVE'
                            AND sparePart.stockQuantity > 0
                        )
                        OR (
                            :available = false
                            AND (
                                sparePart.status <> 'ACTIVE'
                                OR sparePart.stockQuantity = 0
                            )
                        )
                    )
                    """
    )
    Page<SparePart> searchInventoryReport(
            @Param("search")
            String search,

            @Param("status")
            SparePartStatus status,

            @Param("categoryId")
            Long categoryId,

            @Param("lowStock")
            Boolean lowStock,

            @Param("available")
            Boolean available,

            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT sparePart
            FROM SparePart sparePart
            WHERE sparePart.id = :id
              AND sparePart.status = 'ACTIVE'
              AND sparePart.category.active = true
            """)
    Optional<SparePart> findActiveCatalogItemById(
            @Param("id") Long id
    );

    @Query("""
            SELECT DISTINCT sparePart.brand
            FROM SparePart sparePart
            WHERE sparePart.status = 'ACTIVE'
              AND sparePart.category.active = true
              AND sparePart.brand IS NOT NULL
              AND sparePart.brand <> ''
            ORDER BY sparePart.brand ASC
            """)
    List<String> findAllActiveBrands();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT sparePart
            FROM SparePart sparePart
            WHERE sparePart.id = :id
            """)
    Optional<SparePart> findByIdForStockUpdate(
            @Param("id") Long id
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
            SELECT sparePart
            FROM SparePart sparePart
            ORDER BY sparePart.id ASC
            """)
    List<SparePart> findAllWithCategory();
}