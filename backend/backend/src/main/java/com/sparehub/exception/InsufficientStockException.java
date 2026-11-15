package com.sparehub.exception;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(
            String productName,
            int requestedQuantity,
            int availableQuantity
    ) {
        super(
                "Insufficient stock for " + productName
                        + ". Requested: " + requestedQuantity
                        + ", Available: " + availableQuantity
        );
    }
}