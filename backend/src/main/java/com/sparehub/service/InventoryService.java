package com.sparehub.service;

import com.sparehub.dto.SparePartDTO;
import com.sparehub.dto.StockUpdateRequest;
import com.sparehub.entity.InventoryTransaction;
import com.sparehub.entity.SparePart;
import com.sparehub.entity.User;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.repository.SparePartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final SparePartRepository sparePartRepository;
    private final InventoryTransactionService inventoryTransactionService;

    public InventoryService(SparePartRepository sparePartRepository, InventoryTransactionService inventoryTransactionService) {
        this.sparePartRepository = sparePartRepository;
        this.inventoryTransactionService = inventoryTransactionService;
    }

    public SparePartDTO updateStock(Long sparePartId, StockUpdateRequest stockUpdateRequest, User user) {
        SparePart sparePart = sparePartRepository.findById(sparePartId)
                .orElseThrow(() -> new ResourceNotFoundException("SparePart", sparePartId));

        int currentStock = sparePart.getStockQuantity();
        int quantityChange = stockUpdateRequest.getQuantity();
        int newStock = currentStock + quantityChange;

        if (newStock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative. Current stock: " + currentStock + ", Attempted change: " + quantityChange);
        }

        sparePart.setStockQuantity(newStock);
        sparePart = sparePartRepository.save(sparePart);

        inventoryTransactionService.createTransaction(sparePart, stockUpdateRequest.getTransactionType(),
                currentStock, quantityChange, newStock, stockUpdateRequest.getReason(), user);

        return convertToDTO(sparePart);
    }

    private SparePartDTO convertToDTO(SparePart sparePart) {
        SparePartDTO dto = new SparePartDTO();
        dto.setId(sparePart.getId());
        dto.setPartNumber(sparePart.getPartNumber());
        dto.setName(sparePart.getName());
        dto.setDescription(sparePart.getDescription());
        dto.setBrand(sparePart.getBrand());
        dto.setCategoryId(sparePart.getCategory().getId());
        dto.setCategoryName(sparePart.getCategory().getName());
        dto.setPrice(sparePart.getPrice());
        dto.setStockQuantity(sparePart.getStockQuantity());
        dto.setReorderLevel(sparePart.getReorderLevel());
        dto.setImageUrl(sparePart.getImageUrl());
        dto.setActive(sparePart.getActive());
        dto.setAvailabilityStatus(sparePart.getAvailabilityStatus());

        if (sparePart.getSubCategory() != null) {
            dto.setSubCategoryId(sparePart.getSubCategory().getId());
            dto.setSubCategoryName(sparePart.getSubCategory().getName());
        }

        return dto;
    }
}
