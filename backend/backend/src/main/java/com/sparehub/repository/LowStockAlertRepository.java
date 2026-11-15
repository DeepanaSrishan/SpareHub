package com.sparehub.repository;



import com.sparehub.entity.inventory.InventoryAlertStatus;
import com.sparehub.entity.inventory.LowStockAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LowStockAlertRepository
        extends JpaRepository<LowStockAlert, Long> {

    @EntityGraph(attributePaths = "sparePart")
    Optional<LowStockAlert>
    findFirstBySparePartIdAndStatusInOrderByCreatedAtDesc(
            Long sparePartId,
            Collection<InventoryAlertStatus> statuses
    );

    @EntityGraph(attributePaths = "sparePart")
    Page<LowStockAlert>
    findByStatusOrderByCreatedAtDesc(
            InventoryAlertStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "sparePart")
    Page<LowStockAlert>
    findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    List<LowStockAlert>
    findAllBySparePartIdAndStatusIn(
            Long sparePartId,
            Collection<InventoryAlertStatus> statuses
    );

    long countByStatus(
            InventoryAlertStatus status
    );
}