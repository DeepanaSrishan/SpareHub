package com.sparehub.entity.supplier;



import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.supplier.PurchaseStatus;
import com.sparehub.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "supplier_purchases",
        indexes = {
                @Index(
                        name = "idx_purchase_supplier",
                        columnList = "supplier_id"
                ),
                @Index(
                        name = "idx_purchase_spare_part",
                        columnList = "spare_part_id"
                ),
                @Index(
                        name = "idx_purchase_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_purchase_ordered_at",
                        columnList = "ordered_at"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_supplier_purchase_number",
                        columnNames = "purchase_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "purchase_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String purchaseNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "supplier_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_purchase_supplier"
            )
    )
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "supplier_product_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_purchase_supplier_product"
            )
    )
    private SupplierProduct supplierProduct;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "spare_part_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_purchase_spare_part"
            )
    )
    private SparePart sparePart;

    @Column(
            name = "ordered_quantity",
            nullable = false
    )
    private Integer orderedQuantity;

    @Column(
            name = "received_quantity",
            nullable = false
    )
    private Integer receivedQuantity = 0;

    /*
     * Purchase order create කරන වෙලාවේ supplier price snapshot.
     */
    @Column(
            name = "unit_purchase_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal unitPurchasePrice;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 14,
            scale = 2
    )
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PurchaseStatus status;

    @Column(
            name = "supplier_invoice_number",
            length = 100
    )
    private String supplierInvoiceNumber;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "created_by",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_purchase_created_by"
            )
    )
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "received_by",
            foreignKey = @ForeignKey(
                    name = "fk_purchase_received_by"
            )
    )
    private User receivedBy;

    @Column(
            name = "ordered_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime orderedAt;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        orderedAt = now;
        updatedAt = now;

        if (receivedQuantity == null) {
            receivedQuantity = 0;
        }

        if (status == null) {
            status = PurchaseStatus.ORDERED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}