package com.sparehub.backend.service;

import com.sparehub.backend.dto.OrderDto;
import com.sparehub.backend.entity.Order;
import com.sparehub.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // US-09: Sales Staff views customer order & transaction history
    public List<OrderDto> getCustomerOrders(Integer customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return orders.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // US-09: Sales Staff views customer transaction summary
    public Map<String, Object> getCustomerTransactionSummary(Integer customerId) {
        BigDecimal totalSpend = orderRepository.sumTotalSpendByCustomerId(customerId);
        Long orderCount = orderRepository.countOrdersByCustomerId(customerId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSpend", totalSpend != null ? totalSpend : BigDecimal.ZERO);
        summary.put("orderCount", orderCount != null ? orderCount : 0L);
        return summary;
    }

    private OrderDto mapToDto(Order order) {
        return new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getItemsSummary(),
                order.getCreatedAt()
        );
    }
}
