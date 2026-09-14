package com.sparehub.service.impl.order;



import com.sparehub.dto.request.order.*;
import com.sparehub.dto.response.order.*;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.entity.order.OrderItem;
import com.sparehub.enums.order.OrderStatus;
import com.sparehub.mapper.order.OrderResponseMapper;
import com.sparehub.repository.order.*;
import com.sparehub.service.inventory.InventoryTransactionService;
import com.sparehub.service.order.StaffOrderService;
import com.sparehub.entity.User;
import com.sparehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sparehub.entity.order.Refund;
import com.sparehub.repository.order.RefundRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.sparehub.dto.request.order.OrderStatusUpdateRequest;
import com.sparehub.entity.order.OrderStatusHistory;
import com.sparehub.enums.order.PaymentStatus;
import com.sparehub.dto.response.order.OrderStatusHistoryResponse;

import com.sparehub.repository.order.OrderStatusHistoryRepository;


@Service
@RequiredArgsConstructor
@Transactional
public class StaffOrderServiceImpl implements StaffOrderService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;


    private final CustomerOrderRepository customerOrderRepository;
    private final UserRepository userRepository;
    private final OrderResponseMapper orderResponseMapper;

    private final OrderStatusHistoryRepository
            orderStatusHistoryRepository;

    private final InventoryTransactionService
            inventoryTransactionService;



    /*
     * status query parameter එක නොදුන්නොත් සියලු orders.
     * status එක දුන්නොත් එම status එකට අදාළ orders පමණයි.
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(
            OrderStatus status
    ) {
        List<CustomerOrder> orders;

        if (status == null) {
            orders = customerOrderRepository
                    .findAllByOrderByCreatedAtDesc();
        } else {
            orders = customerOrderRepository
                    .findAllByOrderStatusOrderByCreatedAtDesc(
                            status
                    );
        }

        return orders.stream()
                .map(orderResponseMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        CustomerOrder order = getRequiredOrder(orderId);

        return orderResponseMapper.toResponse(order);
    }

    /*
     * Explicit stock verification endpoint.
     * මෙය database එක වෙනස් කරන්නේ නැහැ.
     */
    @Override
    @Transactional(readOnly = true)
    public StockVerificationResponse verifyOrderStock(
            Long orderId
    ) {
        CustomerOrder order = getRequiredOrder(orderId);

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING orders can be verified for confirmation"
            );
        }

        return buildStockVerificationResponse(order);
    }

    /*
     * Confirm action එක stock verification නැවත සිදු කරනවා.
     * Frontend verification result එක විශ්වාස කරන්නේ නැහැ.
     */
    @Override
    public OrderResponse confirmOrder(
            Long orderId,
            ConfirmOrderRequest request
    ) {
        CustomerOrder order = getRequiredOrder(orderId);

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING orders can be confirmed. "
                            + "Current status: "
                            + order.getOrderStatus()
            );
        }

        StockVerificationResponse verification =
                buildStockVerificationResponse(order);

        if (!verification.allItemsAvailable()) {
            String failedItems = verification.items()
                    .stream()
                    .filter(item -> !item.sufficientStock())
                    .map(item ->
                            item.productName()
                                    + " - "
                                    + item.message()
                    )
                    .reduce(
                            (first, second) ->
                                    first + "; " + second
                    )
                    .orElse("Stock verification failed");

            throw new BadRequestException(
                    "Order cannot be confirmed. " + failedItems
            );
        }

        User salesStaff = getCurrentStaffUser();

        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setConfirmedBy(salesStaff);
        order.setConfirmedAt(LocalDateTime.now());
        order.setStaffNote(cleanText(request.staffNote()));
        order.setRejectionReason(null);

        CustomerOrder savedOrder =
                customerOrderRepository.save(order);
        saveStatusHistory(
                savedOrder,
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                request.staffNote(),
                salesStaff
        );

        return orderResponseMapper.toResponse(savedOrder);
    }

    @Override
    public OrderResponse rejectOrder(
            Long orderId,
            RejectOrderRequest request
    ) {
        CustomerOrder order = getRequiredOrder(orderId);

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING orders can be rejected. "
                            + "Current status: "
                            + order.getOrderStatus()
            );
        }

        User salesStaff = getCurrentStaffUser();

        order.setOrderStatus(OrderStatus.REJECTED);
        order.setRejectionReason(request.reason().trim());
        order.setStaffNote(
                "Rejected by "
                        + getUserDisplayName(salesStaff)
        );

        CustomerOrder savedOrder =
                customerOrderRepository.save(order);

        return orderResponseMapper.toResponse(savedOrder);
    }
    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse>
    getOrderStatusHistory(Long orderId) {
        getRequiredOrder(orderId);

        return orderStatusHistoryRepository
                .findAllByOrderIdOrderByChangedAtAsc(orderId)
                .stream()
                .map(this::mapStatusHistoryResponse)
                .toList();
    }

    private StockVerificationResponse
    buildStockVerificationResponse(CustomerOrder order) {

        List<OrderItemStockResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(this::verifyOrderItem)
                        .toList();

        boolean allItemsAvailable = itemResponses
                .stream()
                .allMatch(item ->
                        Boolean.TRUE.equals(
                                item.sufficientStock()
                        )
                );

        return new StockVerificationResponse(
                order.getId(),
                order.getOrderNumber(),
                allItemsAvailable,
                itemResponses
        );
    }

    private OrderItemStockResponse verifyOrderItem(
            OrderItem orderItem
    ) {
        SparePart sparePart = orderItem.getSparePart();

        if (sparePart == null) {
            return new OrderItemStockResponse(
                    null,
                    orderItem.getPartNumber(),
                    orderItem.getProductName(),
                    orderItem.getQuantity(),
                    0,
                    false,
                    false,
                    "Spare part record was not found"
            );
        }


        boolean productActive =
                sparePart.getStatus()
                        == SparePartStatus.ACTIVE;

        int availableQuantity =
                sparePart.getStockQuantity() == null
                        ? 0
                        : sparePart.getStockQuantity();

        boolean sufficientStock =
                productActive
                        && availableQuantity
                        >= orderItem.getQuantity();

        String message;

        if (!productActive) {
            message = "Product is inactive or discontinued";
        } else if (availableQuantity <= 0) {
            message = "Product is out of stock";
        } else if (availableQuantity
                < orderItem.getQuantity()) {
            message = "Insufficient stock. Requested: "
                    + orderItem.getQuantity()
                    + ", available: "
                    + availableQuantity;
        } else {
            message = "Stock is available";
        }

        return new OrderItemStockResponse(
                sparePart.getId(),
                orderItem.getPartNumber(),
                orderItem.getProductName(),
                orderItem.getQuantity(),
                availableQuantity,
                productActive,
                sufficientStock,
                message
        );
    }

    private CustomerOrder getRequiredOrder(Long orderId) {
        return customerOrderRepository
                .findDetailedById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order was not found with ID: "
                                        + orderId
                        )
                );
    }

    private User getCurrentStaffUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new BadRequestException(
                    "Authenticated sales staff member is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated staff account was not found"
                        )
                );
    }

    private String cleanText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String getUserDisplayName(User user) {
        if (user == null) {
            return "";
        }

        if (user.getFullName() != null
                && !user.getFullName().isBlank()) {
            return user.getFullName().trim();
        }

        return user.getEmail() == null
                ? ""
                : user.getEmail();
    }

    @Override
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatusUpdateRequest request
    ) {
        CustomerOrder order = getRequiredOrder(orderId);
        User salesStaff = getCurrentStaffUser();

        OrderStatus currentStatus =
                order.getOrderStatus();

        OrderStatus requestedStatus =
                request.status();

        validateStatusTransition(
                currentStatus,
                requestedStatus
        );

        /*
         * COMPLETED status එකට යන්න කලින්:
         * 1. Full payment validate කරනවා
         * 2. Stock double deduction prevent කරනවා
         * 3. Current stock නැවත check කරනවා
         * 4. Stock deduct සහ transaction record කරනවා
         */
        if (requestedStatus == OrderStatus.COMPLETED) {
            completeOrderStockProcessing(
                    order,
                    salesStaff
            );
        }

        order.setOrderStatus(requestedStatus);

        if (request.staffNote() != null
                && !request.staffNote().isBlank()) {
            order.setStaffNote(
                    request.staffNote().trim()
            );
        }

        CustomerOrder savedOrder =
                customerOrderRepository.save(order);

        saveStatusHistory(
                savedOrder,
                currentStatus,
                requestedStatus,
                request.staffNote(),
                salesStaff
        );

        return orderResponseMapper.toResponse(savedOrder);
    }
    private void validateStatusTransition(
            OrderStatus currentStatus,
            OrderStatus requestedStatus
    ) {
        if (currentStatus == requestedStatus) {
            throw new BadRequestException(
                    "Order is already in status: "
                            + currentStatus
            );
        }

        boolean validTransition =
                switch (currentStatus) {
                    case CONFIRMED ->
                            requestedStatus
                                    == OrderStatus.PROCESSING;

                    case PROCESSING ->
                            requestedStatus
                                    == OrderStatus.READY;

                    case READY ->
                            requestedStatus
                                    == OrderStatus.COMPLETED;

                    default -> false;
                };

        if (!validTransition) {
            throw new BadRequestException(
                    "Invalid order status transition from "
                            + currentStatus
                            + " to "
                            + requestedStatus
            );
        }
    }
    private void completeOrderStockProcessing(
            CustomerOrder order,
            User salesStaff
    ) {
        if (order.getPaymentStatus()
                != PaymentStatus.PAID) {
            throw new BadRequestException(
                    "Order cannot be completed until full payment is recorded"
            );
        }

        if (Boolean.TRUE.equals(order.getStockDeducted())) {
            throw new BadRequestException(
                    "Stock has already been deducted for this order"
            );
        }

        /*
         * Stock deduct කිරීමට පෙර සියලු items නැවත validate කරනවා.
         */
        StockVerificationResponse verification =
                buildStockVerificationResponse(order);

        if (!verification.allItemsAvailable()) {
            String failedItems = verification.items()
                    .stream()
                    .filter(item ->
                            !Boolean.TRUE.equals(
                                    item.sufficientStock()
                            )
                    )
                    .map(item ->
                            item.productName()
                                    + " - "
                                    + item.message()
                    )
                    .reduce(
                            (first, second) ->
                                    first + "; " + second
                    )
                    .orElse("Stock verification failed");

            throw new BadRequestException(
                    "Order cannot be completed. "
                            + failedItems
            );
        }

        /*
         * Phase 3 Inventory service එක stock quantity අඩු කර
         * inventory transaction record එක create කරනවා.
         */
        for (OrderItem orderItem : order.getItems()) {
            inventoryTransactionService
                    .recordSaleStockReduction(
                            orderItem.getSparePart().getId(),
                            orderItem.getQuantity(),
                            order.getId(),
                            order.getOrderNumber()
                    );
        }

        LocalDateTime now = LocalDateTime.now();

        order.setStockDeducted(true);
        order.setStockDeductedAt(now);
        order.setCompletedAt(now);
        order.setCompletedBy(salesStaff);
    }
    private void saveStatusHistory(
            CustomerOrder order,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            String note,
            User changedBy
    ) {
        OrderStatusHistory history =
                new OrderStatusHistory();

        history.setOrder(order);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setNote(cleanText(note));
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());

        orderStatusHistoryRepository.save(history);
    }
    @Override
    public CancellationProcessResponse approveCancellation(
            Long orderId,
            ApproveCancellationRequest request
    ) {
        CustomerOrder order = getRequiredOrder(orderId);

        validatePendingCancellationRequest(order);

        User salesStaff = getCurrentStaffUser();
        OrderStatus previousStatus = order.getOrderStatus();

        /*
         * Customer payment කර තිබේ නම් refund record එක create කරනවා.
         */
        Refund refund = processRefundIfRequired(
                order,
                salesStaff
        );

        /*
         * Normal flow එකේ cancellation request එන්නේ
         * PENDING හෝ CONFIRMED status එකකදී නිසා
         * stock සාමාන්‍යයෙන් deduct වී නැහැ.
         *
         * ආරක්ෂාව සඳහා stock deduct වී තිබේ නම් reverse කරනවා.
         */
        boolean stockReversed =
                reverseStockIfRequired(order);

        LocalDateTime now = LocalDateTime.now();

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancelledBy(salesStaff);
        order.setCancelledAt(now);
        order.setCancellationProcessedAt(now);
        order.setCancellationDecisionNote(
                cleanText(request.decisionNote())
        );

        /*
         * Refund එකක් තිබුණොත් order payment status REFUNDED.
         * Payment නොතිබුණොත් PENDING ලෙස තැබිය හැක.
         */
        if (refund != null) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        CustomerOrder savedOrder =
                customerOrderRepository.save(order);

        saveStatusHistory(
                savedOrder,
                previousStatus,
                OrderStatus.CANCELLED,
                buildCancellationApprovalNote(request),
                salesStaff
        );

        return new CancellationProcessResponse(
                orderResponseMapper.toResponse(savedOrder),
                refund != null,
                refund == null
                        ? null
                        : mapRefundResponse(refund),
                stockReversed
        );
    }
    @Override
    public OrderResponse rejectCancellation(
            Long orderId,
            RejectCancellationRequest request
    ) {
        CustomerOrder order = getRequiredOrder(orderId);

        validatePendingCancellationRequest(order);

        User salesStaff = getCurrentStaffUser();

        OrderStatus restoreStatus =
                order.getStatusBeforeCancellation();

        if (restoreStatus == null
                || (
                restoreStatus != OrderStatus.PENDING
                        && restoreStatus
                        != OrderStatus.CONFIRMED
        )) {
            throw new BadRequestException(
                    "The order does not contain a valid previous status"
            );
        }

        OrderStatus previousStatus =
                order.getOrderStatus();

        order.setOrderStatus(restoreStatus);
        order.setCancellationProcessedAt(
                LocalDateTime.now()
        );
        order.setCancellationDecisionNote(
                request.decisionNote().trim()
        );

        CustomerOrder savedOrder =
                customerOrderRepository.save(order);

        saveStatusHistory(
                savedOrder,
                previousStatus,
                restoreStatus,
                "Cancellation request rejected: "
                        + request.decisionNote().trim(),
                salesStaff
        );

        return orderResponseMapper.toResponse(savedOrder);
    }
    private OrderStatusHistoryResponse
    mapStatusHistoryResponse(
            OrderStatusHistory history
    ) {
        User changedBy = history.getChangedBy();

        return new OrderStatusHistoryResponse(
                history.getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getNote(),
                changedBy == null
                        ? null
                        : changedBy.getId(),
                changedBy == null
                        ? null
                        : getUserDisplayName(changedBy),
                history.getChangedAt()
        );
    }
    private void validatePendingCancellationRequest(
            CustomerOrder order
    ) {
        if (order.getOrderStatus()
                != OrderStatus.CANCELLATION_REQUESTED) {
            throw new BadRequestException(
                    "This order does not have a pending cancellation request"
            );
        }

        if (order.getCancellationReason() == null
                || order.getCancellationReason().isBlank()) {
            throw new BadRequestException(
                    "Cancellation reason was not found"
            );
        }
    }
    private boolean reverseStockIfRequired(
            CustomerOrder order
    ) {
        if (!Boolean.TRUE.equals(
                order.getStockDeducted()
        )) {
            return false;
        }

        if (Boolean.TRUE.equals(
                order.getStockReversed()
        )) {
            throw new BadRequestException(
                    "Stock has already been reversed for this order"
            );
        }

        for (OrderItem orderItem : order.getItems()) {
            inventoryTransactionService
                    .recordSaleReversal(
                            orderItem.getSparePart().getId(),
                            orderItem.getQuantity(),
                            order.getId(),
                            order.getOrderNumber()
                    );
        }

        order.setStockReversed(true);
        order.setStockReversedAt(
                LocalDateTime.now()
        );

        return true;
    }
    private String buildCancellationApprovalNote(
            ApproveCancellationRequest request
    ) {
        String note = cleanText(
                request.decisionNote()
        );

        if (note == null) {
            return "Cancellation request approved";
        }

        return "Cancellation request approved: "
                + note;
    }

    private Refund processRefundIfRequired(
            CustomerOrder order,
            User processedBy
    ) {
        BigDecimal paidAmount = paymentRepository
                .calculatePaidAmountByOrderId(order.getId());

        if (paidAmount == null
                || paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        Refund existingRefund = refundRepository
                .findByOrderId(order.getId())
                .orElse(null);

        if (existingRefund != null) {
            return existingRefund;
        }

        Refund refund = new Refund();
        refund.setRefundReference(generateRefundReference());
        refund.setOrder(order);
        refund.setAmount(money(paidAmount));
        refund.setReason(buildRefundReason(order));
        refund.setProcessedBy(processedBy);
        refund.setCreatedAt(LocalDateTime.now());

        return refundRepository.save(refund);
    }

    private String buildRefundReason(CustomerOrder order) {
        String cancellationReason = cleanText(
                order.getCancellationReason()
        );

        if (cancellationReason == null) {
            return "Refund for approved order cancellation";
        }

        return "Refund for approved order cancellation: "
                + cancellationReason;
    }

    private String generateRefundReference() {
        String datePart = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String refundReference;

        do {
            String randomPart = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);

            refundReference =
                    "REF-" + datePart + "-" + randomPart;
        } while (refundRepository.existsByRefundReference(
                refundReference
        ));

        return refundReference;
    }

    private RefundResponse mapRefundResponse(Refund refund) {
        User processedBy = refund.getProcessedBy();

        return new RefundResponse(
                refund.getId(),
                refund.getRefundReference(),
                refund.getOrder().getId(),
                refund.getOrder().getOrderNumber(),
                money(refund.getAmount()),
                refund.getReason(),
                processedBy == null ? null : processedBy.getId(),
                processedBy == null
                        ? null
                        : getUserDisplayName(processedBy),
                refund.getCreatedAt()
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
}
