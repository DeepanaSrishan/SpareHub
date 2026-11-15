package com.sparehub.entity.supplier;



import com.sparehub.entity.supplier.SupplierTransactionType;
import com.sparehub.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "supplier_transactions",
        indexes = {
                @Index(
                        name = "idx_supplier_transaction_supplier",
                        columnList = "supplier_id"
                ),
                @Index(
                        name = "idx_supplier_transaction_type",
                        columnList = "transaction_type"
                ),
                @Index(
                        name = "idx_supplier_transaction_date",
                        columnList = "created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "supplier_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_supplier_transaction_supplier"
            )
    )
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "purchase_id",
            foreignKey = @ForeignKey(
                    name = "fk_supplier_transaction_purchase"
            )
    )
    private SupplierPurchase purchase;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "transaction_type",
            nullable = false,
            length = 40
    )
    private SupplierTransactionType transactionType;

    @Column(
            name = "reference_number",
            length = 100
    )
    private String referenceNumber;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;

    private Integer quantity;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "recorded_by",
            foreignKey = @ForeignKey(
                    name = "fk_supplier_transaction_user"
            )
    )
    private User recordedBy;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
