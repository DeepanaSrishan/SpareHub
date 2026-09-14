package com.sparehub.service.impl.order;



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
     * US-34: Sales Staff customer payment record කිරීම.
     */
    @Override
    public PaymentRecordResponse recordPayment(
            Long orderId,
            RecordPaymentRequest request
    ) {
        CustomerOrder order = getRequiredOrder(orderId);

        validatePaymentEligibility(order);

        BigDecimal paymentAmount = money(request.amount());

        BigDecimal paidBefore =
                getPaidAmount(order.getId());

        BigDecimal remainingBefore = money(
                order.getTotalAmount().subtract(paidBefore)
        );

        if (remainingBefore.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                    "This order has already been fully paid"
            );
        }

        if (paymentAmount.compareTo(remainingBefore) > 0) {
            throw new BadRequestException(
                    "Payment amount exceeds the remaining order amount. "
                            + "Remaining amount: "
                            + remainingBefore
            );
        }

        User staff = getCurrentUser();

        Payment payment = new Payment();
        payment.setPaymentReference(
                generatePaymentReference()
        );
        payment.setOrder(order);
        payment.setAmount(paymentAmount);
        payment.setPaymentMethod(
                request.paymentMethod()
        );
        payment.setStatus(PaymentStatus.PAID);
        payment.setExternalReference(
                cleanText(request.externalReference())
        );
        payment.setNote(cleanText(request.note()));
        payment.setRecordedBy(staff);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment =
                paymentRepository.save(payment);

        BigDecimal paidAfter =
                money(paidBefore.add(paymentAmount));

        BigDecimal remainingAfter = money(
                order.getTotalAmount().subtract(paidAfter)
        );

        if (remainingAfter.compareTo(BigDecimal.ZERO) <= 0) {
            remainingAfter = money(BigDecimal.ZERO);
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            order.setPaymentStatus(
                    PaymentStatus.PARTIALLY_PAID
            );
        }

        customerOrderRepository.save(order);

        PaymentResponse paymentResponse =
                mapToPaymentResponse(savedPayment);

        PaymentStatusResponse summary =
                new PaymentStatusResponse(
                        order.getId(),
                        order.getOrderNumber(),
                        money(order.getTotalAmount()),
                        paidAfter,
                        remainingAfter,
                        order.getPaymentStatus()
                );

        return new PaymentRecordResponse(
                paymentResponse,
                summary
        );
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
