package com.sparehub.dto.supplier;



import java.util.List;

public record SupplierPerformanceRankingResponse(

        int totalSuppliers,
        List<SupplierPerformanceResponse> suppliers

) {
}
