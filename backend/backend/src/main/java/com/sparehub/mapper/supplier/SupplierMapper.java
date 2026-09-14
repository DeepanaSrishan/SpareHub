package com.sparehub.mapper.supplier;


import com.sparehub.dto.response.supplier.SupplierResponse;
import com.sparehub.dto.response.supplier.SupplierSummaryResponse;
import com.sparehub.entity.supplier.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierSummaryResponse toSummaryResponse(
            Supplier supplier
    ) {
        return new SupplierSummaryResponse(
                supplier.getId(),
                supplier.getSupplierCode(),
                supplier.getCompanyName(),
                supplier.getContactPerson(),
                supplier.getEmail(),
                supplier.getContactNumber(),
                supplier.getCity(),
                supplier.getCountry(),
                supplier.getActive(),
                getProductCount(supplier),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt()
        );
    }

    public SupplierResponse toResponse(
            Supplier supplier
    ) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getSupplierCode(),
                supplier.getCompanyName(),
                supplier.getContactPerson(),
                supplier.getEmail(),
                supplier.getContactNumber(),
                supplier.getAlternateContactNumber(),
                supplier.getAddress(),
                supplier.getCity(),
                supplier.getCountry(),
                supplier.getTaxRegistrationNumber(),
                supplier.getBankAccountDetails(),
                supplier.getNotes(),
                supplier.getActive(),
                getProductCount(supplier),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt()
        );
    }

    private int getProductCount(Supplier supplier) {
        if (supplier.getProducts() == null) {
            return 0;
        }

        return supplier.getProducts().size();
    }
}