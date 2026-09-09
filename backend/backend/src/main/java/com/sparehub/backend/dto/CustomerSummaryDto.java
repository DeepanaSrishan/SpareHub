package com.sparehub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerSummaryDto {

    private Integer id;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private Integer loyaltyTierId;
    private String loyaltyTierName;
    private Double discountPercentage;
    private BigDecimal totalSpend; // in Rs. (LKR)
    private Long orderCount;
    private Integer suggestedTierId;
    private String suggestedTierName;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public CustomerSummaryDto() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getLoyaltyTierId() {
        return loyaltyTierId;
    }

    public void setLoyaltyTierId(Integer loyaltyTierId) {
        this.loyaltyTierId = loyaltyTierId;
    }

    public String getLoyaltyTierName() {
        return loyaltyTierName;
    }

    public void setLoyaltyTierName(String loyaltyTierName) {
        this.loyaltyTierName = loyaltyTierName;
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getTotalSpend() {
        return totalSpend;
    }

    public void setTotalSpend(BigDecimal totalSpend) {
        this.totalSpend = totalSpend;
    }

    public Long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }

    public Integer getSuggestedTierId() {
        return suggestedTierId;
    }

    public void setSuggestedTierId(Integer suggestedTierId) {
        this.suggestedTierId = suggestedTierId;
    }

    public String getSuggestedTierName() {
        return suggestedTierName;
    }

    public void setSuggestedTierName(String suggestedTierName) {
        this.suggestedTierName = suggestedTierName;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
