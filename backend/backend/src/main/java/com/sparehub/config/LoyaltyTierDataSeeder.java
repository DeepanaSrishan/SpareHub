package com.sparehub.config;

import com.sparehub.entity.LoyaltyTier;
import com.sparehub.repository.LoyaltyTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class LoyaltyTierDataSeeder {

    @Bean
    public CommandLineRunner seedLoyaltyTiers(
            LoyaltyTierRepository loyaltyTierRepository
    ) {
        return args -> {

            if (loyaltyTierRepository.count() > 0) {
                return;
            }

            List<LoyaltyTier> tiers = List.of(

                    createTier(
                            "Bronze",
                            0,
                            "0.00",
                            "Starting loyalty tier",
                            1
                    ),

                    createTier(
                            "Silver",
                            500,
                            "5.00",
                            "Earn a 5% discount",
                            2
                    ),

                    createTier(
                            "Gold",
                            1500,
                            "10.00",
                            "Earn a 10% discount",
                            3
                    ),

                    createTier(
                            "Platinum",
                            3000,
                            "15.00",
                            "Earn a 15% discount",
                            4
                    )
            );

            loyaltyTierRepository.saveAll(tiers);
        };
    }

    private LoyaltyTier createTier(
            String name,
            int minimumPoints,
            String discountPercentage,
            String description,
            int displayOrder
    ) {
        return LoyaltyTier.builder()
                .name(name)
                .minimumPoints(minimumPoints)
                .discountPercentage(
                        new BigDecimal(discountPercentage)
                )
                .description(description)
                .displayOrder(displayOrder)
                .active(true)
                .build();
    }
}