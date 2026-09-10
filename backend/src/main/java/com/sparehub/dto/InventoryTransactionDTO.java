package com.sparehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionDTO {
    
    private Long id;
    private Long sparePartId;
    private String partNumber;
    private String partName;
    private String transactionType;
    private Integer quantityBefore;
    private Integer quantityChanged;
    private Integer quantityAfter;
    private String reason;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
}
