package com.sparehub.backend.repository;

import com.sparehub.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Integer customerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.customer.id = :customerId")
    BigDecimal sumTotalSpendByCustomerId(@Param("customerId") Integer customerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.id = :customerId")
    Long countOrdersByCustomerId(@Param("customerId") Integer customerId);
}
