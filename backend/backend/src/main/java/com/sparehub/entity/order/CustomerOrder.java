package com.sparehub.entity.order;



import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentStatus;
import com.sparehub.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "customer_orders",
        indexes = {
                @Index(name = "idx_order_number", columnList = "order_number"),
                @Index(name = "idx_order_customer", columnList = "customer_id"),
                @Index(name = "idx_order_status", columnList = "order_status"),
                @Index(name = "idx_order_created_at", columnList = "created_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_order_number",
                        columnNames = "order_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "order_number",
            nullable = false,
            unique = true,
            length = 40
    )
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_order_customer")
    )
    private User customer;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 30)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_before_cancellation", length = 30)
    private OrderStatus statusBeforeCancellation;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(
            name = "tax_rate",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 500)
    private String customerNote;

    @Column(length = 500)
    private String staffNote;

    @Column(length = 500)
    private String cancellationReason;

    @Column(length = 500)
    private String rejectionReason;

    @Column(name = "stock_deducted", nullable = false)
    private Boolean stockDeducted = false;

    @Column(name = "stock_deducted_at")
    private LocalDateTime stockDeductedAt;

    @Column(name = "cancellation_decision_note", length = 500)
    private String cancellationDecisionNote;

    @Column(name = "cancellation_processed_at")
    private LocalDateTime cancellationProcessedAt;

    @Column(name = "stock_reversed", nullable = false)
    private Boolean stockReversed = false;

    @Column(name = "stock_reversed_at")
    private LocalDateTime stockReversedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "completed_by",
            foreignKey = @ForeignKey(
                    name = "fk_order_completed_by"
            )
    )
    private User completedBy;

    @Column(
            name = "discount_percentage",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal discountPercentage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "confirmed_by",
            foreignKey = @ForeignKey(name = "fk_order_confirmed_by")
    )
    private User confirmedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "cancelled_by",
            foreignKey = @ForeignKey(name = "fk_order_cancelled_by")
    )
    private User cancelledBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime confirmedAt;

    private LocalDateTime completedAt;

    private LocalDateTime cancellationRequestedAt;

    private LocalDateTime cancelledAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (discountPercentage == null) {
            discountPercentage = BigDecimal.ZERO;
        }

        if (orderStatus == null) {
            orderStatus = OrderStatus.PENDING;
        }

        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }

        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }

        if (discountAmount == null) {
            discountAmount = BigDecimal.ZERO;
        }

        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
        if (stockDeducted == null) {
            stockDeducted = false;
        }
        if (stockReversed == null) {
            stockReversed = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}