package com.sparehub.service.impl.order;



import com.sparehub.exception.BadRequestException;
import com.sparehub.dto.response.order.*;
import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.entity.order.OrderItem;
import com.sparehub.entity.order.Payment;
import com.sparehub.entity.order.Refund;
import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentMethod;
import com.sparehub.enums.order.PaymentStatus;
import com.sparehub.repository.order.CustomerOrderRepository;
import com.sparehub.repository.order.PaymentRepository;
import com.sparehub.repository.order.RefundRepository;
import com.sparehub.service.order.ManagerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerReportServiceImpl
        implements ManagerReportService {

    private final CustomerOrderRepository
            customerOrderRepository;

    private final PaymentRepository paymentRepository;

    private final RefundRepository refundRepository;

    @Override
    public SalesReportResponse generateSalesReport(
            LocalDate startDate,
            LocalDate endDate
    ) {
        DateRange dateRange =
                resolveDateRange(startDate, endDate);

        List<CustomerOrder> orders =
                customerOrderRepository
                        .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                dateRange.startDateTime(),
                                dateRange.endDateTime()
                        );

        Map<String, Long> ordersByStatus =
                createOrderStatusSummary(orders);

        List<CustomerOrder> completedOrders = orders
                .stream()
                .filter(order ->
                        order.getOrderStatus()
                                == OrderStatus.COMPLETED
                )
                .toList();

        long cancelledOrders = orders.stream()
                .filter(order ->
                        order.getOrderStatus()
                                == OrderStatus.CANCELLED
                )
                .count();

        long pendingOrders = orders.stream()
                .filter(order ->
                        order.getOrderStatus()
                                == OrderStatus.PENDING
                                || order.getOrderStatus()
                                == OrderStatus.CONFIRMED
                                || order.getOrderStatus()
                                == OrderStatus.PROCESSING
                                || order.getOrderStatus()
                                == OrderStatus.READY
                                || order.getOrderStatus()
                                == OrderStatus.CANCELLATION_REQUESTED
                )
                .count();

        BigDecimal grossSales = completedOrders.stream()
                .map(CustomerOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscounts = completedOrders.stream()
                .map(CustomerOrder::getDiscountAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalUnitsSold = completedOrders.stream()
                .flatMap(order ->
                        order.getItems().stream()
                )
                .mapToInt(OrderItem::getQuantity)
                .sum();

        BigDecimal averageOrderValue;

        if (completedOrders.isEmpty()) {
            averageOrderValue = money(BigDecimal.ZERO);
        } else {
            averageOrderValue = grossSales.divide(
                    BigDecimal.valueOf(
                            completedOrders.size()
                    ),
                    2,
                    RoundingMode.HALF_UP
            );
        }

        List<ProductSalesSummary> productSales =
                createProductSalesSummary(completedOrders);

        return new SalesReportResponse(
                dateRange.startDate(),
                dateRange.endDate(),

                (long) orders.size(),
                (long) completedOrders.size(),
                cancelledOrders,
                pendingOrders,

                totalUnitsSold,

                money(grossSales),
                money(totalDiscounts),
                money(averageOrderValue),

                ordersByStatus,
                productSales
        );
    }

    @Override
    public PaymentReportResponse generatePaymentReport(
            LocalDate startDate,
            LocalDate endDate
    ) {
        DateRange dateRange =
                resolveDateRange(startDate, endDate);

        List<Payment> payments = paymentRepository
                .findAllByPaidAtBetweenOrderByPaidAtDesc(
                        dateRange.startDateTime(),
                        dateRange.endDateTime()
                );

        List<Refund> refunds = refundRepository
                .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                        dateRange.startDateTime(),
                        dateRange.endDateTime()
                );

        long successfulPaymentRecords = payments.stream()
                .filter(payment ->
                        payment.getStatus()
                                == PaymentStatus.PAID
                                || payment.getStatus()
                                == PaymentStatus.REFUNDED
                )
                .count();

        long refundedPaymentRecords = payments.stream()
                .filter(payment ->
                        payment.getStatus()
                                == PaymentStatus.REFUNDED
                )
                .count();

        /*
         * REFUNDED payment එකත් මුලින් ලැබුණු payment එකක්.
         * ඒ නිසා gross collection එකට PAID සහ REFUNDED දෙකම ඇතුළත්.
         */
        BigDecimal grossCollectedAmount = payments.stream()
                .filter(payment ->
                        payment.getStatus()
                                == PaymentStatus.PAID
                                || payment.getStatus()
                                == PaymentStatus.REFUNDED
                )
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal refundedAmount = refunds.stream()
                .map(Refund::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netCollectedAmount =
                grossCollectedAmount.subtract(
                        refundedAmount
                );

        Map<String, Long> paymentsByStatus =
                createPaymentStatusSummary(payments);

        List<PaymentMethodSummary> paymentsByMethod =
                createPaymentMethodSummary(payments);

        return new PaymentReportResponse(
                dateRange.startDate(),
                dateRange.endDate(),

                (long) payments.size(),
                successfulPaymentRecords,
                refundedPaymentRecords,

                money(grossCollectedAmount),
                money(refundedAmount),
                money(netCollectedAmount),

                paymentsByStatus,
                paymentsByMethod
        );
    }

    private Map<String, Long> createOrderStatusSummary(
            List<CustomerOrder> orders
    ) {
        Map<String, Long> summary =
                new LinkedHashMap<>();

        for (OrderStatus status : OrderStatus.values()) {
            long count = orders.stream()
                    .filter(order ->
                            order.getOrderStatus() == status
                    )
                    .count();

            summary.put(status.name(), count);
        }

        return summary;
    }

    private Map<String, Long> createPaymentStatusSummary(
            List<Payment> payments
    ) {
        Map<String, Long> summary =
                new LinkedHashMap<>();

        for (PaymentStatus status :
                PaymentStatus.values()) {
            long count = payments.stream()
                    .filter(payment ->
                            payment.getStatus() == status
                    )
                    .count();

            summary.put(status.name(), count);
        }

        return summary;
    }

    private List<PaymentMethodSummary>
    createPaymentMethodSummary(
            List<Payment> payments
    ) {
        List<PaymentMethodSummary> result =
                new ArrayList<>();

        for (PaymentMethod method :
                PaymentMethod.values()) {

            List<Payment> methodPayments = payments.stream()
                    .filter(payment ->
                            payment.getPaymentMethod() == method
                    )
                    .filter(payment ->
                            payment.getStatus()
                                    == PaymentStatus.PAID
                                    || payment.getStatus()
                                    == PaymentStatus.REFUNDED
                    )
                    .toList();

            BigDecimal amount = methodPayments.stream()
                    .map(Payment::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(
                            BigDecimal.ZERO,
                            BigDecimal::add
                    );

            result.add(
                    new PaymentMethodSummary(
                            method,
                            (long) methodPayments.size(),
                            money(amount)
                    )
            );
        }

        return result;
    }

    private List<ProductSalesSummary>
    createProductSalesSummary(
            List<CustomerOrder> completedOrders
    ) {
        Map<Long, ProductAccumulator> accumulatorMap =
                new HashMap<>();

        for (CustomerOrder order : completedOrders) {
            for (OrderItem item : order.getItems()) {
                Long sparePartId =
                        item.getSparePart().getId();

                ProductAccumulator accumulator =
                        accumulatorMap.computeIfAbsent(
                                sparePartId,
                                ignored ->
                                        new ProductAccumulator(
                                                sparePartId,
                                                item.getPartNumber(),
                                                item.getProductName()
                                        )
                        );

                accumulator.add(
                        item.getQuantity(),
                        item.getSubtotal()
                );
            }
        }

        return accumulatorMap.values()
                .stream()
                .map(accumulator ->
                        new ProductSalesSummary(
                                accumulator.sparePartId,
                                accumulator.partNumber,
                                accumulator.productName,
                                accumulator.quantitySold,
                                money(accumulator.salesAmount)
                        )
                )
                .sorted(
                        Comparator.comparing(
                                ProductSalesSummary::salesAmount
                        ).reversed()
                )
                .toList();
    }

    private DateRange resolveDateRange(
            LocalDate requestedStartDate,
            LocalDate requestedEndDate
    ) {
        LocalDate endDate = requestedEndDate == null
                ? LocalDate.now()
                : requestedEndDate;

        LocalDate startDate = requestedStartDate == null
                ? endDate.withDayOfMonth(1)
                : requestedStartDate;

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException(
                    "Start date cannot be after end date"
            );
        }

        if (startDate.plusYears(5).isBefore(endDate)) {
            throw new BadRequestException(
                    "Report date range cannot exceed five years"
            );
        }

        return new DateRange(
                startDate,
                endDate,
                startDate.atStartOfDay(),
                endDate.atTime(LocalTime.MAX)
        );
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

    private record DateRange(
            LocalDate startDate,
            LocalDate endDate,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    ) {
    }

    private static class ProductAccumulator {

        private final Long sparePartId;
        private final String partNumber;
        private final String productName;

        private Integer quantitySold = 0;

        private BigDecimal salesAmount =
                BigDecimal.ZERO;

        private ProductAccumulator(
                Long sparePartId,
                String partNumber,
                String productName
        ) {
            this.sparePartId = sparePartId;
            this.partNumber = partNumber;
            this.productName = productName;
        }

        private void add(
                Integer quantity,
                BigDecimal amount
        ) {
            if (quantity != null) {
                quantitySold += quantity;
            }

            if (amount != null) {
                salesAmount =
                        salesAmount.add(amount);
            }
        }
    }
}
