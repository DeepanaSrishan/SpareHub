package com.sparehub.repository;

import com.sparehub.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    
    List<InventoryTransaction> findBySparePartIdOrderByCreatedAtDesc(Long sparePartId);
    List<InventoryTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<InventoryTransaction> findByTransactionTypeOrderByCreatedAtDesc(String transactionType);
    
    @Query("SELECT it FROM InventoryTransaction it WHERE " +
           "(:sparePartId IS NULL OR it.sparePart.id = :sparePartId) AND " +
           "(:transactionType IS NULL OR it.transactionType = :transactionType) AND " +
           "(:startDate IS NULL OR it.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR it.createdAt <= :endDate)")
    List<InventoryTransaction> filterTransactions(@Param("sparePartId") Long sparePartId,
                                                     @Param("transactionType") String transactionType,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(it) FROM InventoryTransaction it WHERE it.createdAt >= :startDate")
    Long countTransactionsSince(@Param("startDate") LocalDateTime startDate);
}
