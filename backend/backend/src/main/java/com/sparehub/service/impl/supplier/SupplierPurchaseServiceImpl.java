package com.sparehub.service.impl.supplier;



import com.sparehub.dto.request.supplier.*;
import com.sparehub.dto.response.supplier.*;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.supplier.*;
import com.sparehub.entity.supplier.PurchaseStatus;
import com.sparehub.entity.supplier.SupplierTransactionType;
import com.sparehub.entity.User;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.supplier.*;
import com.sparehub.repository.UserRepository;
import com.sparehub.service.inventory.InventoryTransactionService;
import com.sparehub.service.supplier.SupplierPurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierPurchaseServiceImpl
        implements SupplierPurchaseService {

    private final SupplierRepository supplierRepository;
    private final SupplierProductRepository supplierProductRepository;
    private final SupplierPurchaseRepository supplierPurchaseRepository;
    private final SupplierTransactionRepository supplierTransactionRepository;
    private final UserRepository userRepository;

    private final InventoryTransactionService
            inventoryTransactionService;

    @Override
    public SupplierPurchaseResponse createPurchase(
            Long supplierId,
            CreateSupplierPurchaseRequest request
    ) {
        Supplier supplier = getRequiredSupplier(supplierId);

        if (!supplier.isEligibleForPurchase()) {
            throw new BadRequestException(
                    "Cannot create a purchase for an inactive or suspended supplier (Current status: " + supplier.getStatus() + ")"
            );
        }

        SupplierProduct supplierProduct =
                supplierProductRepository
                        .findDetailedById(
                                request.supplierProductId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supplier product relationship was not found"
                                )
                        );

        if (!supplierProduct.getSupplier()
                .getId().equals(supplierId)) {
            throw new BadRequestException(
                    "Selected product does not belong to this supplier"
            );
        }

        if (!Boolean.TRUE.equals(
                supplierProduct.getActive()
        )) {
            throw new BadRequestException(
                    "Selected supplier product is inactive"
            );
        }

        Integer effectiveQuantity = request.getEffectiveQuantity();
        if (effectiveQuantity < supplierProduct.getMinimumOrderQuantity()) {
            throw new BadRequestException(
                    "Quantity must be at least the supplier minimum order quantity: "
                            + supplierProduct
                            .getMinimumOrderQuantity()
            );
        }

        if (request.expectedDeliveryDate() != null
                && request.expectedDeliveryDate()
                .isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "Expected delivery date cannot be in the past"
            );
        }

        User currentUser = getCurrentUser();
        SparePart sparePart =
                supplierProduct.getSparePart();

        BigDecimal unitPrice =
                money(supplierProduct.getPurchasePrice());

        BigDecimal total = money(
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                effectiveQuantity
                        )
                )
        );

        SupplierPurchase purchase =
                new SupplierPurchase();

        purchase.setPurchaseNumber(
                generatePurchaseNumber()
        );

        purchase.setSupplier(supplier);
        purchase.setSupplierProduct(supplierProduct);
        purchase.setSparePart(sparePart);
        purchase.setOrderedQuantity(
                effectiveQuantity
        );
        purchase.setReceivedQuantity(0);
        purchase.setUnitPurchasePrice(unitPrice);
        purchase.setTotalAmount(total);
        purchase.setStatus(PurchaseStatus.ORDERED);
        purchase.setExpectedDeliveryDate(
                request.expectedDeliveryDate()
        );
        if (request.supplierInvoiceNumber() != null && !request.supplierInvoiceNumber().isBlank()) {
            purchase.setSupplierInvoiceNumber(request.supplierInvoiceNumber().trim());
        }
        purchase.setNotes(
                cleanText(request.notes())
        );
        purchase.setCreatedBy(currentUser);

        SupplierPurchase saved =
                supplierPurchaseRepository.save(purchase);

        saveTransaction(
                saved,
                SupplierTransactionType.PURCHASE_CREATED,
                saved.getPurchaseNumber(),
                saved.getTotalAmount(),
                saved.getOrderedQuantity(),
                "Supplier purchase order created",
                currentUser
        );

        return toPurchaseResponse(saved);
    }

    @Override
    public SupplierPurchaseResponse createPurchaseDirect(
            CreateSupplierPurchaseRequest request
    ) {
        Long targetSupplierId = request.supplierId();
        if (targetSupplierId == null) {
            SupplierProduct sp = supplierProductRepository
                    .findDetailedById(request.supplierProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Supplier product relationship was not found"
                    ));
            targetSupplierId = sp.getSupplier().getId();
        }
        return createPurchase(targetSupplierId, request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierPurchaseResponse> getPurchases(
            Long supplierId,
            PurchaseStatus status
    ) {
        getRequiredSupplier(supplierId);

        List<SupplierPurchase> purchases;

        if (status == null) {
            purchases = supplierPurchaseRepository
                    .findAllBySupplierIdOrderByOrderedAtDesc(
                            supplierId
                    );
        } else {
            purchases = supplierPurchaseRepository
                    .findAllBySupplierIdOrderByOrderedAtDesc(
                            supplierId
                    )
                    .stream()
                    .filter(item ->
                            item.getStatus() == status
                    )
                    .toList();
        }

        return purchases.stream()
                .map(this::toPurchaseResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierPurchaseResponse> getAllPurchases(
            Long supplierId,
            PurchaseStatus status
    ) {
        if (supplierId != null) {
            return getPurchases(supplierId, status);
        }

        List<SupplierPurchase> purchases;
        if (status == null) {
            purchases = supplierPurchaseRepository.findAllByOrderByOrderedAtDesc();
        } else {
            purchases = supplierPurchaseRepository.findAllByStatusOrderByOrderedAtDesc(status);
        }

        return purchases.stream()
                .map(this::toPurchaseResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierPurchaseResponse getPurchaseById(
            Long purchaseId
    ) {
        return toPurchaseResponse(
                getRequiredPurchase(purchaseId)
        );
    }

    @Override
    public SupplierPurchaseResponse receivePurchase(
            Long purchaseId,
            ReceiveSupplierPurchaseRequest request
    ) {
        SupplierPurchase purchase =
                getRequiredPurchase(purchaseId);

        if (purchase.getStatus()
                != PurchaseStatus.ORDERED) {
            throw new BadRequestException(
                    "Only ORDERED purchases can be received"
            );
        }

        if (!request.receivedQuantity().equals(
                purchase.getOrderedQuantity()
        )) {
            throw new BadRequestException(
                    "Received quantity must match ordered quantity. Ordered: "
                            + purchase.getOrderedQuantity()
            );
        }

        User currentUser = getCurrentUser();

        /*
         * Stock increase සහ inventory audit record.
         */
        inventoryTransactionService
                .recordSupplierPurchaseReceipt(
                        purchase.getSparePart().getId(),
                        request.receivedQuantity(),
                        purchase.getSupplier().getId(),
                        purchase.getSupplier()
                                .getSupplierCode(),
                        purchase.getId(),
                        purchase.getPurchaseNumber()
                );

        purchase.setReceivedQuantity(
                request.receivedQuantity()
        );
        String invoiceNumber = (request.supplierInvoiceNumber() != null && !request.supplierInvoiceNumber().isBlank())
                ? request.supplierInvoiceNumber().trim()
                : "INV-" + purchase.getPurchaseNumber();
        purchase.setSupplierInvoiceNumber(invoiceNumber);
        purchase.setStatus(PurchaseStatus.RECEIVED);
        purchase.setReceivedBy(currentUser);
        purchase.setReceivedAt(LocalDateTime.now());

        if (request.notes() != null
                && !request.notes().isBlank()) {
            purchase.setNotes(
                    request.notes().trim()
            );
        }

        SupplierPurchase saved =
                supplierPurchaseRepository.save(purchase);

        saveTransaction(
                saved,
                SupplierTransactionType.PURCHASE_RECEIVED,
                invoiceNumber,
                saved.getTotalAmount(),
                saved.getReceivedQuantity(),
                "Supplier purchase received and stock updated",
                currentUser
        );

        return toPurchaseResponse(saved);
    }

    @Override
    public SupplierPurchaseResponse cancelPurchase(
            Long purchaseId,
            CancelSupplierPurchaseRequest request
    ) {
        SupplierPurchase purchase =
                getRequiredPurchase(purchaseId);

        if (purchase.getStatus()
                != PurchaseStatus.ORDERED) {
            throw new BadRequestException(
                    "Only ORDERED purchases can be cancelled"
            );
        }

        User currentUser = getCurrentUser();

        purchase.setStatus(PurchaseStatus.CANCELLED);
        purchase.setNotes(
                "Cancelled: " + request.reason().trim()
        );

        SupplierPurchase saved =
                supplierPurchaseRepository.save(purchase);

        saveTransaction(
                saved,
                SupplierTransactionType.PURCHASE_CANCELLED,
                saved.getPurchaseNumber(),
                BigDecimal.ZERO,
                0,
                request.reason().trim(),
                currentUser
        );

        return toPurchaseResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierTransactionResponse>
    getSupplierTransactionHistory(
            Long supplierId,
            LocalDate startDate,
            LocalDate endDate,
            SupplierTransactionType type
    ) {
        getRequiredSupplier(supplierId);

        List<SupplierTransaction> transactions;

        if (startDate != null || endDate != null) {
            LocalDate resolvedEnd = endDate == null
                    ? LocalDate.now()
                    : endDate;

            LocalDate resolvedStart =
                    startDate == null
                            ? resolvedEnd.withDayOfMonth(1)
                            : startDate;

            if (resolvedStart.isAfter(resolvedEnd)) {
                throw new BadRequestException(
                        "Start date cannot be after end date"
                );
            }

            transactions =
                    supplierTransactionRepository
                            .findAllBySupplierIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                                    supplierId,
                                    resolvedStart.atStartOfDay(),
                                    resolvedEnd.atTime(
                                            LocalTime.MAX
                                    )
                            );
        } else if (type != null) {
            transactions =
                    supplierTransactionRepository
                            .findAllBySupplierIdAndTransactionTypeOrderByCreatedAtDesc(
                                    supplierId,
                                    type
                            );
        } else {
            transactions =
                    supplierTransactionRepository
                            .findAllBySupplierIdOrderByCreatedAtDesc(
                                    supplierId
                            );
        }

        if (type != null) {
            transactions = transactions.stream()
                    .filter(transaction ->
                            transaction.getTransactionType()
                                    == type
                    )
                    .toList();
        }

        return transactions.stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    private void saveTransaction(
            SupplierPurchase purchase,
            SupplierTransactionType type,
            String reference,
            BigDecimal amount,
            Integer quantity,
            String description,
            User currentUser
    ) {
        SupplierTransaction transaction =
                new SupplierTransaction();

        transaction.setSupplier(
                purchase.getSupplier()
        );
        transaction.setPurchase(purchase);
        transaction.setTransactionType(type);
        transaction.setReferenceNumber(reference);
        transaction.setAmount(money(amount));
        transaction.setQuantity(quantity);
        transaction.setDescription(description);
        transaction.setRecordedBy(currentUser);

        supplierTransactionRepository.save(
                transaction
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

    private SupplierPurchase getRequiredPurchase(
            Long purchaseId
    ) {
        return supplierPurchaseRepository
                .findDetailedById(purchaseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Supplier purchase was not found with ID: "
                                        + purchaseId
                        )
                );
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(
                authentication.getName()
        )) {
            throw new BadRequestException(
                    "Authenticated staff user is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user was not found"
                        )
                );
    }

    private String generatePurchaseNumber() {
        String date = LocalDateTime.now()
                .format(
                        DateTimeFormatter.ofPattern(
                                "yyyyMMdd"
                        )
                );

        String number;

        do {
            String random = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);

            number = "PO-" + date + "-" + random;

        } while (
                supplierPurchaseRepository
                        .existsByPurchaseNumber(number)
        );

        return number;
    }

    private SupplierPurchaseResponse toPurchaseResponse(
            SupplierPurchase purchase
    ) {
        return new SupplierPurchaseResponse(
                purchase.getId(),
                purchase.getPurchaseNumber(),

                purchase.getSupplier().getId(),
                purchase.getSupplier()
                        .getSupplierCode(),
                purchase.getSupplier()
                        .getCompanyName(),

                purchase.getSupplierProduct().getId(),
                purchase.getSparePart().getId(),
                purchase.getSparePart()
                        .getPartNumber(),
                purchase.getSparePart().getName(),

                purchase.getOrderedQuantity(),
                purchase.getReceivedQuantity(),

                money(purchase.getUnitPurchasePrice()),
                money(purchase.getTotalAmount()),

                purchase.getStatus(),
                purchase.getSupplierInvoiceNumber(),
                purchase.getExpectedDeliveryDate(),
                purchase.getNotes(),

                getUserName(purchase.getCreatedBy()),
                getUserName(purchase.getReceivedBy()),

                purchase.getOrderedAt(),
                purchase.getReceivedAt(),
                purchase.getUpdatedAt()
        );
    }

    private SupplierTransactionResponse
    toTransactionResponse(
            SupplierTransaction transaction
    ) {
        SupplierPurchase purchase =
                transaction.getPurchase();

        User recordedBy =
                transaction.getRecordedBy();

        return new SupplierTransactionResponse(
                transaction.getId(),

                transaction.getSupplier().getId(),
                transaction.getSupplier()
                        .getSupplierCode(),
                transaction.getSupplier()
                        .getCompanyName(),

                purchase == null
                        ? null
                        : purchase.getId(),

                purchase == null
                        ? null
                        : purchase.getPurchaseNumber(),

                transaction.getTransactionType(),
                transaction.getReferenceNumber(),
                money(transaction.getAmount()),
                transaction.getQuantity(),
                transaction.getDescription(),

                recordedBy == null
                        ? null
                        : recordedBy.getId(),

                getUserName(recordedBy),

                transaction.getCreatedAt()
        );
    }

    private String getUserName(User user) {
        if (user == null) {
            return null;
        }

        String fullName =
                user.getFullName() == null
                        ? ""
                        : user.getFullName().trim();

        return fullName.isBlank()
                ? user.getEmail()
                : fullName;
    }

    private String cleanText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
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