package com.sparehub.entity.inventory;

public enum InventoryTransactionType {

    INITIAL_STOCK,

    STOCK_IN,

    DAMAGED,

    MISSING,

    CORRECTION_INCREASE,

    CORRECTION_DECREASE,

    SALE,

    SALE_REVERSAL,

    PURCHASE
}