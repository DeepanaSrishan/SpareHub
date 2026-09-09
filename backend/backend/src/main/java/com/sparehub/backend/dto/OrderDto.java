package com.sparehub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDto {

    private Integer id;
    private String orderNumber;
    private BigDecimal totalAmount; // in Rs. (LKR)
    private String status;
    private String paymentMethod;
    private String itemsSummary;
    private LocalDateTime createdAt;

    public OrderDto() {}

    public OrderDto(Integer id, String orderNumber, BigDecimal totalAmount, String status, String paymentMethod, String itemsSummary, LocalDateTime createdAt) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.itemsSummary = itemsSummary;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getItemsSummary() {
        return itemsSummary;
    }

    public void setItemsSummary(String itemsSummary) {
        this.itemsSummary = itemsSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
