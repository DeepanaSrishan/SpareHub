package com.sparehub.service.supplier;



import com.sparehub.dto.request.supplier.CreateSupplierRequest;
import com.sparehub.dto.request.supplier.UpdateSupplierRequest;
import com.sparehub.dto.response.supplier.SupplierResponse;
import com.sparehub.dto.response.supplier.SupplierSummaryResponse;

import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(
            CreateSupplierRequest request
    );

    List<SupplierSummaryResponse> getAllSuppliers(
            Boolean activeOnly
    );

    SupplierResponse getSupplierById(
            Long supplierId
    );

    List<SupplierSummaryResponse> searchSuppliers(
            String query
    );

    SupplierResponse updateSupplier(
            Long supplierId,
            UpdateSupplierRequest request
    );

    SupplierResponse deactivateSupplier(
            Long supplierId
    );

    SupplierResponse activateSupplier(
            Long supplierId
    );

    SupplierResponse suspendSupplier(
            Long supplierId,
            String reason
    );

    SupplierResponse updateSupplierStatus(
            Long supplierId,
            com.sparehub.entity.supplier.SupplierStatus status,
            String reason
    );
}