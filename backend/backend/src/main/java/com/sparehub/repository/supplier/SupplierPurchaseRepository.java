package com.sparehub.repository.supplier;



import com.sparehub.entity.supplier.SupplierPurchase;
import com.sparehub.entity.supplier.PurchaseStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SupplierPurchaseRepository
        extends JpaRepository<SupplierPurchase, Long> {

    boolean existsByPurchaseNumber(
            String purchaseNumber
    );


    @EntityGraph(attributePaths = {
            "supplier",
            "supplierProduct",
            "sparePart",
            "createdBy",
            "receivedBy"
    })
    @Query("""
            SELECT p
            FROM SupplierPurchase p
            WHERE p.id = :purchaseId
            """)
    Optional<SupplierPurchase> findDetailedById(
            @Param("purchaseId") Long purchaseId
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "supplierProduct",
            "sparePart",
            "createdBy",
            "receivedBy"
    })
    List<SupplierPurchase>
    findAllByOrderByOrderedAtDesc();

    @EntityGraph(attributePaths = {
            "supplier",
            "supplierProduct",
            "sparePart",
            "createdBy",
            "receivedBy"
    })
    List<SupplierPurchase>
    findAllBySupplierIdOrderByOrderedAtDesc(Long supplierId);

    @EntityGraph(attributePaths = {
            "supplier",
            "supplierProduct",
            "sparePart",
            "createdBy",
            "receivedBy"
    })
    List<SupplierPurchase>
    findAllByStatusOrderByOrderedAtDesc(
            PurchaseStatus status
    );


    List<SupplierPurchase>
    findAllBySupplierIdAndOrderedAtBetweenOrderByOrderedAtDesc(
            Long supplierId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<SupplierPurchase>
    findAllByOrderedAtBetweenOrderByOrderedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<SupplierPurchase>
    findAllBySparePartIdAndStatus(
            Long sparePartId,
            PurchaseStatus status
    );
}