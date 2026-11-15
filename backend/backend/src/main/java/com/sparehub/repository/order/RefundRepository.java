package com.sparehub.repository.order;



import com.sparehub.entity.order.Payment;
import com.sparehub.entity.order.Refund;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;




public interface RefundRepository
        extends JpaRepository<Refund, Long> {

    @EntityGraph(attributePaths = {
            "order",
            "processedBy"
    })
    Optional<Refund> findByOrderId(Long orderId);

    @EntityGraph(attributePaths = {
            "order",
            "processedBy"
    })
    Optional<Refund> findByRefundReference(
            String refundReference
    );

    @EntityGraph(attributePaths = {
            "order",
            "processedBy"
    })
    List<Refund>
    findAllByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    boolean existsByOrderId(Long orderId);

    boolean existsByRefundReference(
            String refundReference
    );
}
