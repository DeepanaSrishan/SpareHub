package com.sparehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @Column(nullable = false, length = 50)
    private String transactionType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE, LOSS, CORRECTION

    @Column(nullable = false)
    private Integer quantityBefore;

    @Column(nullable = false)
    private Integer quantityChanged;

    @Column(nullable = false)
    private Integer quantityAfter;

    @Column(length = 500)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
