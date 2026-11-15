package com.sparehub.entity.order;



import com.sparehub.entity.inventory.SparePart;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_order_item_order")
    )
    private CustomerOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "spare_part_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_order_item_spare_part")
    )
    private SparePart sparePart;

    @Column(nullable = false, length = 100)
    private String partNumber;

    @Column(nullable = false, length = 200)
    private String productName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    public void calculateSubtotal() {
        if (unitPrice == null || quantity == null) {
            subtotal = BigDecimal.ZERO;
            return;
        }

        subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
