package com.sparehub.controller.supplier;



import com.sparehub.dto.response.ApiResponse;
<<<<<<< HEAD
import com.sparehub.dto.response.supplier.SupplierPerformanceRankingResponse;
import com.sparehub.dto.response.supplier.SupplierPerformanceResponse;
=======
import com.sparehub.dto.response.SupplierPerformanceRankingResponse;
import com.sparehub.dto.response.SupplierPerformanceResponse;
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
import com.sparehub.service.supplier.SupplierPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/manager/suppliers")
@RequiredArgsConstructor
<<<<<<< HEAD
@PreAuthorize("hasAnyRole('MANAGER', 'INVENTORY_STAFF')")
=======
@PreAuthorize("hasRole('MANAGER')")
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
public class SupplierPerformanceController {

    private final SupplierPerformanceService
            supplierPerformanceService;

    @GetMapping("/{supplierId}/performance")
    public ResponseEntity<ApiResponse<SupplierPerformanceResponse>>
    getSupplierPerformance(
            @PathVariable Long supplierId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        SupplierPerformanceResponse response =
                supplierPerformanceService.getSupplierPerformance(
                        supplierId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier performance retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/performance")
    public ResponseEntity<
            ApiResponse<SupplierPerformanceRankingResponse>
            > getAllSupplierPerformance(

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        SupplierPerformanceRankingResponse response =
                supplierPerformanceService
                        .getAllSupplierPerformance(
                                startDate,
                                endDate
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Supplier performance ranking retrieved successfully",
                        response
                )
        );
    }
}