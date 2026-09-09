package com.sparehub.backend.repository;

import com.sparehub.backend.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, Integer> {
    Optional<LoyaltyTier> findByTierName(String tierName);
    List<LoyaltyTier> findAllByOrderByMinSpendAmountAsc();
}
