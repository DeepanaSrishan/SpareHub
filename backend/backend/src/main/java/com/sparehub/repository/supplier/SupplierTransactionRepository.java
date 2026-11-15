package com.sparehub.repository.supplier;



import com.sparehub.entity.supplier.SupplierTransaction;
import com.sparehub.entity.supplier.SupplierTransactionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SupplierTransactionRepository
        extends JpaRepository<SupplierTransaction, Long> {

    @EntityGraph(attributePaths = {
            "supplier",
            "purchase",
            "recordedBy"
    })
    List<SupplierTransaction>
    findAllBySupplierIdOrderByCreatedAtDesc(
            Long supplierId
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "purchase",
            "recordedBy"
    })
    List<SupplierTransaction>
    findAllBySupplierIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long supplierId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @EntityGraph(attributePaths = {
            "supplier",
            "purchase",
            "recordedBy"
    })
    List<SupplierTransaction>
    findAllBySupplierIdAndTransactionTypeOrderByCreatedAtDesc(
            Long supplierId,
            SupplierTransactionType transactionType
    );
}
