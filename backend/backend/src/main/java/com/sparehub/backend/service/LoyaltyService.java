package com.sparehub.backend.service;

import com.sparehub.backend.dto.CustomerSummaryDto;
import com.sparehub.backend.entity.LoyaltyTier;
import com.sparehub.backend.entity.User;
import com.sparehub.backend.repository.LoyaltyTierRepository;
import com.sparehub.backend.repository.OrderRepository;
import com.sparehub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class LoyaltyService {

    private final UserRepository userRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final OrderRepository orderRepository;

    public LoyaltyService(UserRepository userRepository,
                          LoyaltyTierRepository loyaltyTierRepository,
                          OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.loyaltyTierRepository = loyaltyTierRepository;
        this.orderRepository = orderRepository;
    }

    public List<LoyaltyTier> getAllTiers() {
        return loyaltyTierRepository.findAllByOrderByMinSpendAmountAsc();
    }

    // US-05: Get all customers with their purchase history and loyalty tier
    public List<CustomerSummaryDto> getAllCustomersWithSpendAndTier() {
        List<User> customers = userRepository.findAllCustomers();
        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByOrderByMinSpendAmountAsc();
        List<CustomerSummaryDto> result = new ArrayList<>();

        for (User c : customers) {
            result.add(buildCustomerSummaryDto(c, tiers));
        }
        return result;
    }

    public List<CustomerSummaryDto> searchCustomers(String query) {
        List<User> customers = (query == null || query.trim().isEmpty())
                ? userRepository.findAllCustomers()
                : userRepository.searchCustomers(query.trim());
        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByOrderByMinSpendAmountAsc();
        List<CustomerSummaryDto> result = new ArrayList<>();

        for (User c : customers) {
            result.add(buildCustomerSummaryDto(c, tiers));
        }
        return result;
    }

    // US-05: Sales Staff manually assigns a loyalty tier
    @Transactional
    public CustomerSummaryDto assignLoyaltyTier(Integer customerId, Integer tierId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        LoyaltyTier tier = loyaltyTierRepository.findById(tierId)
                .orElseThrow(() -> new RuntimeException("Loyalty tier not found with id: " + tierId));

        customer.setLoyaltyTier(tier);
        User updated = userRepository.save(customer);

        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByOrderByMinSpendAmountAsc();
        return buildCustomerSummaryDto(updated, tiers);
    }

    // US-05: Sales Staff triggers 1-click auto tier assignment based on purchase history
    @Transactional
    public CustomerSummaryDto autoAssignTierBasedOnSpend(Integer customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        BigDecimal totalSpend = orderRepository.sumTotalSpendByCustomerId(customerId);
        if (totalSpend == null) totalSpend = BigDecimal.ZERO;

        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByOrderByMinSpendAmountAsc();
        LoyaltyTier bestTier = null;

        for (LoyaltyTier t : tiers) {
            if (totalSpend.compareTo(t.getMinSpendAmount()) >= 0) {
                bestTier = t;
            }
        }

        if (bestTier != null) {
            customer.setLoyaltyTier(bestTier);
            userRepository.save(customer);
        }

        return buildCustomerSummaryDto(customer, tiers);
    }

    private CustomerSummaryDto buildCustomerSummaryDto(User user, List<LoyaltyTier> tiers) {
        BigDecimal totalSpend = orderRepository.sumTotalSpendByCustomerId(user.getId());
        if (totalSpend == null) totalSpend = BigDecimal.ZERO;
        Long orderCount = orderRepository.countOrdersByCustomerId(user.getId());

        // Determine suggested tier based on purchase spend
        LoyaltyTier suggestedTier = null;
        for (LoyaltyTier t : tiers) {
            if (totalSpend.compareTo(t.getMinSpendAmount()) >= 0) {
                suggestedTier = t;
            }
        }

        CustomerSummaryDto dto = new CustomerSummaryDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setIsActive(user.getIsActive());
        dto.setTotalSpend(totalSpend);
        dto.setOrderCount(orderCount != null ? orderCount : 0L);

        if (user.getLoyaltyTier() != null) {
            dto.setLoyaltyTierId(user.getLoyaltyTier().getId());
            dto.setLoyaltyTierName(user.getLoyaltyTier().getTierName());
            dto.setDiscountPercentage(user.getLoyaltyTier().getDiscountPercentage().doubleValue());
        } else {
            dto.setLoyaltyTierName("Bronze");
            dto.setDiscountPercentage(0.0);
        }

        if (suggestedTier != null) {
            dto.setSuggestedTierId(suggestedTier.getId());
            dto.setSuggestedTierName(suggestedTier.getTierName());
        }

        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
