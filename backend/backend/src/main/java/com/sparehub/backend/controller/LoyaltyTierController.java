package com.sparehub.backend.controller;

import com.sparehub.backend.entity.LoyaltyTier;
import com.sparehub.backend.service.LoyaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty-tiers")
public class LoyaltyTierController {

    private final LoyaltyService loyaltyService;

    public LoyaltyTierController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping
    public ResponseEntity<List<LoyaltyTier>> getAllTiers() {
        return ResponseEntity.ok(loyaltyService.getAllTiers());
    }
}
