package com.sparehub.entity.order;



import com.sparehub.enums.order.OrderStatus;
import com.sparehub.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "order_status_history",
        indexes = {
                @Index(
                        name = "idx_status_history_order",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_status_history_changed_at",
                        columnList = "changed_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_status_history_order"
            )
    )
    private CustomerOrder order;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "previous_status",
            nullable = false,
            length = 30
    )
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "new_status",
            nullable = false,
            length = 30
    )
    private OrderStatus newStatus;

    @Column(length = 500)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "changed_by",
            foreignKey = @ForeignKey(
                    name = "fk_status_history_changed_by"
            )
    )
    private User changedBy;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = LocalDateTime.now();
        }
    }
}
