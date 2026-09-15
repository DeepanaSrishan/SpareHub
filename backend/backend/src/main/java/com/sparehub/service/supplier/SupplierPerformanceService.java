package com.sparehub.service.supplier;



import com.sparehub.dto.response.supplier.SupplierPerformanceRankingResponse;
import com.sparehub.dto.response.supplier.SupplierPerformanceResponse;

import java.time.LocalDate;

public interface SupplierPerformanceService {

    SupplierPerformanceResponse getSupplierPerformance(
            Long supplierId,
            LocalDate startDate,
            LocalDate endDate
    );

    SupplierPerformanceRankingResponse getAllSupplierPerformance(
            LocalDate startDate,
            LocalDate endDate
    );
}