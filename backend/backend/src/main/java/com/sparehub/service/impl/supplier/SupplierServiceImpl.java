package com.sparehub.service.impl.supplier;


import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.dto.request.supplier.CreateSupplierRequest;
import com.sparehub.dto.request.supplier.UpdateSupplierRequest;
import com.sparehub.dto.response.supplier.SupplierResponse;
import com.sparehub.dto.response.supplier.SupplierSummaryResponse;
import com.sparehub.entity.supplier.Supplier;
import com.sparehub.mapper.supplier.SupplierMapper;
import com.sparehub.repository.supplier.SupplierRepository;
import com.sparehub.service.supplier.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl
        implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierResponse createSupplier(
            CreateSupplierRequest request
    ) {
        String normalizedEmail =
                normalizeEmail(request.email());

        validateEmailForCreate(normalizedEmail);

        Supplier supplier = new Supplier();

        supplier.setSupplierCode(
                generateSupplierCode()
        );

        applyCreateRequest(
                supplier,
                request,
                normalizedEmail
        );

        supplier.setActive(true);

        Supplier savedSupplier =
                supplierRepository.save(supplier);

        return supplierMapper.toResponse(savedSupplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierSummaryResponse>
    getAllSuppliers(Boolean activeOnly) {
        List<Supplier> suppliers;

        if (Boolean.TRUE.equals(activeOnly)) {
            suppliers = supplierRepository
                    .findAllByActiveTrueOrderByCompanyNameAsc();
        } else {
            suppliers = supplierRepository
                    .findAllByOrderByCompanyNameAsc();
        }

        return suppliers.stream()
                .map(supplierMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(
            Long supplierId
    ) {
        Supplier supplier =
                getRequiredSupplier(supplierId);

        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierSummaryResponse>
    searchSuppliers(String query) {
        if (query == null || query.isBlank()) {
            return getAllSuppliers(false);
        }

        String normalizedQuery = query.trim();

        return supplierRepository
                .searchSuppliers(normalizedQuery)
                .stream()
                .map(supplierMapper::toSummaryResponse)
                .toList();
    }

    @Override
    public SupplierResponse updateSupplier(
            Long supplierId,
            UpdateSupplierRequest request
    ) {
        Supplier supplier =
                getRequiredSupplier(supplierId);

        String normalizedEmail =
                normalizeEmail(request.email());

        if (
                supplierRepository
                        .existsByEmailIgnoreCaseAndIdNot(
                                normalizedEmail,
                                supplierId
                        )
        ) {
            throw new BadRequestException(
                    "Another supplier already uses this email address"
            );
        }

        applyUpdateRequest(
                supplier,
                request,
                normalizedEmail
        );

        Supplier savedSupplier =
                supplierRepository.save(supplier);

        return supplierMapper.toResponse(savedSupplier);
    }

    @Override
    public SupplierResponse deactivateSupplier(
            Long supplierId
    ) {
        Supplier supplier =
                getRequiredSupplier(supplierId);

        if (!Boolean.TRUE.equals(supplier.getActive())) {
            throw new BadRequestException(
                    "Supplier is already inactive"
            );
        }

        supplier.setActive(false);

        /*
         * Inactive supplierගේ product relationshipsත්
         * purchasing සඳහා unavailable කරනවා.
         */
        if (supplier.getProducts() != null) {
            supplier.getProducts()
                    .forEach(supplierProduct ->
                            supplierProduct.setActive(false)
                    );
        }

        Supplier savedSupplier =
                supplierRepository.save(supplier);

        return supplierMapper.toResponse(savedSupplier);
    }

    @Override
    public SupplierResponse activateSupplier(
            Long supplierId
    ) {
        Supplier supplier =
                getRequiredSupplier(supplierId);

        if (Boolean.TRUE.equals(supplier.getActive())) {
            throw new BadRequestException(
                    "Supplier is already active"
            );
        }

        supplier.setActive(true);

        /*
         * Supplier reactivate කළාම products automatically
         * reactivate කරන්නේ නැහැ. Inventory Staff ඒවා
         * separately review කර activate කළ යුතුයි.
         */

        Supplier savedSupplier =
                supplierRepository.save(supplier);

        return supplierMapper.toResponse(savedSupplier);
    }

    private Supplier getRequiredSupplier(
            Long supplierId
    ) {
        return supplierRepository
                .findDetailedById(supplierId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Supplier was not found with ID: "
                                        + supplierId
                        )
                );
    }

    private void validateEmailForCreate(
            String normalizedEmail
    ) {
        if (
                supplierRepository
                        .existsByEmailIgnoreCase(
                                normalizedEmail
                        )
        ) {
            throw new BadRequestException(
                    "A supplier already uses this email address"
            );
        }
    }

    private void applyCreateRequest(
            Supplier supplier,
            CreateSupplierRequest request,
            String normalizedEmail
    ) {
        supplier.setCompanyName(
                cleanRequired(request.companyName())
        );

        supplier.setContactPerson(
                cleanRequired(request.contactPerson())
        );

        supplier.setEmail(normalizedEmail);

        supplier.setContactNumber(
                cleanRequired(request.contactNumber())
        );

        supplier.setAlternateContactNumber(
                cleanOptional(
                        request.alternateContactNumber()
                )
        );

        supplier.setAddress(
                cleanOptional(request.address())
        );

        supplier.setCity(
                cleanOptional(request.city())
        );

        supplier.setCountry(
                cleanOptional(request.country())
        );

        supplier.setTaxRegistrationNumber(
                cleanOptional(
                        request.taxRegistrationNumber()
                )
        );

        supplier.setBankAccountDetails(
                cleanOptional(
                        request.bankAccountDetails()
                )
        );

        supplier.setNotes(
                cleanOptional(request.notes())
        );
    }

    private void applyUpdateRequest(
            Supplier supplier,
            UpdateSupplierRequest request,
            String normalizedEmail
    ) {
        supplier.setCompanyName(
                cleanRequired(request.companyName())
        );

        supplier.setContactPerson(
                cleanRequired(request.contactPerson())
        );

        supplier.setEmail(normalizedEmail);

        supplier.setContactNumber(
                cleanRequired(request.contactNumber())
        );

        supplier.setAlternateContactNumber(
                cleanOptional(
                        request.alternateContactNumber()
                )
        );

        supplier.setAddress(
                cleanOptional(request.address())
        );

        supplier.setCity(
                cleanOptional(request.city())
        );

        supplier.setCountry(
                cleanOptional(request.country())
        );

        supplier.setTaxRegistrationNumber(
                cleanOptional(
                        request.taxRegistrationNumber()
                )
        );

        supplier.setBankAccountDetails(
                cleanOptional(
                        request.bankAccountDetails()
                )
        );

        supplier.setNotes(
                cleanOptional(request.notes())
        );
    }

    private String generateSupplierCode() {
        String datePart = LocalDateTime.now()
                .format(
                        DateTimeFormatter.ofPattern(
                                "yyyyMMdd"
                        )
                );

        String supplierCode;

        do {
            String randomPart = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 6)
                    .toUpperCase(Locale.ROOT);

            supplierCode =
                    "SUP-" + datePart + "-" + randomPart;

        } while (
                supplierRepository
                        .existsBySupplierCodeIgnoreCase(
                                supplierCode
                        )
        );

        return supplierCode;
    }

    private String normalizeEmail(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    "Supplier email is required"
            );
        }

        return value.trim()
                .toLowerCase(Locale.ROOT);
    }

    private String cleanRequired(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    "A required supplier field is missing"
            );
        }

        return value.trim();
    }

    private String cleanOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}