package com.sparehub.service.supplier;



import com.sparehub.dto.request.supplier.AssignSupplierProductRequest;
import com.sparehub.dto.request.supplier.UpdateSupplierProductRequest;
import com.sparehub.dto.response.supplier.PriceComparisonResponse;
import com.sparehub.dto.response.supplier.SupplierProductResponse;

import java.util.List;

public interface SupplierProductService {

    SupplierProductResponse assignProduct(
            Long supplierId,
            AssignSupplierProductRequest request
    );

    List<SupplierProductResponse>
    getSupplierProducts(
            Long supplierId,
            Boolean activeOnly
    );

    SupplierProductResponse
    getSupplierProductById(
            Long supplierId,
            Long supplierProductId
    );

    SupplierProductResponse updateSupplierProduct(
            Long supplierId,
            Long supplierProductId,
            UpdateSupplierProductRequest request
    );

    SupplierProductResponse deactivateSupplierProduct(
            Long supplierId,
            Long supplierProductId
    );

    SupplierProductResponse activateSupplierProduct(
            Long supplierId,
            Long supplierProductId
    );

    SupplierProductResponse setPreferredSupplier(
            Long supplierId,
            Long supplierProductId
    );

    PriceComparisonResponse compareSupplierPrices(
            Long sparePartId
    );
}