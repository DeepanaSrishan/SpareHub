package com.sparehub.repository.order;

import com.sparehub.entity.order.Payment;
import com.sparehub.enums.order.PaymentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    @EntityGraph(attributePaths = {
            "order",
            "recordedBy"
    })
    Optional<Payment> findByPaymentReference(
            String paymentReference
    );

    @EntityGraph(attributePaths = {
            "order",
            "recordedBy"
    })
    List<Payment>
    findAllByPaidAtBetweenOrderByPaidAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @EntityGraph(attributePaths = {
            "order",
            "recordedBy"
    })
    List<Payment>
    findAllByOrderIdOrderByCreatedAtDesc(
            Long orderId
    );

    @EntityGraph(attributePaths = {
            "order",
            "recordedBy"
    })
    List<Payment>
    findAllByStatusOrderByCreatedAtDesc(
            PaymentStatus status
    );

    @EntityGraph(attributePaths = {
            "order",
            "recordedBy"
    })
    List<Payment>
    findAllByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    boolean existsByPaymentReference(
            String paymentReference
    );

    @Query("""
            SELECT COALESCE(SUM(payment.amount), 0)
            FROM Payment payment
            WHERE payment.order.id = :orderId
              AND payment.status =
                  com.sparehub.enums.order.PaymentStatus.PAID
            """)
    BigDecimal calculatePaidAmountByOrderId(
            @Param("orderId") Long orderId
    );
}