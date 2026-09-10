package com.sparehub.service;

import com.sparehub.dto.InventoryTransactionDTO;
import com.sparehub.entity.InventoryTransaction;
import com.sparehub.entity.SparePart;
import com.sparehub.entity.User;
import com.sparehub.repository.InventoryTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryTransactionService {

    private final InventoryTransactionRepository inventoryTransactionRepository;

    public InventoryTransactionService(InventoryTransactionRepository inventoryTransactionRepository) {
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    @Transactional
    public InventoryTransactionDTO createTransaction(SparePart sparePart, String transactionType,
                                                    int quantityBefore, int quantityChanged, int quantityAfter,
                                                    String reason, User user) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setSparePart(sparePart);
        transaction.setTransactionType(transactionType);
        transaction.setQuantityBefore(quantityBefore);
        transaction.setQuantityChanged(quantityChanged);
        transaction.setQuantityAfter(quantityAfter);
        transaction.setReason(reason);
        transaction.setUser(user);

        transaction = inventoryTransactionRepository.save(transaction);
        return convertToDTO(transaction);
    }

    public List<InventoryTransactionDTO> getAllTransactions() {
        return inventoryTransactionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryTransactionDTO> getTransactionsBySparePart(Long sparePartId) {
        return inventoryTransactionRepository.findBySparePartIdOrderByCreatedAtDesc(sparePartId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryTransactionDTO> getTransactionsByUser(Long userId) {
        return inventoryTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryTransactionDTO> getTransactionsByType(String transactionType) {
        return inventoryTransactionRepository.findByTransactionTypeOrderByCreatedAtDesc(transactionType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryTransactionDTO> filterTransactions(Long sparePartId, String transactionType,
                                                           LocalDateTime startDate, LocalDateTime endDate) {
        return inventoryTransactionRepository.filterTransactions(sparePartId, transactionType, startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private InventoryTransactionDTO convertToDTO(InventoryTransaction transaction) {
        InventoryTransactionDTO dto = new InventoryTransactionDTO();
        dto.setId(transaction.getId());
        dto.setSparePartId(transaction.getSparePart().getId());
        dto.setPartNumber(transaction.getSparePart().getPartNumber());
        dto.setPartName(transaction.getSparePart().getName());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setQuantityBefore(transaction.getQuantityBefore());
        dto.setQuantityChanged(transaction.getQuantityChanged());
        dto.setQuantityAfter(transaction.getQuantityAfter());
        dto.setReason(transaction.getReason());
        dto.setUserId(transaction.getUser().getId());
        dto.setUserName(transaction.getUser().getFirstName() + " " + transaction.getUser().getLastName());
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }
}
