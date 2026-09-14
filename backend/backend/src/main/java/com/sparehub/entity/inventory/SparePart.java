package com.sparehub.entity.inventory;



import com.sparehub.entity.BaseEntity;
import com.sparehub.entity.supplier.SupplierProduct;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "spare_parts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_spare_part_number",
                        columnNames = "part_number"
                )
        },
        indexes = {
                @Index(
                        name = "idx_spare_part_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_spare_part_number",
                        columnList = "part_number"
                ),
                @Index(
                        name = "idx_spare_part_brand",
                        columnList = "brand"
                ),
                @Index(
                        name = "idx_spare_part_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_spare_part_category",
                        columnList = "category_id"
                ),
                @Index(
                        name = "idx_spare_part_price",
                        columnList = "selling_price"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class SparePart extends BaseEntity {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "part_number",
            nullable = false,
            length = 80
    )
    private String partNumber;

    @Column(
            name = "name",
            nullable = false,
            length = 150
    )
    private String name;

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    @Column(
            name = "brand",
            nullable = false,
            length = 100
    )
    private String brand;

    @Column(
            name = "vehicle_make",
            length = 100
    )
    private String vehicleMake;

    @Column(
            name = "vehicle_model",
            length = 100
    )
    private String vehicleModel;

    @Column(
            name = "manufacture_year",
            length = 30
    )
    private String manufactureYear;

    @Column(
            name = "cost_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(
            name = "selling_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(
            name = "stock_quantity",
            nullable = false
    )
    private Integer stockQuantity = 0;

    @Column(
            name = "reorder_level",
            nullable = false
    )
    private Integer reorderLevel = 5;

    @Column(
            name = "image_url",
            length = 1000
    )
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private SparePartStatus status =
            SparePartStatus.ACTIVE;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "category_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_spare_part_category"
            )
    )
    private Category category;

    /*
     * එකම spare part එක දෙදෙනෙක් එකවර update කරන විට
     * lost update problem එක වැළැක්වීමට භාවිත කරනවා.
     */
    @Version
    @Column(
            name = "version",
            nullable = false
    )
    private Long version = 0L;

    public boolean isAvailable() {
        return status == SparePartStatus.ACTIVE
                && stockQuantity != null
                && stockQuantity > 0;
    }

    public boolean isLowStock() {
        return stockQuantity != null
                && reorderLevel != null
                && stockQuantity <= reorderLevel;
    }

    public void activate() {
        this.status = SparePartStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = SparePartStatus.INACTIVE;
    }

    public void discontinue() {
        this.status = SparePartStatus.DISCONTINUED;
    }

    public void increaseStock(Integer quantity) {
        validatePositiveQuantity(quantity);

        this.stockQuantity += quantity;
    }

    public void decreaseStock(Integer quantity) {
        validatePositiveQuantity(quantity);

        if (stockQuantity < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock quantity"
            );
        }

        this.stockQuantity -= quantity;
    }

    public void changeStockQuantity(
            Integer newQuantity
    ) {
        if (newQuantity == null || newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Stock quantity cannot be negative"
            );
        }

        this.stockQuantity = newQuantity;
    }

    public void changeReorderLevel(
            Integer newReorderLevel
    ) {
        if (
                newReorderLevel == null ||
                        newReorderLevel < 0
        ) {
            throw new IllegalArgumentException(
                    "Reorder level cannot be negative"
            );
        }

        this.reorderLevel = newReorderLevel;
    }

    private void validatePositiveQuantity(
            Integer quantity
    ) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }
    }
    @OneToMany(
            mappedBy = "sparePart",
            fetch = FetchType.LAZY
    )
    private List<SupplierProduct> suppliers =
            new ArrayList<>();
}