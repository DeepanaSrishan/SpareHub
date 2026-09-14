package com.sparehub.repository.supplier;


import com.sparehub.entity.supplier.SupplierProduct;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupplierProductRepository
        extends JpaRepository<SupplierProduct, Long> {

    boolean existsBySupplierIdAndSparePartId(
            Long supplierId,
            Long sparePartId
    );
    long countBySupplierId(Long supplierId);

    long countBySupplierIdAndPreferredTrue(Long supplierId);

    Optional<SupplierProduct>
    findBySupplierIdAndSparePartId(
            Long supplierId,
            Long sparePartId
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "sparePart"
    })
    @Query("""
            SELECT sp
            FROM SupplierProduct sp
            WHERE sp.id = :supplierProductId
            """)
    Optional<SupplierProduct> findDetailedById(
            @Param("supplierProductId")
            Long supplierProductId
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "sparePart"
    })
    @Query("""
            SELECT sp
            FROM SupplierProduct sp
            WHERE sp.supplier.id = :supplierId
            ORDER BY sp.sparePart.name ASC
            """)
    List<SupplierProduct> findProductsBySupplierId(
            @Param("supplierId") Long supplierId
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "sparePart"
    })
    @Query("""
            SELECT sp
            FROM SupplierProduct sp
            WHERE sp.supplier.id = :supplierId
              AND sp.active = true
            ORDER BY sp.sparePart.name ASC
            """)
    List<SupplierProduct>
    findActiveProductsBySupplierId(
            @Param("supplierId") Long supplierId
    );

    /*
     * Product එක supply කරන active suppliers,
     * lowest price එක මුලින්.
     */
    @EntityGraph(attributePaths = {
            "supplier",
            "sparePart"
    })
    @Query("""
            SELECT sp
            FROM SupplierProduct sp
            WHERE sp.sparePart.id = :sparePartId
              AND sp.active = true
              AND sp.supplier.active = true
            ORDER BY sp.purchasePrice ASC
            """)
    List<SupplierProduct>
    findActiveSuppliersBySparePartId(
            @Param("sparePartId") Long sparePartId
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "sparePart"
    })
    @Query("""
            SELECT sp
            FROM SupplierProduct sp
            WHERE sp.sparePart.id = :sparePartId
              AND sp.preferred = true
              AND sp.active = true
              AND sp.supplier.active = true
            """)
    Optional<SupplierProduct>
    findPreferredSupplierBySparePartId(
            @Param("sparePartId") Long sparePartId
    );

    @Query("""
            SELECT sp
            FROM SupplierProduct sp
            WHERE sp.sparePart.id = :sparePartId
              AND sp.preferred = true
              AND sp.id <> :excludedId
            """)
    List<SupplierProduct>
    findOtherPreferredSuppliers(
            @Param("sparePartId") Long sparePartId,
            @Param("excludedId") Long excludedId
    );
}