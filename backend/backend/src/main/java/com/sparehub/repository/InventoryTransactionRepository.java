package com.sparehub.repository;

import com.sparehub.entity.inventory.InventoryTransaction;
import com.sparehub.entity.inventory.InventoryTransactionType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryTransactionRepository
        extends JpaRepository<
        InventoryTransaction,
        Long
        > {

    @EntityGraph(attributePaths = "sparePart")
    Page<InventoryTransaction>
    findBySparePartIdOrderByCreatedAtDesc(
            Long sparePartId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "sparePart")
    @Query(
            value = """
                    SELECT transaction
                    FROM InventoryTransaction transaction
                    WHERE (
                        :sparePartId IS NULL
                        OR transaction.sparePart.id =
                            :sparePartId
                    )
                    AND (
                        :transactionType IS NULL
                        OR transaction.transactionType =
                            :transactionType
                    )
                    AND (
                        :fromDate IS NULL
                        OR transaction.createdAt >=
                            :fromDate
                    )
                    AND (
                        :toDate IS NULL
                        OR transaction.createdAt <=
                            :toDate
                    )
                    """,
            countQuery = """
                    SELECT COUNT(transaction)
                    FROM InventoryTransaction transaction
                    WHERE (
                        :sparePartId IS NULL
                        OR transaction.sparePart.id =
                            :sparePartId
                    )
                    AND (
                        :transactionType IS NULL
                        OR transaction.transactionType =
                            :transactionType
                    )
                    AND (
                        :fromDate IS NULL
                        OR transaction.createdAt >=
                            :fromDate
                    )
                    AND (
                        :toDate IS NULL
                        OR transaction.createdAt <=
                            :toDate
                    )
                    """
    )
    Page<InventoryTransaction>
    searchTransactionHistory(
            @Param("sparePartId")
            Long sparePartId,

            @Param("transactionType")
            InventoryTransactionType transactionType,

            @Param("fromDate")
            LocalDateTime fromDate,

            @Param("toDate")
            LocalDateTime toDate,

            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "sparePart",
                    "sparePart.category"
            }
    )
    @Query("""
            SELECT transaction
            FROM InventoryTransaction transaction
            WHERE transaction.createdAt >= :fromDate
              AND transaction.createdAt <= :toDate
            ORDER BY transaction.createdAt DESC
            """)
    List<InventoryTransaction>
    findAllForMovementReport(
            @Param("fromDate")
            LocalDateTime fromDate,

            @Param("toDate")
            LocalDateTime toDate
    );
}