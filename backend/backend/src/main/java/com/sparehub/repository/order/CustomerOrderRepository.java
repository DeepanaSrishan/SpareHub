package com.sparehub.repository.order;

import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.enums.order.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository
        extends JpaRepository<CustomerOrder, Long> {

    boolean existsByOrderNumber(
            String orderNumber
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    Optional<CustomerOrder> findByOrderNumber(
            String orderNumber
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    Optional<CustomerOrder> findByIdAndCustomerId(
            Long orderId,
            Long customerId
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    Optional<CustomerOrder> findByOrderNumberAndCustomerId(
            String orderNumber,
            Long customerId
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    List<CustomerOrder>
    findAllByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    List<CustomerOrder>
    findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    List<CustomerOrder>
    findAllByOrderStatusOrderByCreatedAtDesc(
            OrderStatus orderStatus
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    Optional<CustomerOrder> findDetailedById(
            Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    @Query("""
            SELECT co
            FROM CustomerOrder co
            WHERE co.id = :id
            """)
    Optional<CustomerOrder> findDetailedByIdForUpdate(
            @Param("id") Long id
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    List<CustomerOrder>
    findAllByCustomerEmailOrderByCreatedAtDesc(
            String email
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    List<CustomerOrder>
    findAllByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}