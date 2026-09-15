package com.sparehub.service.supplier;



import com.sparehub.dto.request.supplier.CancelSupplierPurchaseRequest;
import com.sparehub.dto.request.supplier.CreateSupplierPurchaseRequest;
import com.sparehub.dto.request.supplier.ReceiveSupplierPurchaseRequest;
import com.sparehub.dto.response.supplier.SupplierPurchaseResponse;
import com.sparehub.dto.response.supplier.SupplierTransactionResponse;
import com.sparehub.entity.supplier.PurchaseStatus;
import com.sparehub.entity.supplier.SupplierTransactionType;

import java.time.LocalDate;
import java.util.List;

public interface SupplierPurchaseService {

    SupplierPurchaseResponse createPurchase(
            Long supplierId,
            CreateSupplierPurchaseRequest request
    );

    List<SupplierPurchaseResponse> getPurchases(
            Long supplierId,
            PurchaseStatus status
    );

    SupplierPurchaseResponse getPurchaseById(
            Long purchaseId
    );

    SupplierPurchaseResponse receivePurchase(
            Long purchaseId,
            ReceiveSupplierPurchaseRequest request
    );

    SupplierPurchaseResponse cancelPurchase(
            Long purchaseId,
            CancelSupplierPurchaseRequest request
    );

    List<SupplierTransactionResponse>
    getSupplierTransactionHistory(
            Long supplierId,
            LocalDate startDate,
            LocalDate endDate,
            SupplierTransactionType type
    );
}