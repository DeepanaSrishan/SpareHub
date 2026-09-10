package com.sparehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_parts", uniqueConstraints = {
    @UniqueConstraint(columnNames = "part_number")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String partNumber;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private SubCategory subCategory;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(nullable = false)
    private Integer reorderLevel = 10;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getAvailabilityStatus() {
        if (!active) {
            return "INACTIVE";
        } else if (stockQuantity == 0) {
            return "OUT_OF_STOCK";
        } else if (stockQuantity <= reorderLevel) {
            return "LOW_STOCK";
        } else {
            return "IN_STOCK";
        }
    }
}
