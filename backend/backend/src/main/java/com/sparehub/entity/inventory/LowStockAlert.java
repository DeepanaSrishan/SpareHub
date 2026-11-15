package com.sparehub.entity.inventory;



import com.sparehub.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "low_stock_alerts",
        indexes = {
                @Index(
                        name = "idx_low_stock_alert_part",
                        columnList = "spare_part_id"
                ),
                @Index(
                        name = "idx_low_stock_alert_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_low_stock_alert_created",
                        columnList = "created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class LowStockAlert extends BaseEntity {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "spare_part_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_low_stock_alert_spare_part"
            )
    )
    private SparePart sparePart;

    @Column(
            name = "stock_quantity",
            nullable = false
    )
    private Integer stockQuantity;

    @Column(
            name = "reorder_level",
            nullable = false
    )
    private Integer reorderLevel;

    @Column(
            name = "message",
            nullable = false,
            length = 500
    )
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private InventoryAlertStatus status =
            InventoryAlertStatus.OPEN;

    @Column(
            name = "acknowledged_by_email",
            length = 150
    )
    private String acknowledgedByEmail;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public void acknowledge(
            String email
    ) {
        if (
                status ==
                        InventoryAlertStatus.RESOLVED
        ) {
            throw new IllegalStateException(
                    "A resolved alert cannot be acknowledged"
            );
        }

        status =
                InventoryAlertStatus.ACKNOWLEDGED;

        acknowledgedByEmail = email;
        acknowledgedAt = LocalDateTime.now();
    }

    public void resolve() {
        status = InventoryAlertStatus.RESOLVED;
        resolvedAt = LocalDateTime.now();
    }
}
