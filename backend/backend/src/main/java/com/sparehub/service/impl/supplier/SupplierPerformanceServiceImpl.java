package com.sparehub.service.impl.supplier;



import com.sparehub.dto.response.SupplierPerformanceRankingResponse;
import com.sparehub.dto.response.SupplierPerformanceResponse;
import com.sparehub.entity.supplier.PurchaseStatus;
import com.sparehub.entity.supplier.Supplier;
import com.sparehub.entity.supplier.SupplierPerformanceRating;
import com.sparehub.entity.supplier.SupplierPurchase;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.supplier.SupplierProductRepository;
import com.sparehub.repository.supplier.SupplierPurchaseRepository;
import com.sparehub.repository.supplier.SupplierRepository;
import com.sparehub.service.supplier.SupplierPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierPerformanceServiceImpl
        implements SupplierPerformanceService {

    private final SupplierRepository supplierRepository;
    private final SupplierPurchaseRepository supplierPurchaseRepository;
    private final SupplierProductRepository supplierProductRepository;

    @Override
    public SupplierPerformanceResponse getSupplierPerformance(
            Long supplierId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Supplier not found with ID: " + supplierId
                ));

        DateRange dateRange = resolveDateRange(startDate, endDate);

        List<SupplierPurchase> purchases =
                supplierPurchaseRepository
                        .findAllBySupplierIdAndOrderedAtBetweenOrderByOrderedAtDesc(
                                supplierId,
                                dateRange.startDateTime(),
                                dateRange.endDateTime()
                        );

        return calculatePerformance(
                supplier,
                purchases,
                dateRange.startDate(),
                dateRange.endDate()
        );
    }

    @Override
    public SupplierPerformanceRankingResponse getAllSupplierPerformance(
            LocalDate startDate,
            LocalDate endDate
    ) {
        DateRange dateRange = resolveDateRange(startDate, endDate);

        List<Supplier> suppliers = supplierRepository.findAll();

        List<SupplierPerformanceResponse> performances = suppliers.stream()
                .map(supplier -> {
                    List<SupplierPurchase> purchases =
                            supplierPurchaseRepository
                                    .findAllBySupplierIdAndOrderedAtBetweenOrderByOrderedAtDesc(
                                            supplier.getId(),
                                            dateRange.startDateTime(),
                                            dateRange.endDateTime()
                                    );

                    return calculatePerformance(
                            supplier,
                            purchases,
                            dateRange.startDate(),
                            dateRange.endDate()
                    );
                })
                .sorted(
                        Comparator.comparing(
                                SupplierPerformanceResponse::performanceScore
                        ).reversed()
                )
                .toList();

        return new SupplierPerformanceRankingResponse(
                performances.size(),
                performances
        );
    }

    private SupplierPerformanceResponse calculatePerformance(
            Supplier supplier,
            List<SupplierPurchase> purchases,
            LocalDate startDate,
            LocalDate endDate
    ) {
        long totalOrders = purchases.size();

        long receivedOrders = purchases.stream()
                .filter(purchase ->
                        purchase.getStatus() == PurchaseStatus.RECEIVED)
                .count();

        long cancelledOrders = purchases.stream()
                .filter(purchase ->
                        purchase.getStatus() == PurchaseStatus.CANCELLED)
                .count();

        long pendingOrders = purchases.stream()
                .filter(purchase ->
                        purchase.getStatus() == PurchaseStatus.ORDERED)
                .count();

        List<SupplierPurchase> receivedWithExpectedDate = purchases.stream()
                .filter(purchase ->
                        purchase.getStatus() == PurchaseStatus.RECEIVED)
                .filter(purchase ->
                        purchase.getReceivedAt() != null)
                .filter(purchase ->
                        purchase.getExpectedDeliveryDate() != null)
                .toList();

        long deliveriesWithExpectedDate =
                receivedWithExpectedDate.size();

        long onTimeDeliveries = receivedWithExpectedDate.stream()
                .filter(this::isDeliveredOnTime)
                .count();

        long lateDeliveries =
                deliveriesWithExpectedDate - onTimeDeliveries;

        BigDecimal onTimeDeliveryRate = calculatePercentage(
                onTimeDeliveries,
                deliveriesWithExpectedDate
        );

        BigDecimal cancellationRate = calculatePercentage(
                cancelledOrders,
                totalOrders
        );

        BigDecimal completionRate = calculatePercentage(
                receivedOrders,
                totalOrders
        );

        BigDecimal averageDeliveryDays =
                calculateAverageDeliveryDays(purchases);

        BigDecimal totalReceivedPurchaseValue = purchases.stream()
                .filter(purchase ->
                        purchase.getStatus() == PurchaseStatus.RECEIVED)
                .map(SupplierPurchase::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        long suppliedProductCount =
                supplierProductRepository.countBySupplierId(
                        supplier.getId()
                );

        long preferredProductCount =
                supplierProductRepository
                        .countBySupplierIdAndPreferredTrue(
                                supplier.getId()
                        );

        BigDecimal performanceScore = calculatePerformanceScore(
                totalOrders,
                onTimeDeliveryRate,
                cancellationRate,
                completionRate
        );

        SupplierPerformanceRating rating =
                determineRating(
                        receivedOrders,
                        performanceScore
                );

        return new SupplierPerformanceResponse(
                supplier.getId(),
                supplier.getSupplierCode(),
                supplier.getName(),
                supplier.getCompanyName(),

                startDate,
                endDate,

                totalOrders,
                receivedOrders,
                pendingOrders,
                cancelledOrders,

                deliveriesWithExpectedDate,
                onTimeDeliveries,
                lateDeliveries,

                onTimeDeliveryRate,
                cancellationRate,
                completionRate,

                averageDeliveryDays,
                totalReceivedPurchaseValue,

                suppliedProductCount,
                preferredProductCount,

                performanceScore,
                rating
        );
    }

    private boolean isDeliveredOnTime(
            SupplierPurchase purchase
    ) {
        LocalDate receivedDate =
                purchase.getReceivedAt().toLocalDate();

        return !receivedDate.isAfter(
                purchase.getExpectedDeliveryDate()
        );
    }

    private BigDecimal calculateAverageDeliveryDays(
            List<SupplierPurchase> purchases
    ) {
        List<Long> deliveryDays = purchases.stream()
                .filter(purchase ->
                        purchase.getStatus() == PurchaseStatus.RECEIVED)
                .filter(purchase ->
                        purchase.getOrderedAt() != null)
                .filter(purchase ->
                        purchase.getReceivedAt() != null)
                .map(purchase ->
                        Duration.between(
                                purchase.getOrderedAt(),
                                purchase.getReceivedAt()
                        ).toDays()
                )
                .toList();

        if (deliveryDays.isEmpty()) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        long totalDays = deliveryDays.stream()
                .mapToLong(Long::longValue)
                .sum();

        return BigDecimal.valueOf(totalDays)
                .divide(
                        BigDecimal.valueOf(deliveryDays.size()),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private BigDecimal calculatePercentage(
            long value,
            long total
    ) {
        if (total == 0) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return BigDecimal.valueOf(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(total),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    /*
     * Performance score:
     *
     * On-time delivery = 60%
     * Order completion  = 30%
     * Low cancellation  = 10%
     */
    private BigDecimal calculatePerformanceScore(
            long totalOrders,
            BigDecimal onTimeDeliveryRate,
            BigDecimal cancellationRate,
            BigDecimal completionRate
    ) {
        if (totalOrders == 0) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        BigDecimal onTimeScore =
                onTimeDeliveryRate.multiply(
                        new BigDecimal("0.60")
                );

        BigDecimal completionScore =
                completionRate.multiply(
                        new BigDecimal("0.30")
                );

        BigDecimal cancellationScore =
                BigDecimal.valueOf(100)
                        .subtract(cancellationRate)
                        .max(BigDecimal.ZERO)
                        .multiply(new BigDecimal("0.10"));

        return onTimeScore
                .add(completionScore)
                .add(cancellationScore)
                .min(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private SupplierPerformanceRating determineRating(
            long receivedOrders,
            BigDecimal performanceScore
    ) {
        if (receivedOrders < 3) {
            return SupplierPerformanceRating.INSUFFICIENT_DATA;
        }

        if (performanceScore.compareTo(
                new BigDecimal("90")) >= 0) {
            return SupplierPerformanceRating.EXCELLENT;
        }

        if (performanceScore.compareTo(
                new BigDecimal("75")) >= 0) {
            return SupplierPerformanceRating.GOOD;
        }

        if (performanceScore.compareTo(
                new BigDecimal("50")) >= 0) {
            return SupplierPerformanceRating.AVERAGE;
        }

        return SupplierPerformanceRating.POOR;
    }

    private DateRange resolveDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDate resolvedEndDate =
                endDate != null ? endDate : LocalDate.now();

        LocalDate resolvedStartDate =
                startDate != null
                        ? startDate
                        : resolvedEndDate.minusYears(1);

        if (resolvedStartDate.isAfter(resolvedEndDate)) {
            throw new BadRequestException(
                    "Start date cannot be after end date"
            );
        }

        return new DateRange(
                resolvedStartDate,
                resolvedEndDate,
                resolvedStartDate.atStartOfDay(),
                resolvedEndDate.plusDays(1).atStartOfDay().minusNanos(1)
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
