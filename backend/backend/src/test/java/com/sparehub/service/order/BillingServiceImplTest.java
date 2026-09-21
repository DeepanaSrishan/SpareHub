package com.sparehub.service.order;

import com.sparehub.dto.request.order.RecordPaymentRequest;
import com.sparehub.dto.response.order.PaymentRecordResponse;
import com.sparehub.entity.User;
import com.sparehub.entity.order.CustomerOrder;
import com.sparehub.entity.order.Payment;
import com.sparehub.enums.Role;
import com.sparehub.enums.order.OrderStatus;
import com.sparehub.enums.order.PaymentMethod;
import com.sparehub.enums.order.PaymentStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.repository.UserRepository;
import com.sparehub.repository.order.CustomerOrderRepository;
import com.sparehub.repository.order.InvoiceRepository;
import com.sparehub.repository.order.PaymentRepository;
import com.sparehub.repository.order.RefundRepository;
import com.sparehub.service.LoyaltyService;
import com.sparehub.service.impl.order.BillingServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.RecordComponent;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Optional;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BillingServiceImplTest {

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private LoyaltyService loyaltyService;

    @Mock
    private com.sparehub.service.NotificationService notificationService;

    @InjectMocks
    private BillingServiceImpl billingService;

    private User staffUser;

    @BeforeEach
    void setUp() {
        staffUser = new User();
        staffUser.setId(10L);
        staffUser.setEmail("sales@sparehub.com");
        staffUser.setFullName("Sales Agent");
        staffUser.setRole(Role.SALES_STAFF);

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(staffUser.getEmail());
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockCurrentUser() {
        when(userRepository.findByEmailIgnoreCase("sales@sparehub.com"))
                .thenReturn(Optional.of(staffUser));
    }

    private CustomerOrder createOrder(Long id, BigDecimal totalAmount, OrderStatus orderStatus, PaymentStatus paymentStatus) {
        CustomerOrder order = new CustomerOrder();
        order.setId(id);
        order.setOrderNumber("ORD-2026-TEST");
        order.setTotalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP));
        order.setOrderStatus(orderStatus);
        order.setPaymentStatus(paymentStatus);
        return order;
    }

    @Test
    @DisplayName("1. Full unpaid order is paid successfully with exact remaining amount")
    void recordPayment_whenUnpaidOrder_recordsFullPaymentSuccessfully() {
        // Given: Order total LKR 11,340.00, Recorded LKR 0.00
        Long orderId = 101L;
        BigDecimal orderTotal = new BigDecimal("11340.00");
        CustomerOrder order = createOrder(orderId, orderTotal, OrderStatus.CONFIRMED, PaymentStatus.PENDING);

        mockCurrentUser();
        when(customerOrderRepository.findDetailedByIdForUpdate(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.calculatePaidAmountByOrderId(orderId)).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecordPaymentRequest request = new RecordPaymentRequest(
                PaymentMethod.CASH,
                "",
                "Full payment received"
        );

        // When
        PaymentRecordResponse response = billingService.recordPayment(orderId, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.paymentSummary().totalAmount()).isEqualByComparingTo("11340.00");
        assertThat(response.paymentSummary().paidAmount()).isEqualByComparingTo("11340.00");
        assertThat(response.paymentSummary().remainingAmount()).isEqualByComparingTo("0.00");
        assertThat(response.paymentSummary().paymentStatus()).isEqualTo(PaymentStatus.PAID);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();
        assertThat(savedPayment.getAmount()).isEqualByComparingTo("11340.00");
        assertThat(savedPayment.getPaymentMethod()).isEqualTo(PaymentMethod.CASH);
        assertThat(savedPayment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(savedPayment.getRecordedBy()).isEqualTo(staffUser);

        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        verify(customerOrderRepository).save(order);
    }

    @Test
    @DisplayName("2. Existing partial payments cause only the remaining amount to be recorded")
    void recordPayment_whenExistingPartialPayments_recordsOnlyRemainingAmount() {
        // Given: Order total 10,000.00, existing paid 4,000.00 -> remaining 6,000.00
        Long orderId = 102L;
        BigDecimal orderTotal = new BigDecimal("10000.00");
        BigDecimal paidBefore = new BigDecimal("4000.00");
        CustomerOrder order = createOrder(orderId, orderTotal, OrderStatus.CONFIRMED, PaymentStatus.PARTIALLY_PAID);

        mockCurrentUser();
        when(customerOrderRepository.findDetailedByIdForUpdate(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.calculatePaidAmountByOrderId(orderId)).thenReturn(paidBefore);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecordPaymentRequest request = new RecordPaymentRequest(
                PaymentMethod.CARD,
                "REF-CARD-999",
                "Remaining balance settled"
        );

        // When
        PaymentRecordResponse response = billingService.recordPayment(orderId, request);

        // Then
        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment savedPayment = paymentCaptor.getValue();
        assertThat(savedPayment.getAmount()).isEqualByComparingTo("6000.00");
        assertThat(savedPayment.getPaymentMethod()).isEqualTo(PaymentMethod.CARD);

        assertThat(response.paymentSummary().totalAmount()).isEqualByComparingTo("10000.00");
        assertThat(response.paymentSummary().paidAmount()).isEqualByComparingTo("10000.00");
        assertThat(response.paymentSummary().remainingAmount()).isEqualByComparingTo("0.00");
        assertThat(response.paymentSummary().paymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    @DisplayName("3. Already-paid order is rejected")
    void recordPayment_whenOrderAlreadyPaid_rejectsWithBadRequest() {
        Long orderId = 103L;
        CustomerOrder order = createOrder(orderId, new BigDecimal("5000.00"), OrderStatus.CONFIRMED, PaymentStatus.PAID);

        mockCurrentUser();
        when(customerOrderRepository.findDetailedByIdForUpdate(orderId)).thenReturn(Optional.of(order));

        RecordPaymentRequest request = new RecordPaymentRequest(
                PaymentMethod.CASH,
                null,
                null
        );

        assertThatThrownBy(() -> billingService.recordPayment(orderId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already been fully paid");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("4. Cancelled order is rejected")
    void recordPayment_whenOrderCancelled_rejectsWithBadRequest() {
        Long orderId = 104L;
        CustomerOrder order = createOrder(orderId, new BigDecimal("5000.00"), OrderStatus.CANCELLED, PaymentStatus.PENDING);

        mockCurrentUser();
        when(customerOrderRepository.findDetailedByIdForUpdate(orderId)).thenReturn(Optional.of(order));

        RecordPaymentRequest request = new RecordPaymentRequest(PaymentMethod.CASH, null, null);

        assertThatThrownBy(() -> billingService.recordPayment(orderId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cancelled order");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("5. Rejected order is rejected")
    void recordPayment_whenOrderRejected_rejectsWithBadRequest() {
        Long orderId = 105L;
        CustomerOrder order = createOrder(orderId, new BigDecimal("5000.00"), OrderStatus.REJECTED, PaymentStatus.PENDING);

        mockCurrentUser();
        when(customerOrderRepository.findDetailedByIdForUpdate(orderId)).thenReturn(Optional.of(order));

        RecordPaymentRequest request = new RecordPaymentRequest(PaymentMethod.CASH, null, null);

        assertThatThrownBy(() -> billingService.recordPayment(orderId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("rejected order");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("6. Missing payment method is rejected")
    void recordPayment_whenMissingPaymentMethod_rejectsWithBadRequest() {
        Long orderId = 106L;
        RecordPaymentRequest request = new RecordPaymentRequest(null, null, null);

        assertThatThrownBy(() -> billingService.recordPayment(orderId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Payment method is required");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("7. Client cannot submit a custom payment amount - RecordPaymentRequest has no amount field")
    void recordPayment_clientCannotSubmitCustomPaymentAmount() {
        RecordComponent[] components = RecordPaymentRequest.class.getRecordComponents();
        boolean hasAmountField = Arrays.stream(components)
                .anyMatch(rc -> rc.getName().equalsIgnoreCase("amount"));

        assertThat(hasAmountField)
                .as("RecordPaymentRequest must not have an editable amount field")
                .isFalse();
    }

    @Test
    @DisplayName("8. Concurrency / Two simultaneous submissions do not create duplicate full payments")
    void recordPayment_concurrencySimultaneousSubmissions_preventsDuplicateFullPayment() {
        Long orderId = 108L;
        BigDecimal orderTotal = new BigDecimal("8000.00");
        CustomerOrder order = createOrder(orderId, orderTotal, OrderStatus.CONFIRMED, PaymentStatus.PENDING);

        mockCurrentUser();
        when(customerOrderRepository.findDetailedByIdForUpdate(orderId)).thenReturn(Optional.of(order));
        when(paymentRepository.calculatePaidAmountByOrderId(orderId)).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecordPaymentRequest request1 = new RecordPaymentRequest(PaymentMethod.CASH, "", "Submission 1");
        RecordPaymentRequest request2 = new RecordPaymentRequest(PaymentMethod.CASH, "", "Submission 2");

        // First request succeeds
        PaymentRecordResponse response1 = billingService.recordPayment(orderId, request1);
        assertThat(response1.paymentSummary().paymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);

        // Second simultaneous request arrives (order status is now PAID)
        assertThatThrownBy(() -> billingService.recordPayment(orderId, request2))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already been fully paid");

        // Verify save was called only once
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }
}
