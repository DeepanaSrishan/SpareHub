package com.sparehub.entity.supplier;



import com.sparehub.entity.inventory.SparePart;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "supplier_products",
        indexes = {
                @Index(
                        name = "idx_supplier_product_supplier",
                        columnList = "supplier_id"
                ),
                @Index(
                        name = "idx_supplier_product_spare_part",
                        columnList = "spare_part_id"
                ),
                @Index(
                        name = "idx_supplier_product_active",
                        columnList = "active"
                ),
                @Index(
                        name = "idx_supplier_product_price",
                        columnList = "purchase_price"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_supplier_spare_part",
                        columnNames = {
                                "supplier_id",
                                "spare_part_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "supplier_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_supplier_product_supplier"
            )
    )
    private Supplier supplier;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "spare_part_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_supplier_product_spare_part"
            )
    )
    private SparePart sparePart;

    /*
     * Supplier තමන්ගේ catalog එකේ භාවිත කරන
     * part number එක optional field එකක්.
     */
    @Column(
            name = "supplier_part_number",
            length = 100
    )
    private String supplierPartNumber;

    @Column(
            name = "purchase_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal purchasePrice;

    @Column(
            name = "minimum_order_quantity",
            nullable = false
    )
    private Integer minimumOrderQuantity = 1;

    @Column(
            name = "lead_time_days",
            nullable = false
    )
    private Integer leadTimeDays = 0;

    @Column(
            name = "warranty_months",
            nullable = false
    )
    private Integer warrantyMonths = 0;

    /*
     * එක spare part එකකට preferred supplier
     * කවුද කියලා සඳහන් කිරීමට.
     */
    @Column(nullable = false)
    private Boolean preferred = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(
            name = "last_price_updated_at",
            nullable = false
    )
    private LocalDateTime lastPriceUpdatedAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

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

        createdAt = now;
        updatedAt = now;

        if (lastPriceUpdatedAt == null) {
            lastPriceUpdatedAt = now;
        }

        if (minimumOrderQuantity == null) {
            minimumOrderQuantity = 1;
        }

        if (leadTimeDays == null) {
            leadTimeDays = 0;
        }

        if (warrantyMonths == null) {
            warrantyMonths = 0;
        }

        if (preferred == null) {
            preferred = false;
        }

        if (active == null) {
            active = true;
        }

        normalizeValues();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        normalizeValues();
    }

    private void normalizeValues() {
        if (supplierPartNumber != null) {
            supplierPartNumber =
                    supplierPartNumber.trim()
                            .toUpperCase();
        }
    }
}