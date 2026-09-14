package com.sparehub.service.impl.order;



import com.sparehub.dto.request.order.ApproveCancellationRequest;
import com.sparehub.dto.request.order.CancellationRequest;
import com.sparehub.dto.request.order.RejectCancellationRequest;
import com.sparehub.dto.response.order.*;
import com.sparehub.entity.order.*;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.dto.request.order.PlaceOrderRequest;
import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentStatus;
import com.sparehub.repository.order.CartRepository;
import com.sparehub.repository.order.CustomerOrderRepository;
import com.sparehub.repository.order.PaymentRepository;
import com.sparehub.service.order.OrderService;
import com.sparehub.entity.User;
import com.sparehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sparehub.mapper.order.OrderResponseMapper;
import com.sparehub.entity.inventory.SparePartStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import com.sparehub.repository.order.OrderStatusHistoryRepository;


@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");

    private final CartRepository cartRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final OrderResponseMapper orderResponseMapper;
    private final OrderStatusHistoryRepository
            orderStatusHistoryRepository;

    @Override
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        User customer = getCurrentUser();

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BadRequestException(
                        "Your cart is empty"
                ));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException(
                    "Cannot place an order with an empty cart"
            );
        }

        /*
         * Checkout ආරම්භ කිරීමට පෙර සියලු cart items validate කරනවා.
         * එක item එකක් invalid වුවහොත් order එක create වෙන්නේ නැහැ.
         */
        validateCartItems(cart);

        CustomerOrder order = new CustomerOrder();

        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setCustomerNote(cleanText(request.customerNote()));

        BigDecimal subtotal = BigDecimal.ZERO;

        /*
         * CartItem records OrderItem snapshot records බවට convert කරනවා.
         */
        for (CartItem cartItem : cart.getItems()) {
            SparePart sparePart = cartItem.getSparePart();

            BigDecimal currentPrice = money(
                    sparePart.getSellingPrice()
            );

            OrderItem orderItem = new OrderItem();

            orderItem.setSparePart(sparePart);
            orderItem.setPartNumber(sparePart.getPartNumber());
            orderItem.setProductName(sparePart.getName());
            orderItem.setUnitPrice(currentPrice);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.calculateSubtotal();

            order.addItem(orderItem);

            subtotal = subtotal.add(orderItem.getSubtotal());
        }

        subtotal = money(subtotal);

        /*
         * Epic 1 loyalty tier එකෙන් discount percentage එක ගන්නවා.
         */
        BigDecimal discountPercentage =
                resolveLoyaltyDiscountPercentage(customer);

        BigDecimal discountAmount = subtotal
                .multiply(discountPercentage)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

        discountAmount = money(discountAmount);

        BigDecimal totalAmount =
                money(subtotal.subtract(discountAmount));

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(
                    "Calculated order total cannot be negative"
            );
        }

        order.setSubtotal(subtotal);
        order.setDiscountPercentage(discountPercentage);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount);

        CustomerOrder savedOrder =
                customerOrderRepository.save(order);

        /*
         * Order successfully save වුණාට පසුව cart එක clear කරනවා.
         * Method එක @Transactional නිසා error එකක් වුණොත් operations rollback වෙනවා.
         */
        cart.clearItems();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    private void validateCartItems(Cart cart) {
        for (CartItem cartItem : cart.getItems()) {
            SparePart sparePart = cartItem.getSparePart();

            if (sparePart == null) {
                throw new BadRequestException(
                        "A cart item contains an invalid spare part"
                );
            }

            if (sparePart.getStatus()
                    != SparePartStatus.ACTIVE) {
                throw new BadRequestException(
                        "Spare part is inactive or discontinued: "
                                + sparePart.getName()
                );
            }

            if (cartItem.getQuantity() == null
                    || cartItem.getQuantity() < 1) {
                throw new BadRequestException(
                        "Invalid quantity for spare part: "
                                + sparePart.getName()
                );
            }

            if (sparePart.getStockQuantity() == null
                    || sparePart.getStockQuantity() <= 0) {
                throw new BadRequestException(
                        "Spare part is out of stock: "
                                + sparePart.getName()
                );
            }

            if (cartItem.getQuantity()
                    > sparePart.getStockQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for "
                                + sparePart.getName()
                                + ". Requested: "
                                + cartItem.getQuantity()
                                + ", available: "
                                + sparePart.getStockQuantity()
                );
            }

            if (sparePart.getSellingPrice() == null
                    || sparePart.getSellingPrice()
                    .compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException(
                        "Invalid selling price for spare part: "
                                + sparePart.getName()
                );
            }
        }
    }

    /*
     * ඔයා Epic 1 එකේ නිර්මාණය කළ loyalty tiers වලට
     * ගැළපෙන percentages මෙතැන යොදන්න.
     */
    private BigDecimal resolveLoyaltyDiscountPercentage(
            User customer
    ) {
        if (customer.getLoyaltyTier() == null) {
            return BigDecimal.ZERO;
        }

        String tierName = String
                .valueOf(customer.getLoyaltyTier())
                .trim()
                .toUpperCase(Locale.ROOT);

        return switch (tierName) {
            case "SILVER" -> new BigDecimal("5.00");
            case "GOLD" -> new BigDecimal("10.00");
            case "PLATINUM" -> new BigDecimal("15.00");
            default -> BigDecimal.ZERO;
        };
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new BadRequestException(
                    "Authenticated customer is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user account was not found"
                ));
    }

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String randomPart = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);

        String orderNumber =
                "ORD-" + datePart + "-" + randomPart;

        /*
         * UUID collision එක ඉතාම අඩු වුණත්
         * database unique constraint එකට පෙර check කරනවා.
         */
        while (customerOrderRepository
                .existsByOrderNumber(orderNumber)) {
            randomPart = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);

            orderNumber =
                    "ORD-" + datePart + "-" + randomPart;
        }

        return orderNumber;
    }

    private OrderResponse mapToOrderResponse(
            CustomerOrder order
    ) {
        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getSparePart().getId(),
                        item.getPartNumber(),
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getSubtotal()
                ))
                .toList();

        int totalQuantity = items.stream()
                .mapToInt(OrderItemResponse::quantity)
                .sum();

        User customer = order.getCustomer();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),

                customer.getId(),
                getCustomerName(customer),
                customer.getEmail(),

                items,

                items.size(),
                totalQuantity,

                order.getSubtotal(),
                order.getDiscountPercentage(),
                order.getDiscountAmount(),
                order.getTotalAmount(),

                order.getOrderStatus(),
                order.getPaymentStatus(),

                order.getCustomerNote(),
                order.getStaffNote(),
                order.getCancellationReason(),
                order.getCancellationDecisionNote(),
                order.getRejectionReason(),

                order.getCreatedAt(),
                order.getConfirmedAt(),
                order.getCompletedAt(),
                order.getCancellationRequestedAt(),
                order.getCancellationProcessedAt(),
                order.getCancelledAt(),
                order.getUpdatedAt()
        );
    }

    private String getCustomerName(User customer) {
        if (customer == null
                || customer.getFullName() == null) {
            return "";
        }

        return customer.getFullName().trim();
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

    private String cleanText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
    public List<OrderResponse> getMyOrders() {
        User customer = getCurrentUser();

        return customerOrderRepository
                .findAllByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                )
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(Long orderId) {
        User customer = getCurrentUser();

        CustomerOrder order = findCustomerOrder(
                orderId,
                customer
        );

        return orderResponseMapper.toResponse(order);
    }
    private CustomerOrder findCustomerOrder(
            Long orderId,
            User customer
    ) {
        return customerOrderRepository
                .findByIdAndCustomerId(
                        orderId,
                        customer.getId()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: " + orderId
                ));
    }
    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse>
    getMyOrderStatusHistory(Long orderId) {
        User customer = getCurrentUser();

        CustomerOrder order = findCustomerOrder(
                orderId,
                customer
        );

        return orderStatusHistoryRepository
                .findAllByOrderIdOrderByChangedAtAsc(
                        order.getId()
                )
                .stream()
                .map(this::mapStatusHistoryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getMyOrderByNumber(
            String orderNumber
    ) {
        User customer = getCurrentUser();

        if (orderNumber == null || orderNumber.isBlank()) {
            throw new BadRequestException(
                    "Order number is required"
            );
        }

        CustomerOrder order = customerOrderRepository
                .findByOrderNumberAndCustomerId(
                        orderNumber.trim(),
                        customer.getId()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with number: "
                                + orderNumber
                ));

        return orderResponseMapper.toResponse(order);
    }
    @Override
    @Transactional(readOnly = true)
    public PaymentStatusResponse getMyOrderPaymentStatus(
            Long orderId
    ) {
        User customer = getCurrentUser();

        CustomerOrder order = findCustomerOrder(
                orderId,
                customer
        );

        BigDecimal paidAmount =
                paymentRepository.calculatePaidAmountByOrderId(
                        order.getId()
                );

        paidAmount = money(paidAmount);

        BigDecimal remainingAmount = order.getTotalAmount()
                .subtract(paidAmount);

        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        remainingAmount = money(remainingAmount);

        return new PaymentStatusResponse(
                order.getId(),
                order.getOrderNumber(),
                money(order.getTotalAmount()),
                paidAmount,
                remainingAmount,
                order.getPaymentStatus()
        );
    }
    @Override
    public OrderResponse requestCancellation(
            Long orderId,
            CancellationRequest request
    ) {
        User customer = getCurrentUser();

        CustomerOrder order = findCustomerOrder(
                orderId,
                customer
        );

        validateCancellationEligibility(order);

        OrderStatus currentStatus = order.getOrderStatus();

        order.setStatusBeforeCancellation(currentStatus);
        order.setOrderStatus(
                OrderStatus.CANCELLATION_REQUESTED
        );
        order.setCancellationReason(
                request.reason().trim()
        );
        order.setCancellationRequestedAt(
                LocalDateTime.now()
        );

        CustomerOrder updatedOrder =
                customerOrderRepository.save(order);

        return mapToOrderResponse(updatedOrder);
    }
    private void validateCancellationEligibility(
            CustomerOrder order
    ) {
        OrderStatus status = order.getOrderStatus();

        if (status == OrderStatus.CANCELLATION_REQUESTED) {
            throw new BadRequestException(
                    "A cancellation request already exists for this order"
            );
        }

        if (status != OrderStatus.PENDING
                && status != OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                    "Order cannot be cancelled while its status is "
                            + status
            );
        }

        if (order.getPaymentStatus()
                == PaymentStatus.REFUNDED) {
            throw new BadRequestException(
                    "A refunded order cannot be cancelled again"
            );
        }
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

}
