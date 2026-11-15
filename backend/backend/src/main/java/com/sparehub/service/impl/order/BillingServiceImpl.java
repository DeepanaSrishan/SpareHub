package com.sparehub.service.impl.order;



import com.sparehub.enums.Role;
import com.sparehub.dto.response.order.*;
import com.sparehub.entity.order.Refund;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.dto.request.order.RecordPaymentRequest;
import com.sparehub.dto.response.*;
import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.entity.order.Invoice;
import com.sparehub.entity.order.Payment;
import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentStatus;
import com.sparehub.repository.order.CustomerOrderRepository;
import com.sparehub.repository.order.InvoiceRepository;
import com.sparehub.repository.order.PaymentRepository;
import com.sparehub.repository.order.RefundRepository;
import com.sparehub.service.order.BillingService;
import com.sparehub.entity.User;
import com.sparehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import com.sparehub.dto.request.order.CustomerPaymentRequest;
import com.sparehub.enums.order.PaymentMethod;
import com.sparehub.service.NotificationService;
import com.sparehub.enums.NotificationType;
import com.sparehub.dto.response.order.RefundResponse;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingServiceImpl implements BillingService {

    private final CustomerOrderRepository customerOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final RefundRepository refundRepository;
    private final com.sparehub.service.LoyaltyService loyaltyService;
    private final NotificationService notificationService;


    /*
     * US-33: Confirmed order එකකට invoice generate කිරීම.
     */
    @Override
    @Transactional(readOnly = true)
    public RefundResponse getRefundForStaff(Long orderId) {
        getRequiredOrder(orderId);

        Refund refund = refundRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Refund was not found for order ID: "
                                + orderId
                ));

        return mapToRefundResponse(refund);
    }
    @Override
    @Transactional(readOnly = true)
    public RefundResponse getMyRefund(Long orderId) {
        User customer = getCurrentUser();

        CustomerOrder order = customerOrderRepository
                .findByIdAndCustomerId(
                        orderId,
                        customer.getId()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: "
                                + orderId
                ));

        Refund refund = refundRepository
                .findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Refund was not found for this order"
                ));

        return mapToRefundResponse(refund);
    }

    @Override
    public InvoiceResponse generateInvoice(Long orderId) {
        CustomerOrder order = getRequiredOrder(orderId);

        validateInvoiceEligibility(order);

        Invoice existingInvoice = invoiceRepository
                .findByOrderId(orderId)
                .orElse(null);

        if (existingInvoice != null) {
            throw new BadRequestException(
                    "An invoice has already been generated for this order"
            );
        }

        User staff = getCurrentUser();

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setOrder(order);
        invoice.setGeneratedBy(staff);
        invoice.setGeneratedAt(LocalDateTime.now());

        Invoice savedInvoice =
                invoiceRepository.save(invoice);

        return mapToInvoiceResponse(savedInvoice);
    }

    /*
     * Sales Staff හෝ Manager invoice එක බලන method එක.
     */
    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceForStaff(Long orderId) {
        Invoice invoice = invoiceRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invoice was not found for order ID: "
                                + orderId
                ));

        return mapToInvoiceResponse(invoice);
    }

    /*
     * Customerට තමන්ගේ order invoice එක පමණක් බලන්න පුළුවන්.
     */
    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getMyInvoice(Long orderId) {
        User customer = getCurrentUser();

        CustomerOrder order = customerOrderRepository
                .findByIdAndCustomerId(
                        orderId,
                        customer.getId()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: "
                                + orderId
                ));

        Invoice invoice = invoiceRepository
                .findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invoice has not been generated for this order"
                ));

        return mapToInvoiceResponse(invoice);
    }

    /*
     * US-34: Sales Staff customer payment record කිරීම (Full-Payment-Only).
     */
    @Override
    public PaymentRecordResponse recordPayment(
            Long orderId,
            RecordPaymentRequest request
    ) {
        if (request == null || request.paymentMethod() == null) {
            throw new BadRequestException("Payment method is required");
        }

        User staff = getCurrentUser();
        if (staff.getRole() != Role.SALES_STAFF && staff.getRole() != Role.MANAGER) {
            throw new BadRequestException("Only sales staff or managers are authorized to record payments");
        }

        CustomerOrder order = customerOrderRepository
                .findDetailedByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: "
                                + orderId
                ));

        validatePaymentEligibility(order);

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This order has already been fully paid");
        }
        if (order.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException("Payment cannot be recorded for a refunded order");
        }

        BigDecimal orderTotal = money(order.getTotalAmount());
        BigDecimal paidBefore = getPaidAmount(order.getId());
        BigDecimal remainingAmount = money(orderTotal.subtract(paidBefore));

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This order has already been fully paid");
        }

        Payment payment = new Payment();
        payment.setPaymentReference(generatePaymentReference());
        payment.setOrder(order);
        payment.setAmount(remainingAmount);
        payment.setPaymentMethod(request.paymentMethod());
        payment.setStatus(PaymentStatus.PAID);
        payment.setExternalReference(cleanText(request.externalReference()));
        payment.setNote(cleanText(request.note()));
        payment.setRecordedBy(staff);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        BigDecimal paidAfter = money(paidBefore.add(remainingAmount));
        BigDecimal remainingAfter = money(BigDecimal.ZERO);

        order.setPaymentStatus(PaymentStatus.PAID);
        customerOrderRepository.save(order);

        if (order.getCustomer() != null) {
            try {
                loyaltyService.awardPurchasePoints(
                        order.getCustomer().getId(),
                        order.getId(),
                        order.getTotalAmount()
                );
            } catch (Exception ignored) {
            }
        }

        PaymentResponse paymentResponse =
                mapToPaymentResponse(savedPayment);

        PaymentStatusResponse summary =
                new PaymentStatusResponse(
                        order.getId(),
                        order.getOrderNumber(),
                        orderTotal,
                        paidAfter,
                        remainingAfter,
                        order.getPaymentStatus()
                );

        return new PaymentRecordResponse(
                paymentResponse,
                summary
        );
    }

    /*
     * Customer payment processing for CARD and BANK_TRANSFER
     */
    @Override
    public PaymentRecordResponse processCustomerPayment(
            Long orderId,
            CustomerPaymentRequest request
    ) {
        if (request == null || request.paymentMethod() == null) {
            throw new BadRequestException("Payment method is required");
        }

        User customer = getCurrentUser();

        CustomerOrder order = customerOrderRepository
                .findDetailedByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: " + orderId
                ));

        // Validate customer authorization
        if (customer.getRole() == Role.CUSTOMER) {
            if (order.getCustomer() == null || !order.getCustomer().getId().equals(customer.getId())) {
                throw new BadRequestException("You are not authorized to make payment for this order");
            }
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Payment cannot be processed for a cancelled order");
        }

        if (order.getOrderStatus() == OrderStatus.REJECTED) {
            throw new BadRequestException("Payment cannot be processed for a rejected order");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This order has already been fully paid");
        }
        if (order.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException("Payment cannot be recorded for a refunded order");
        }

        BigDecimal orderTotal = money(order.getTotalAmount());
        BigDecimal paidBefore = getPaidAmount(order.getId());
        BigDecimal remainingAmount = money(orderTotal.subtract(paidBefore));

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This order has already been fully paid");
        }

        String externalRef;
        String note;

        if (request.paymentMethod() == PaymentMethod.CARD) {
            String cardNum = cleanText(request.cardNumber());
            if (cardNum == null || cardNum.replaceAll("\\s+", "").length() < 12) {
                throw new BadRequestException("Valid 16-digit card number is required for card payment");
            }
            if (cleanText(request.cardHolderName()) == null) {
                throw new BadRequestException("Cardholder name is required");
            }
            String rawExpiry = cleanText(request.expiryDate());
            if (rawExpiry == null) {
                throw new BadRequestException("Card expiry date (MM/YY) is required");
            }
            java.util.regex.Matcher expiryMatcher = java.util.regex.Pattern.compile("^(0[1-9]|1[0-2])/([0-9]{2})$").matcher(rawExpiry.trim());
            if (!expiryMatcher.matches()) {
                throw new BadRequestException("Card expiry date must be in valid MM/YY format (e.g. 12/26)");
            }
            int expMonth = Integer.parseInt(expiryMatcher.group(1));
            int expYear = Integer.parseInt(expiryMatcher.group(2));

            int minAllowedYear = 26; // 2026 onwards
            int currentMonth = 10;   // October 2026
            if (expYear < minAllowedYear) {
                throw new BadRequestException("Card expiry year must be 2026 or later (e.g. 26, 27...). Past years cannot be accepted.");
            }
            if (expYear == minAllowedYear && expMonth < currentMonth) {
                throw new BadRequestException("This card has already expired. Expiry month cannot be in the past.");
            }
            if (expYear > 50) {
                throw new BadRequestException("Card expiry year cannot exceed 2050");
            }

            if (cleanText(request.cvv()) == null || cleanText(request.cvv()).length() < 3) {
                throw new BadRequestException("Valid 3 or 4 digit CVV/CVC is required");
            }

            String digitsOnly = cardNum.replaceAll("\\s+", "");
            String last4 = digitsOnly.length() >= 4 ? digitsOnly.substring(digitsOnly.length() - 4) : digitsOnly;
            String authCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
            externalRef = "CARD-****-" + last4 + " (AUTH:" + authCode + ")";
            note = request.note() != null && !request.note().isBlank()
                    ? request.note().trim()
                    : "Online Card Payment by " + request.cardHolderName().trim();

        } else if (request.paymentMethod() == PaymentMethod.BANK_TRANSFER) {
            String slipRef = cleanText(request.depositSlipReference());
            if (slipRef == null || slipRef.isBlank()) {
                throw new BadRequestException("Deposit slip / transaction reference is required for bank transfer");
            }
            String bank = cleanText(request.bankName()) != null ? cleanText(request.bankName()) : "Bank Transfer";
            externalRef = bank + " - Ref: " + slipRef;
            note = request.note() != null && !request.note().isBlank()
                    ? request.note().trim()
                    : "Direct Bank Deposit (" + bank + ")";
        } else {
            externalRef = "Cash Payment Reference";
            note = request.note() != null && !request.note().isBlank() ? request.note().trim() : "Cash on Delivery / In-Store";
        }

        Payment payment = new Payment();
        payment.setPaymentReference(generatePaymentReference());
        payment.setOrder(order);
        payment.setAmount(remainingAmount);
        payment.setPaymentMethod(request.paymentMethod());
        payment.setStatus(PaymentStatus.PAID);
        payment.setExternalReference(externalRef);
        payment.setNote(note);
        payment.setRecordedBy(customer);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        BigDecimal paidAfter = money(paidBefore.add(remainingAmount));
        BigDecimal remainingAfter = money(BigDecimal.ZERO);

        order.setPaymentStatus(PaymentStatus.PAID);
        customerOrderRepository.save(order);

        if (order.getCustomer() != null) {
            try {
                loyaltyService.awardPurchasePoints(
                        order.getCustomer().getId(),
                        order.getId(),
                        order.getTotalAmount()
                );
            } catch (Exception ignored) {
            }

            try {
                if (notificationService != null) {
                    notificationService.createNotification(
                            order.getCustomer(),
                            NotificationType.PAYMENT_STATUS,
                            "Payment Received",
                            "Payment of LKR " + remainingAmount + " for order #" + order.getOrderNumber() + " via " + request.paymentMethod() + " was successfully processed."
                    );
                }
            } catch (Exception ignored) {
            }
        }

        PaymentResponse paymentResponse = mapToPaymentResponse(savedPayment);
        PaymentStatusResponse summary = new PaymentStatusResponse(
                order.getId(),
                order.getOrderNumber(),
                orderTotal,
                paidAfter,
                remainingAfter,
                order.getPaymentStatus()
        );

        return new PaymentRecordResponse(paymentResponse, summary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsForStaff(
            Long orderId
    ) {
        getRequiredOrder(orderId);

        return paymentRepository
                .findAllByOrderIdOrderByCreatedAtDesc(orderId)
                .stream()
                .map(this::mapToPaymentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(
            Long orderId
    ) {
        User customer = getCurrentUser();

        CustomerOrder order = customerOrderRepository
                .findByIdAndCustomerId(
                        orderId,
                        customer.getId()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: "
                                + orderId
                ));

        return paymentRepository
                .findAllByOrderIdOrderByCreatedAtDesc(
                        order.getId()
                )
                .stream()
                .map(this::mapToPaymentResponse)
                .toList();
    }

    private void validateInvoiceEligibility(
            CustomerOrder order
    ) {
        OrderStatus status = order.getOrderStatus();

        boolean eligible =
                status == OrderStatus.CONFIRMED
                        || status == OrderStatus.PROCESSING
                        || status == OrderStatus.READY
                        || status == OrderStatus.COMPLETED;

        if (!eligible) {
            throw new BadRequestException(
                    "Invoice cannot be generated while order status is "
                            + status
            );
        }
    }

    private void validatePaymentEligibility(
            CustomerOrder order
    ) {
        OrderStatus status = order.getOrderStatus();

        if (status == OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Payment cannot be recorded before order confirmation"
            );
        }

        if (status == OrderStatus.CANCELLATION_REQUESTED) {
            throw new BadRequestException(
                    "Payment cannot be recorded while cancellation is pending"
            );
        }

        if (status == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                    "Payment cannot be recorded for a cancelled order"
            );
        }

        if (status == OrderStatus.REJECTED) {
            throw new BadRequestException(
                    "Payment cannot be recorded for a rejected order"
            );
        }
    }

    private CustomerOrder getRequiredOrder(Long orderId) {
        return customerOrderRepository
                .findDetailedById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order was not found with ID: "
                                + orderId
                ));
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
                    "Authenticated user is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user account was not found"
                ));
    }

    private InvoiceResponse mapToInvoiceResponse(
            Invoice invoice
    ) {
        CustomerOrder order = invoice.getOrder();
        User customer = order.getCustomer();
        User generatedBy = invoice.getGeneratedBy();

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

        BigDecimal paidAmount =
                getPaidAmount(order.getId());

        BigDecimal remainingAmount = money(
                order.getTotalAmount().subtract(paidAmount)
        );

        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = money(BigDecimal.ZERO);
        }

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getGeneratedAt(),

                order.getId(),
                order.getOrderNumber(),
                order.getCreatedAt(),

                customer.getId(),
                getUserDisplayName(customer),
                customer.getEmail(),

                items,

                money(order.getSubtotal()),
                money(order.getDiscountPercentage()),
                money(order.getDiscountAmount()),
                money(order.getTaxRate()),
                money(order.getTaxAmount()),
                money(order.getTotalAmount()),

                paidAmount,
                remainingAmount,

                order.getOrderStatus(),
                order.getPaymentStatus(),

                generatedBy.getId(),
                getUserDisplayName(generatedBy)
        );
    }

    private PaymentResponse mapToPaymentResponse(
            Payment payment
    ) {
        User recordedBy = payment.getRecordedBy();

        return new PaymentResponse(
                payment.getId(),
                payment.getPaymentReference(),

                payment.getOrder().getId(),
                payment.getOrder().getOrderNumber(),

                money(payment.getAmount()),
                payment.getPaymentMethod(),
                payment.getStatus(),

                payment.getExternalReference(),
                payment.getNote(),

                recordedBy == null
                        ? null
                        : recordedBy.getId(),

                recordedBy == null
                        ? null
                        : getUserDisplayName(recordedBy),

                payment.getCreatedAt(),
                payment.getPaidAt()
        );
    }

    private BigDecimal getPaidAmount(Long orderId) {
        BigDecimal paidAmount =
                paymentRepository
                        .calculatePaidAmountByOrderId(orderId);

        return money(paidAmount);
    }

    private String generateInvoiceNumber() {
        String datePart = LocalDateTime.now()
                .format(
                        DateTimeFormatter.ofPattern(
                                "yyyyMMdd"
                        )
                );

        String invoiceNumber;

        do {
            String randomPart = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);

            invoiceNumber =
                    "INV-" + datePart + "-" + randomPart;

        } while (
                invoiceRepository.existsByInvoiceNumber(
                        invoiceNumber
                )
        );

        return invoiceNumber;
    }

    private String generatePaymentReference() {
        String datePart = LocalDateTime.now()
                .format(
                        DateTimeFormatter.ofPattern(
                                "yyyyMMdd"
                        )
                );

        String paymentReference;

        do {
            String randomPart = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);

            paymentReference =
                    "PAY-" + datePart + "-" + randomPart;

        } while (
                paymentRepository.existsByPaymentReference(
                        paymentReference
                )
        );

        return paymentReference;
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
    private RefundResponse mapToRefundResponse(
            Refund refund
    ) {
        User processedBy = refund.getProcessedBy();

        return new RefundResponse(
                refund.getId(),
                refund.getRefundReference(),
                refund.getOrder().getId(),
                refund.getOrder().getOrderNumber(),
                money(refund.getAmount()),
                refund.getReason(),

                processedBy == null
                        ? null
                        : processedBy.getId(),

                processedBy == null
                        ? null
                        : getUserDisplayName(processedBy),

                refund.getCreatedAt()
        );
    }
}
