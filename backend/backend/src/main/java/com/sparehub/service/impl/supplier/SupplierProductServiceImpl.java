package com.sparehub.service.impl.supplier;



import com.sparehub.dto.supplier.AssignSupplierProductRequest;
import com.sparehub.dto.supplier.PriceComparisonResponse;
import com.sparehub.dto.supplier.SupplierProductResponse;
import com.sparehub.dto.supplier.UpdateSupplierProductRequest;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.supplier.Supplier;
import com.sparehub.entity.supplier.SupplierProduct;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.SparePartRepository;
import com.sparehub.repository.supplier.SupplierProductRepository;
import com.sparehub.repository.supplier.SupplierRepository;
import com.sparehub.service.supplier.SupplierProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierProductServiceImpl
        implements SupplierProductService {

    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");

    private final SupplierRepository supplierRepository;

    private final SupplierProductRepository
            supplierProductRepository;

    private final SparePartRepository sparePartRepository;

    @Override
    public SupplierProductResponse assignProduct(
            Long supplierId,
            AssignSupplierProductRequest request
    ) {
        Supplier supplier =
                getRequiredSupplier(supplierId);

        if (!Boolean.TRUE.equals(supplier.getActive())) {
            throw new BadRequestException(
                    "Cannot assign products to an inactive supplier"
            );
        }

        SparePart sparePart = sparePartRepository
                .findById(request.sparePartId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Spare part was not found with ID: "
                                        + request.sparePartId()
                        )
                );

        if (
                supplierProductRepository
                        .existsBySupplierIdAndSparePartId(
                                supplierId,
                                sparePart.getId()
                        )
        ) {
            throw new BadRequestException(
                    "This spare part is already assigned to the supplier"
            );
        }

        validateValues(
                request.purchasePrice(),
                request.minimumOrderQuantity(),
                request.leadTimeDays(),
                request.warrantyMonths()
        );

        SupplierProduct supplierProduct =
                new SupplierProduct();

        supplierProduct.setSupplier(supplier);
        supplierProduct.setSparePart(sparePart);

        supplierProduct.setSupplierPartNumber(
                normalizePartNumber(
                        request.supplierPartNumber()
                )
        );

        supplierProduct.setPurchasePrice(
                money(request.purchasePrice())
        );

        supplierProduct.setMinimumOrderQuantity(
                request.minimumOrderQuantity()
        );

        supplierProduct.setLeadTimeDays(
                request.leadTimeDays()
        );

        supplierProduct.setWarrantyMonths(
                request.warrantyMonths()
        );

        supplierProduct.setPreferred(
                Boolean.TRUE.equals(
                        request.preferred()
                )
        );

        supplierProduct.setActive(true);
        supplierProduct.setLastPriceUpdatedAt(
                LocalDateTime.now()
        );

        SupplierProduct saved =
                supplierProductRepository.save(
                        supplierProduct
                );

        if (Boolean.TRUE.equals(saved.getPreferred())) {
            clearOtherPreferredSuppliers(saved);
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierProductResponse>
    getSupplierProducts(
            Long supplierId,
            Boolean activeOnly
    ) {
        getRequiredSupplier(supplierId);

        List<SupplierProduct> products;

        if (Boolean.TRUE.equals(activeOnly)) {
            products = supplierProductRepository
                    .findActiveProductsBySupplierId(
                            supplierId
                    );
        } else {
            products = supplierProductRepository
                    .findProductsBySupplierId(
                            supplierId
                    );
        }

        return products.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierProductResponse
    getSupplierProductById(
            Long supplierId,
            Long supplierProductId
    ) {
        SupplierProduct supplierProduct =
                getRequiredSupplierProduct(
                        supplierId,
                        supplierProductId
                );

        return toResponse(supplierProduct);
    }

    @Override
    public SupplierProductResponse updateSupplierProduct(
            Long supplierId,
            Long supplierProductId,
            UpdateSupplierProductRequest request
    ) {
        SupplierProduct supplierProduct =
                getRequiredSupplierProduct(
                        supplierId,
                        supplierProductId
                );

        validateValues(
                request.purchasePrice(),
                request.minimumOrderQuantity(),
                request.leadTimeDays(),
                request.warrantyMonths()
        );

        BigDecimal oldPrice =
                supplierProduct.getPurchasePrice();

        BigDecimal newPrice =
                money(request.purchasePrice());

        supplierProduct.setSupplierPartNumber(
                normalizePartNumber(
                        request.supplierPartNumber()
                )
        );

        supplierProduct.setPurchasePrice(newPrice);

        supplierProduct.setMinimumOrderQuantity(
                request.minimumOrderQuantity()
        );

        supplierProduct.setLeadTimeDays(
                request.leadTimeDays()
        );

        supplierProduct.setWarrantyMonths(
                request.warrantyMonths()
        );

        boolean makePreferred =
                Boolean.TRUE.equals(
                        request.preferred()
                );

        supplierProduct.setPreferred(makePreferred);

        /*
         * Price එක ඇත්තටම වෙනස් වුණොත් පමණක්
         * lastPriceUpdatedAt වෙනස් කරනවා.
         */
        if (
                oldPrice == null ||
                        oldPrice.compareTo(newPrice) != 0
        ) {
            supplierProduct.setLastPriceUpdatedAt(
                    LocalDateTime.now()
            );
        }

        SupplierProduct saved =
                supplierProductRepository.save(
                        supplierProduct
                );

        if (makePreferred) {
            clearOtherPreferredSuppliers(saved);
        }

        return toResponse(saved);
    }

    @Override
    public SupplierProductResponse
    deactivateSupplierProduct(
            Long supplierId,
            Long supplierProductId
    ) {
        SupplierProduct supplierProduct =
                getRequiredSupplierProduct(
                        supplierId,
                        supplierProductId
                );

        if (!Boolean.TRUE.equals(
                supplierProduct.getActive()
        )) {
            throw new BadRequestException(
                    "Supplier product is already inactive"
            );
        }

        supplierProduct.setActive(false);
        supplierProduct.setPreferred(false);

        SupplierProduct saved =
                supplierProductRepository.save(
                        supplierProduct
                );

        return toResponse(saved);
    }

    @Override
    public SupplierProductResponse
    activateSupplierProduct(
            Long supplierId,
            Long supplierProductId
    ) {
        SupplierProduct supplierProduct =
                getRequiredSupplierProduct(
                        supplierId,
                        supplierProductId
                );

        if (!Boolean.TRUE.equals(
                supplierProduct.getSupplier().getActive()
        )) {
            throw new BadRequestException(
                    "Cannot activate a product relationship for an inactive supplier"
            );
        }

        if (Boolean.TRUE.equals(
                supplierProduct.getActive()
        )) {
            throw new BadRequestException(
                    "Supplier product is already active"
            );
        }

        supplierProduct.setActive(true);

        SupplierProduct saved =
                supplierProductRepository.save(
                        supplierProduct
                );

        return toResponse(saved);
    }

    @Override
    public SupplierProductResponse
    setPreferredSupplier(
            Long supplierId,
            Long supplierProductId
    ) {
        SupplierProduct supplierProduct =
                getRequiredSupplierProduct(
                        supplierId,
                        supplierProductId
                );

        if (!Boolean.TRUE.equals(
                supplierProduct.getActive()
        )) {
            throw new BadRequestException(
                    "Inactive supplier-product relationship cannot be preferred"
            );
        }

        if (!Boolean.TRUE.equals(
                supplierProduct.getSupplier().getActive()
        )) {
            throw new BadRequestException(
                    "Inactive supplier cannot be preferred"
            );
        }

        clearOtherPreferredSuppliers(
                supplierProduct
        );

        supplierProduct.setPreferred(true);

        SupplierProduct saved =
                supplierProductRepository.save(
                        supplierProduct
                );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PriceComparisonResponse compareSupplierPrices(
            Long sparePartId
    ) {
        SparePart sparePart = sparePartRepository
                .findById(sparePartId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Spare part was not found with ID: "
                                        + sparePartId
                        )
                );

        List<SupplierProduct> supplierProducts =
                supplierProductRepository
                        .findActiveSuppliersBySparePartId(
                                sparePartId
                        );

        List<SupplierProductResponse> responses =
                supplierProducts.stream()
                        .map(this::toResponse)
                        .toList();

        BigDecimal lowestPrice =
                supplierProducts.isEmpty()
                        ? BigDecimal.ZERO
                        : supplierProducts.get(0)
                        .getPurchasePrice();

        BigDecimal highestPrice =
                supplierProducts.stream()
                        .map(
                                SupplierProduct::getPurchasePrice
                        )
                        .max(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO);

        return new PriceComparisonResponse(
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getSellingPrice(),
                money(lowestPrice),
                money(highestPrice),
                supplierProducts.size(),
                responses
        );
    }

    private void clearOtherPreferredSuppliers(
            SupplierProduct selected
    ) {
        List<SupplierProduct> existingPreferred =
                supplierProductRepository
                        .findOtherPreferredSuppliers(
                                selected.getSparePart()
                                        .getId(),
                                selected.getId()
                        );

        existingPreferred.forEach(item ->
                item.setPreferred(false)
        );

        supplierProductRepository.saveAll(
                existingPreferred
        );
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

    private SupplierProduct
    getRequiredSupplierProduct(
            Long supplierId,
            Long supplierProductId
    ) {
        SupplierProduct supplierProduct =
                supplierProductRepository
                        .findDetailedById(
                                supplierProductId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supplier product relationship was not found with ID: "
                                                + supplierProductId
                                )
                        );

        if (
                !supplierProduct.getSupplier()
                        .getId()
                        .equals(supplierId)
        ) {
            throw new ResourceNotFoundException(
                    "Supplier product relationship was not found for this supplier"
            );
        }

        return supplierProduct;
    }

    private SupplierProductResponse toResponse(
            SupplierProduct supplierProduct
    ) {
        Supplier supplier =
                supplierProduct.getSupplier();

        SparePart sparePart =
                supplierProduct.getSparePart();

        BigDecimal sellingPrice =
                money(sparePart.getSellingPrice());

        BigDecimal purchasePrice =
                money(supplierProduct.getPurchasePrice());

        BigDecimal estimatedProfit =
                money(
                        sellingPrice.subtract(
                                purchasePrice
                        )
                );

        BigDecimal profitMarginPercentage =
                calculateProfitMargin(
                        sellingPrice,
                        purchasePrice
                );

        return new SupplierProductResponse(
                supplierProduct.getId(),

                supplier.getId(),
                supplier.getSupplierCode(),
                supplier.getCompanyName(),
                supplier.getActive(),

                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getBrand(),
                sellingPrice,

                supplierProduct.getSupplierPartNumber(),
                purchasePrice,
                estimatedProfit,
                profitMarginPercentage,

                supplierProduct
                        .getMinimumOrderQuantity(),

                supplierProduct.getLeadTimeDays(),
                supplierProduct.getWarrantyMonths(),

                supplierProduct.getPreferred(),
                supplierProduct.getActive(),

                supplierProduct
                        .getLastPriceUpdatedAt(),

                supplierProduct.getCreatedAt(),
                supplierProduct.getUpdatedAt()
        );
    }

    private BigDecimal calculateProfitMargin(
            BigDecimal sellingPrice,
            BigDecimal purchasePrice
    ) {
        if (
                sellingPrice == null ||
                        sellingPrice.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            return money(BigDecimal.ZERO);
        }

        return sellingPrice
                .subtract(purchasePrice)
                .multiply(ONE_HUNDRED)
                .divide(
                        sellingPrice,
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private void validateValues(
            BigDecimal purchasePrice,
            Integer minimumOrderQuantity,
            Integer leadTimeDays,
            Integer warrantyMonths
    ) {
        if (
                purchasePrice == null ||
                        purchasePrice.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            throw new BadRequestException(
                    "Purchase price must be greater than zero"
            );
        }

        if (
                minimumOrderQuantity == null ||
                        minimumOrderQuantity < 1
        ) {
            throw new BadRequestException(
                    "Minimum order quantity must be at least 1"
            );
        }

        if (
                leadTimeDays == null ||
                        leadTimeDays < 0
        ) {
            throw new BadRequestException(
                    "Lead time cannot be negative"
            );
        }

        if (
                warrantyMonths == null ||
                        warrantyMonths < 0
        ) {
            throw new BadRequestException(
                    "Warranty period cannot be negative"
            );
        }
    }

    private String normalizePartNumber(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase();
    }

    private BigDecimal money(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return value.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }
}