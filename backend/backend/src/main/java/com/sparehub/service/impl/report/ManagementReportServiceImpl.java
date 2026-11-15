package com.sparehub.service.impl.report;





import com.sparehub.dto.report.ManagementDashboardResponse;
import com.sparehub.dto.report.ManagementReportFilter;
import com.sparehub.dto.report.ManagementReportResponse;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.entity.order.Payment;
import com.sparehub.entity.report.ManagementReportType;
import com.sparehub.entity.supplier.Supplier;
import com.sparehub.entity.supplier.SupplierPurchase;
import com.sparehub.entity.supplier.SupplierTransaction;
import com.sparehub.exception.BadRequestException;
import com.sparehub.repository.SparePartRepository;
import com.sparehub.repository.order.CustomerOrderRepository;
import com.sparehub.repository.order.PaymentRepository;
import com.sparehub.repository.supplier.SupplierPurchaseRepository;
import com.sparehub.repository.supplier.SupplierRepository;
import com.sparehub.repository.supplier.SupplierTransactionRepository;
import com.sparehub.service.report.ManagementReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagementReportServiceImpl
        implements ManagementReportService {

    private final CustomerOrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final SparePartRepository sparePartRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierPurchaseRepository supplierPurchaseRepository;
    private final SupplierTransactionRepository supplierTransactionRepository;
    private final com.sparehub.service.supplier.SupplierPerformanceService supplierPerformanceService;
    private final com.sparehub.service.inventory.ReorderRecommendationService reorderRecommendationService;

    @Override
    public ManagementDashboardResponse getDashboardSummary(
            LocalDate startDate,
            LocalDate endDate
    ) {
        DateRange range = resolveDateRange(startDate, endDate);

        List<CustomerOrder> orders = orderRepository.findAll()
                .stream()
                .filter(order -> isWithinRange(
                        order.getCreatedAt(),
                        range
                ))
                .toList();

        List<Payment> payments = paymentRepository.findAll()
                .stream()
                .filter(payment -> isWithinRange(
                        getPaymentDate(payment),
                        range
                ))
                .toList();

        List<SparePart> spareParts =
                sparePartRepository.findAll();

        List<Supplier> suppliers =
                supplierRepository.findAll();

        List<SupplierPurchase> supplierPurchases =
                supplierPurchaseRepository.findAll()
                        .stream()
                        .filter(purchase -> isWithinRange(
                                purchase.getOrderedAt(),
                                range
                        ))
                        .toList();

        return new ManagementDashboardResponse(
                createSalesSummary(orders, payments),
                createOrderSummary(orders),
                createInventorySummary(spareParts),
                createSupplierSummary(
                        suppliers,
                        supplierPurchases
                ),
                createPaymentSummary(payments),
                LocalDateTime.now()
        );
    }

    @Override
    public ManagementReportResponse generateReport(
            ManagementReportFilter filter
    ) {
        if (filter == null || filter.reportType() == null) {
            throw new BadRequestException(
                    "Report type is required"
            );
        }

        DateRange range = resolveDateRange(
                filter.startDate(),
                filter.endDate()
        );

        return switch (filter.reportType()) {
            case SALES -> generateSalesReport(filter, range);
            case ORDERS -> generateOrderReport(filter, range);
            case INVENTORY ->
                    generateInventoryReport(filter, range);
            case SUPPLIERS ->
                    generateSupplierReport(filter, range);
            case PAYMENTS ->
                    generatePaymentReport(filter, range);
            case SUPPLIER_TRANSACTIONS ->
                    generateSupplierTransactionReport(
                            filter,
                            range
                    );
            case SUPPLIER_PERFORMANCE ->
                    generateSupplierPerformanceReport(
                            filter,
                            range
                    );
            case PROCUREMENT ->
                    generateProcurementReport(
                            filter,
                            range
                    );
            case REORDER_RECOMMENDATIONS ->
                    generateReorderRecommendationReport(
                            filter,
                            range
                    );
        };
    }

    @Override
    public byte[] exportReportAsCsv(
            ManagementReportFilter filter
    ) {
        ManagementReportResponse report =
                generateReport(filter);

        StringBuilder csv = new StringBuilder();

        if (report.records().isEmpty()) {
            csv.append("Message\n");
            csv.append("No records found\n");

            return csv.toString()
                    .getBytes(StandardCharsets.UTF_8);
        }

        List<String> headers = new ArrayList<>(
                report.records()
                        .get(0)
                        .keySet()
        );

        csv.append(
                String.join(",", headers)
        ).append("\n");

        for (Map<String, Object> record : report.records()) {
            for (int index = 0; index < headers.size(); index++) {
                Object value = record.get(headers.get(index));

                csv.append(
                        escapeCsvValue(value)
                );

                if (index < headers.size() - 1) {
                    csv.append(",");
                }
            }

            csv.append("\n");
        }

        return csv.toString()
                .getBytes(StandardCharsets.UTF_8);
    }

    /*
     * DASHBOARD SUMMARY METHODS
     */

    private ManagementDashboardResponse.SalesSummary
    createSalesSummary(
            List<CustomerOrder> orders,
            List<Payment> payments
    ) {
        long completedSales = orders.stream()
                .filter(order ->
                        statusEquals(
                                order.getOrderStatus(),
                                "COMPLETED"
                        ))
                .count();

        BigDecimal grossSales = orders.stream()
                .filter(order ->
                        statusEquals(
                                order.getOrderStatus(),
                                "COMPLETED"
                        ))
                .map(this::getOrderTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discounts = orders.stream()
                .filter(order ->
                        statusEquals(
                                order.getOrderStatus(),
                                "COMPLETED"
                        ))
                .map(this::getOrderDiscount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal refunds = payments.stream()
                .filter(payment ->
                        statusEquals(
                                payment.getStatus(),
                                "REFUNDED"
                        ))
                .map(this::getPaymentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSales = grossSales
                .subtract(refunds)
                .max(BigDecimal.ZERO);

        return new ManagementDashboardResponse.SalesSummary(
                completedSales,
                money(grossSales),
                money(discounts),
                money(refunds),
                money(netSales)
        );
    }

    private ManagementDashboardResponse.OrderSummary
    createOrderSummary(List<CustomerOrder> orders) {
        return new ManagementDashboardResponse.OrderSummary(
                orders.size(),
                countOrderStatus(orders, "PENDING"),
                countOrderStatus(orders, "CONFIRMED"),
                countOrderStatus(orders, "COMPLETED"),
                countOrderStatus(orders, "CANCELLED")
        );
    }

    private ManagementDashboardResponse.InventorySummary
    createInventorySummary(List<SparePart> spareParts) {
        long activeProducts = spareParts.stream()
                .filter(part ->
                        statusEquals(part.getStatus(), "ACTIVE"))
                .count();

        long inactiveProducts = spareParts.size()
                - activeProducts;

        long lowStockProducts = spareParts.stream()
                .filter(part ->
                        safeInteger(part.getStockQuantity())
                                <= safeInteger(part.getReorderLevel()))
                .count();

        long outOfStockProducts = spareParts.stream()
                .filter(part ->
                        safeInteger(part.getStockQuantity()) == 0)
                .count();

        long totalStockUnits = spareParts.stream()
                .mapToLong(part ->
                        safeInteger(part.getStockQuantity()))
                .sum();

        BigDecimal estimatedStockValue = spareParts.stream()
                .map(part ->
                        safeBigDecimal(part.getSellingPrice())
                                .multiply(
                                        BigDecimal.valueOf(
                                                safeInteger(
                                                        part.getStockQuantity()
                                                )
                                        )
                                )
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ManagementDashboardResponse.InventorySummary(
                spareParts.size(),
                activeProducts,
                inactiveProducts,
                lowStockProducts,
                outOfStockProducts,
                totalStockUnits,
                money(estimatedStockValue)
        );
    }

    private ManagementDashboardResponse.SupplierSummary
    createSupplierSummary(
            List<Supplier> suppliers,
            List<SupplierPurchase> purchases
    ) {
        long activeSuppliers = suppliers.stream()
                .filter(this::isSupplierActive)
                .count();

        return new ManagementDashboardResponse.SupplierSummary(
                suppliers.size(),
                activeSuppliers,
                suppliers.size() - activeSuppliers,
                countSupplierPurchaseStatus(
                        purchases,
                        "ORDERED"
                ),
                countSupplierPurchaseStatus(
                        purchases,
                        "RECEIVED"
                ),
                countSupplierPurchaseStatus(
                        purchases,
                        "CANCELLED"
                )
        );
    }

    private ManagementDashboardResponse.PaymentSummary
    createPaymentSummary(List<Payment> payments) {
        BigDecimal totalReceivedAmount = payments.stream()
                .filter(payment ->
                        statusEquals(
                                payment.getStatus(),
                                "COMPLETED"
                        ))
                .map(this::getPaymentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ManagementDashboardResponse.PaymentSummary(
                countPaymentStatus(payments, "COMPLETED"),
                countPaymentStatus(payments, "PENDING"),
                countPaymentStatus(payments, "FAILED"),
                countPaymentStatus(payments, "REFUNDED"),
                money(totalReceivedAmount)
        );
    }

    /*
     * SALES REPORT
     */

    private ManagementReportResponse generateSalesReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                orderRepository.findAll()
                        .stream()
                        .filter(order ->
                                isWithinRange(
                                        order.getCreatedAt(),
                                        range
                                ))
                        .filter(order ->
                                statusEquals(
                                        order.getOrderStatus(),
                                        "COMPLETED"
                                ))
                        .map(order -> {
                            Map<String, Object> row =
                                    new LinkedHashMap<>();

                            row.put("orderId", order.getId());
                            row.put(
                                    "orderNumber",
                                    order.getOrderNumber()
                            );
                            row.put(
                                    "customer",
                                    getCustomerName(order)
                            );
                            row.put(
                                    "subtotal",
                                    getOrderSubtotal(order)
                            );
                            row.put(
                                    "discount",
                                    getOrderDiscount(order)
                            );
                            row.put(
                                    "totalAmount",
                                    getOrderTotal(order)
                            );
                            row.put(
                                    "status",
                                    order.getOrderStatus()
                            );
                            row.put(
                                    "createdAt",
                                    order.getCreatedAt()
                            );

                            return row;
                        })
                        .toList();

        BigDecimal totalAmount = sumRecordAmounts(
                records,
                "totalAmount"
        );

        return createReportResponse(
                filter,
                range,
                records,
                totalAmount
        );
    }

    /*
     * ORDER REPORT
     */

    private ManagementReportResponse generateOrderReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                orderRepository.findAll()
                        .stream()
                        .filter(order ->
                                isWithinRange(
                                        order.getCreatedAt(),
                                        range
                                ))
                        .filter(order ->
                                filter.orderStatus() == null
                                        || filter.orderStatus().isBlank()
                                        || statusEquals(
                                        order.getOrderStatus(),
                                        filter.orderStatus()
                                ))
                        .map(order -> {
                            Map<String, Object> row =
                                    new LinkedHashMap<>();

                            row.put("orderId", order.getId());
                            row.put(
                                    "orderNumber",
                                    order.getOrderNumber()
                            );
                            row.put(
                                    "customer",
                                    getCustomerName(order)
                            );
                            row.put(
                                    "status",
                                    order.getOrderStatus()
                            );
                            row.put(
                                    "paymentStatus",
                                    order.getPaymentStatus()
                            );
                            row.put(
                                    "totalAmount",
                                    getOrderTotal(order)
                            );
                            row.put(
                                    "createdAt",
                                    order.getCreatedAt()
                            );

                            return row;
                        })
                        .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "totalAmount")
        );
    }

    /*
     * INVENTORY REPORT
     */

    private ManagementReportResponse generateInventoryReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                sparePartRepository.findAll()
                        .stream()
                        .filter(part ->
                                filter.productId() == null
                                        || part.getId().equals(
                                        filter.productId()
                                ))
                        .map(part -> {
                            Map<String, Object> row =
                                    new LinkedHashMap<>();

                            row.put("productId", part.getId());
                            row.put(
                                    "partNumber",
                                    part.getPartNumber()
                            );
                            row.put("name", part.getName());
                            row.put(
                                    "category",
                                    part.getCategory() != null
                                            ? part.getCategory().getName()
                                            : ""
                            );
                            row.put(
                                    "stockQuantity",
                                    part.getStockQuantity()
                            );
                            row.put(
                                    "reorderLevel",
                                    part.getReorderLevel()
                            );
                            row.put("price", part.getSellingPrice());
                            row.put("status", part.getStatus());

                            row.put(
                                    "stockValue",
                                    safeBigDecimal(part.getSellingPrice())
                                            .multiply(
                                                    BigDecimal.valueOf(
                                                            safeInteger(
                                                                    part.getStockQuantity()
                                                            )
                                                    )
                                            )
                            );

                            return row;
                        })
                        .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "stockValue")
        );
    }

    /*
     * SUPPLIER REPORT
     */

    private ManagementReportResponse generateSupplierReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                supplierRepository.findAll()
                        .stream()
                        .filter(supplier ->
                                filter.supplierId() == null
                                        || supplier.getId().equals(
                                        filter.supplierId()
                                ))
                        .map(supplier -> {
                            Map<String, Object> row =
                                    new LinkedHashMap<>();

                            row.put(
                                    "supplierId",
                                    supplier.getId()
                            );
                            row.put(
                                    "supplierCode",
                                    supplier.getSupplierCode()
                            );
                            row.put(
                                    "supplierName",
                                    getSupplierName(supplier)
                            );
                            row.put(
                                    "companyName",
                                    supplier.getCompanyName()
                            );
                            row.put(
                                    "contactNumber",
                                    supplier.getContactNumber()
                            );
                            row.put(
                                    "email",
                                    supplier.getEmail()
                            );
                            row.put(
                                    "active",
                                    isSupplierActive(supplier)
                            );

                            return row;
                        })
                        .toList();

        return createReportResponse(
                filter,
                range,
                records,
                BigDecimal.ZERO
        );
    }

    /*
     * PAYMENT REPORT
     */

    private ManagementReportResponse generatePaymentReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                paymentRepository.findAll()
                        .stream()
                        .filter(payment ->
                                isWithinRange(
                                        getPaymentDate(payment),
                                        range
                                ))
                        .filter(payment ->
                                filter.paymentStatus() == null
                                        || filter.paymentStatus().isBlank()
                                        || statusEquals(
                                        payment.getStatus(),
                                        filter.paymentStatus()
                                ))
                        .map(payment -> {
                            Map<String, Object> row =
                                    new LinkedHashMap<>();

                            row.put(
                                    "paymentId",
                                    payment.getId()
                            );
                            row.put(
                                    "referenceNumber",
                                    payment.getPaymentReference()
                            );
                            row.put(
                                    "orderNumber",
                                    payment.getOrder() != null
                                            ? payment.getOrder()
                                            .getOrderNumber()
                                            : ""
                            );
                            row.put(
                                    "amount",
                                    getPaymentAmount(payment)
                            );
                            row.put(
                                    "paymentMethod",
                                    payment.getPaymentMethod()
                            );
                            row.put(
                                    "status",
                                    payment.getStatus()
                            );
                            row.put(
                                    "paidAt",
                                    getPaymentDate(payment)
                            );

                            return row;
                        })
                        .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "amount")
        );
    }

    /*
     * SUPPLIER TRANSACTION REPORT
     */

    private ManagementReportResponse
    generateSupplierTransactionReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                supplierTransactionRepository.findAll()
                        .stream()
                        .filter(transaction ->
                                isWithinRange(
                                        transaction.getCreatedAt(),
                                        range
                                ))
                        .filter(transaction ->
                                filter.supplierId() == null
                                        || (
                                        transaction.getSupplier() != null
                                                && transaction.getSupplier()
                                                .getId()
                                                .equals(
                                                        filter.supplierId()
                                                )
                                ))
                        .filter(transaction ->
                                filter.transactionType() == null
                                        || filter.transactionType()
                                        .isBlank()
                                        || statusEquals(
                                        transaction
                                                .getTransactionType(),
                                        filter.transactionType()
                                ))
                        .map(transaction ->
                                mapSupplierTransaction(transaction))
                        .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "amount")
        );
    }

    private Map<String, Object> mapSupplierTransaction(
            SupplierTransaction transaction
    ) {
        Map<String, Object> row = new LinkedHashMap<>();

        row.put(
                "transactionId",
                transaction.getId()
        );

        row.put(
                "supplierCode",
                transaction.getSupplier() != null
                        ? transaction.getSupplier()
                        .getSupplierCode()
                        : ""
        );

        row.put(
                "supplierName",
                transaction.getSupplier() != null
                        ? getSupplierName(
                        transaction.getSupplier()
                )
                        : ""
        );

        row.put(
                "transactionType",
                transaction.getTransactionType()
        );

        row.put(
                "referenceNumber",
                transaction.getReferenceNumber()
        );

        row.put(
                "quantity",
                transaction.getQuantity()
        );

        row.put(
                "amount",
                safeBigDecimal(transaction.getAmount())
        );

        row.put(
                "description",
                transaction.getDescription()
        );

        row.put(
                "createdAt",
                transaction.getCreatedAt()
        );

        return row;
    }

    /*
     * COMMON HELPER METHODS
     */

    private ManagementReportResponse createReportResponse(
            ManagementReportFilter filter,
            DateRange range,
            List<Map<String, Object>> records,
            BigDecimal totalAmount
    ) {
        return new ManagementReportResponse(
                filter.reportType(),
                range.startDate(),
                range.endDate(),
                filter.productId(),
                filter.supplierId(),
                filter.transactionType(),
                records.size(),
                money(totalAmount),
                records,
                LocalDateTime.now()
        );
    }

    private DateRange resolveDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDate resolvedEnd =
                endDate != null ? endDate : LocalDate.now();

        LocalDate resolvedStart =
                startDate != null
                        ? startDate
                        : resolvedEnd.minusYears(1);

        if (resolvedStart.isAfter(resolvedEnd)) {
            throw new BadRequestException(
                    "Start date cannot be after end date"
            );
        }

        return new DateRange(
                resolvedStart,
                resolvedEnd,
                resolvedStart.atStartOfDay(),
                resolvedEnd.plusDays(1)
                        .atStartOfDay()
                        .minusNanos(1)
        );
    }

    private boolean isWithinRange(
            LocalDateTime date,
            DateRange range
    ) {
        if (date == null) {
            return false;
        }

        return !date.isBefore(range.startDateTime())
                && !date.isAfter(range.endDateTime());
    }

    private boolean statusEquals(
            Object status,
            String expectedStatus
    ) {
        return status != null
                && expectedStatus != null
                && status.toString()
                .equalsIgnoreCase(expectedStatus);
    }

    private long countOrderStatus(
            List<CustomerOrder> orders,
            String status
    ) {
        return orders.stream()
                .filter(order ->
                        statusEquals(order.getOrderStatus(), status))
                .count();
    }

    private long countPaymentStatus(
            List<Payment> payments,
            String status
    ) {
        return payments.stream()
                .filter(payment ->
                        statusEquals(payment.getStatus(), status))
                .count();
    }

    private long countSupplierPurchaseStatus(
            List<SupplierPurchase> purchases,
            String status
    ) {
        return purchases.stream()
                .filter(purchase ->
                        statusEquals(purchase.getStatus(), status))
                .count();
    }

    private BigDecimal sumRecordAmounts(
            List<Map<String, Object>> records,
            String fieldName
    ) {
        return records.stream()
                .map(record -> record.get(fieldName))
                .map(this::convertToBigDecimal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal convertToBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value instanceof BigDecimal decimal) {
            return decimal;
        }

        return new BigDecimal(value.toString());
    }

    private String escapeCsvValue(Object value) {
        if (value == null) {
            return "";
        }

        String text = value.toString()
                .replace("\"", "\"\"");

        return "\"" + text + "\"";
    }

    private BigDecimal money(BigDecimal value) {
        return safeBigDecimal(value)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal safeBigDecimal(
            BigDecimal value
    ) {
        return value != null
                ? value
                : BigDecimal.ZERO;
    }

    private int safeInteger(Integer value) {
        return value != null ? value : 0;
    }

    /*
     * Change only these compatibility methods if the field
     * names of your existing entities are different.
     */

    private BigDecimal getOrderTotal(CustomerOrder order) {
        return safeBigDecimal(order.getTotalAmount());
    }

    private BigDecimal getOrderSubtotal(CustomerOrder order) {
        return safeBigDecimal(order.getSubtotal());
    }

    private BigDecimal getOrderDiscount(CustomerOrder order) {
        return safeBigDecimal(order.getDiscountAmount());
    }

    private String getCustomerName(CustomerOrder order) {
        if (order.getCustomer() == null) {
            return "";
        }

        return order.getCustomer().getFullName();
    }

    private BigDecimal getPaymentAmount(Payment payment) {
        return safeBigDecimal(payment.getAmount());
    }

    private LocalDateTime getPaymentDate(Payment payment) {
        return payment.getPaidAt() != null
                ? payment.getPaidAt()
                : payment.getCreatedAt();
    }

    private boolean isSupplierActive(Supplier supplier) {
        return Boolean.TRUE.equals(supplier.getActive());
    }

    private String getSupplierName(Supplier supplier) {
        return supplier.getCompanyName();
    }

    /*
     * PROCUREMENT / PURCHASE REPORT
     */
    private ManagementReportResponse generateProcurementReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        List<Map<String, Object>> records =
                supplierPurchaseRepository.findAll()
                        .stream()
                        .filter(purchase -> isWithinRange(
                                purchase.getOrderedAt(),
                                range
                        ))
                        .filter(purchase ->
                                filter.supplierId() == null
                                        || (purchase.getSupplier() != null
                                        && purchase.getSupplier().getId().equals(filter.supplierId())))
                        .filter(purchase ->
                                filter.productId() == null
                                        || (purchase.getSparePart() != null
                                        && purchase.getSparePart().getId().equals(filter.productId())))
                        .filter(purchase ->
                                filter.orderStatus() == null
                                        || filter.orderStatus().isBlank()
                                        || statusEquals(purchase.getStatus(), filter.orderStatus()))
                        .map(purchase -> {
                            Map<String, Object> row = new LinkedHashMap<>();
                            row.put("purchaseId", purchase.getId());
                            row.put("purchaseNumber", purchase.getPurchaseNumber());
                            row.put("orderedAt", purchase.getOrderedAt());
                            row.put("supplierCode", purchase.getSupplier() != null ? purchase.getSupplier().getSupplierCode() : "");
                            row.put("supplierName", purchase.getSupplier() != null ? getSupplierName(purchase.getSupplier()) : "");
                            row.put("partNumber", purchase.getSparePart() != null ? purchase.getSparePart().getPartNumber() : "");
                            row.put("productName", purchase.getSparePart() != null ? purchase.getSparePart().getName() : "");
                            row.put("orderedQuantity", purchase.getOrderedQuantity());
                            row.put("receivedQuantity", purchase.getReceivedQuantity() == null ? 0 : purchase.getReceivedQuantity());
                            int pendingQty = Math.max(0, (purchase.getOrderedQuantity() == null ? 0 : purchase.getOrderedQuantity())
                                    - (purchase.getReceivedQuantity() == null ? 0 : purchase.getReceivedQuantity()));
                            row.put("pendingQuantity", pendingQty);
                            row.put("unitPrice", purchase.getUnitPurchasePrice());
                            row.put("totalAmount", purchase.getTotalAmount());
                            row.put("status", purchase.getStatus());
                            row.put("expectedDeliveryDate", purchase.getExpectedDeliveryDate());
                            row.put("receivedAt", purchase.getReceivedAt());
                            row.put("invoiceNumber", purchase.getSupplierInvoiceNumber() != null ? purchase.getSupplierInvoiceNumber() : "");
                            return row;
                        })
                        .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "totalAmount")
        );
    }

    /*
     * SUPPLIER PERFORMANCE REPORT
     */
    private ManagementReportResponse generateSupplierPerformanceReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        var rankingResponse = supplierPerformanceService.getAllSupplierPerformance(
                range.startDate(),
                range.endDate()
        );

        List<Map<String, Object>> records = rankingResponse.suppliers()
                .stream()
                .filter(perf -> filter.supplierId() == null || perf.supplierId().equals(filter.supplierId()))
                .map(perf -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("supplierId", perf.supplierId());
                    row.put("supplierCode", perf.supplierCode());
                    row.put("supplierName", perf.supplierName());
                    row.put("companyName", perf.companyName());
                    row.put("totalOrders", perf.totalPurchaseOrders());
                    row.put("completedOrders", perf.receivedOrders());
                    row.put("pendingOrders", perf.pendingOrders());
                    row.put("cancelledOrders", perf.cancelledOrders());
                    row.put("totalProcurementValue", perf.totalReceivedPurchaseValue() != null ? perf.totalReceivedPurchaseValue() : BigDecimal.ZERO);
                    row.put("onTimeDeliveryRate", perf.onTimeDeliveryRate() != null ? perf.onTimeDeliveryRate() + "%" : "0%");
                    row.put("completionRate", perf.completionRate() != null ? perf.completionRate() + "%" : "0%");
                    row.put("cancellationRate", perf.cancellationRate() != null ? perf.cancellationRate() + "%" : "0%");
                    row.put("averageDeliveryDays", perf.averageDeliveryDays());
                    row.put("performanceScore", perf.performanceScore());
                    row.put("rating", perf.performanceRating() != null ? perf.performanceRating().name() : "UNRATED");
                    return row;
                })
                .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "totalProcurementValue")
        );
    }

    /*
     * REORDER RECOMMENDATION REPORT
     */
    private ManagementReportResponse generateReorderRecommendationReport(
            ManagementReportFilter filter,
            DateRange range
    ) {
        var summary = reorderRecommendationService.getReorderRecommendations(true);

        List<Map<String, Object>> records = summary.recommendations()
                .stream()
                .filter(rec -> filter.productId() == null || rec.sparePartId().equals(filter.productId()))
                .filter(rec -> filter.supplierId() == null || (rec.preferredSupplierId() != null && rec.preferredSupplierId().equals(filter.supplierId())))
                .map(rec -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("partId", rec.sparePartId());
                    row.put("partNumber", rec.partNumber());
                    row.put("name", rec.sparePartName());
                    row.put("category", rec.categoryName());
                    row.put("brand", rec.brand());
                    row.put("currentStock", rec.currentStock());
                    row.put("reorderLevel", rec.reorderLevel());
                    row.put("shortage", rec.netShortage());
                    row.put("pendingOrders", rec.pendingOrderedQuantity());
                    row.put("effectiveStock", rec.effectiveStock());
                    row.put("suggestedQuantity", rec.suggestedOrderQuantity());
                    row.put("preferredSupplier", rec.preferredSupplierName() != null ? rec.preferredSupplierName() : "None");
                    row.put("unitPrice", rec.unitPurchasePrice() != null ? rec.unitPurchasePrice() : BigDecimal.ZERO);
                    row.put("estimatedCost", rec.estimatedTotalCost() != null ? rec.estimatedTotalCost() : BigDecimal.ZERO);
                    row.put("urgency", rec.urgencyStatus());
                    row.put("reason", rec.recommendationReason());
                    return row;
                })
                .toList();

        return createReportResponse(
                filter,
                range,
                records,
                sumRecordAmounts(records, "estimatedCost")
        );
    }

    private record DateRange(
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    ) {
    }
}

