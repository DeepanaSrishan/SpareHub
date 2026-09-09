package com.sparehub.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_tiers")
public class LoyaltyTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tier_name", nullable = false, unique = true, length = 50)
    private String tierName; // Bronze, Silver, Gold, Platinum

    @Column(name = "min_spend_amount", precision = 10, scale = 2)
    private BigDecimal minSpendAmount = BigDecimal.ZERO; // in Rs. (LKR)

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public LoyaltyTier() {}

    public LoyaltyTier(String tierName, BigDecimal minSpendAmount, BigDecimal discountPercentage) {
        this.tierName = tierName;
        this.minSpendAmount = minSpendAmount;
        this.discountPercentage = discountPercentage;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTierName() {
        return tierName;
    }

    public void setTierName(String tierName) {
        this.tierName = tierName;
    }

    public BigDecimal getMinSpendAmount() {
        return minSpendAmount;
    }

    public void setMinSpendAmount(BigDecimal minSpendAmount) {
        this.minSpendAmount = minSpendAmount;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
