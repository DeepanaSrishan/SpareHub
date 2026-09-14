package com.sparehub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;




@Entity
@Table(
        name = "loyalty_tiers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_loyalty_tier_name",
                        columnNames = "name"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTier extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "name",
            nullable = false,
            length = 50
    )
    private String name;

    @Column(
            name = "minimum_points",
            nullable = false
    )
    private Integer minimumPoints;

    @Column(
            name = "discount_percentage",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal discountPercentage;

    @Column(
            name = "description",
            length = 500
    )
    private String description;

    @Column(
            name = "display_order",
            nullable = false
    )
    private Integer displayOrder;

    @Column(
            name = "active",
            nullable = false
    )
    private Boolean active;

    @PrePersist
    public void applyDefaults() {

        if (minimumPoints == null) {
            minimumPoints = 0;
        }

        if (discountPercentage == null) {
            discountPercentage = BigDecimal.ZERO;
        }

        if (displayOrder == null) {
            displayOrder = 0;
        }

        if (active == null) {
            active = true;
        }
    }
}