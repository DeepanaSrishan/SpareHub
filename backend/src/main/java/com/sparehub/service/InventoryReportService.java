package com.sparehub.service;

import com.sparehub.dto.InventorySummaryDTO;
import com.sparehub.repository.SparePartRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class InventoryReportService {

    private final SparePartRepository sparePartRepository;

    public InventoryReportService(SparePartRepository sparePartRepository) {
        this.sparePartRepository = sparePartRepository;
    }

    public InventorySummaryDTO getInventorySummary() {
        InventorySummaryDTO summary = new InventorySummaryDTO();

        summary.setTotalSpareParts(sparePartRepository.count());
        summary.setActiveSpareParts(sparePartRepository.findByActiveTrueOrderByCreatedAtDesc().size());
        
        int totalStock = sparePartRepository.findAll().stream()
                .mapToInt(sp -> sp.getStockQuantity())
                .sum();
        summary.setTotalStockQuantity((long) totalStock);

        summary.setLowStockCount((long) sparePartRepository.findLowStockItems().size());
        summary.setOutOfStockCount((long) sparePartRepository.findOutOfStockItems().size());

        BigDecimal totalValue = sparePartRepository.findAll().stream()
                .map(sp -> sp.getPrice().multiply(BigDecimal.valueOf(sp.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalStockValue(totalValue);

        return summary;
    }
}
