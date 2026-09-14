package com.sparehub.repository;

import com.sparehub.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoyaltyTierRepository
        extends JpaRepository<LoyaltyTier, Long> {

    Optional<LoyaltyTier> findByNameIgnoreCase(String name);

    Optional<LoyaltyTier>
    findFirstByActiveTrueOrderByMinimumPointsAsc();

    List<LoyaltyTier>
    findByActiveTrueOrderByMinimumPointsAsc();

    boolean existsByNameIgnoreCase(String name);
}