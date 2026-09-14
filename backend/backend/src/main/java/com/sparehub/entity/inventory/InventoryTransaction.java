package com.sparehub.entity.inventory;



import com.sparehub.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(
        name = "inventory_transactions",
        indexes = {
                @Index(
                        name = "idx_inventory_transaction_part",
                        columnList = "spare_part_id"
                ),
                @Index(
                        name = "idx_inventory_transaction_type",
                        columnList = "transaction_type"
                ),
                @Index(
                        name = "idx_inventory_transaction_created",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_inventory_transaction_staff",
                        columnList = "performed_by_email"
                ),
                @Index(
                        name = "idx_inventory_transaction_reference",
                        columnList =
                                "reference_type, reference_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class InventoryTransaction extends BaseEntity {

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
                    name =
                            "fk_inventory_transaction_spare_part"
            )
    )
    private SparePart sparePart;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "transaction_type",
            nullable = false,
            length = 40
    )
    private InventoryTransactionType transactionType;

    /*
     * Positive value: stock වැඩි වුණා
     * Negative value: stock අඩු වුණා
     */
    @Column(
            name = "quantity_change",
            nullable = false
    )
    private Integer quantityChange;

    @Column(
            name = "quantity_before",
            nullable = false
    )
    private Integer quantityBefore;

    @Column(
            name = "quantity_after",
            nullable = false
    )
    private Integer quantityAfter;

    @Column(
            name = "reason",
            nullable = false,
            length = 500
    )
    private String reason;

    @Column(
            name = "reference_number",
            length = 100
    )
    private String referenceNumber;

    /*
     * ORDER, SUPPLIER_DELIVERY, MANUAL වැනි value.
     */
    @Column(
            name = "reference_type",
            length = 50
    )
    private String referenceType;


    @Column(name = "reference_id")
    private Long referenceId;


    @Column(
            name = "performed_by_email",
            nullable = false,
            length = 150
    )
    private String performedByEmail;
}
