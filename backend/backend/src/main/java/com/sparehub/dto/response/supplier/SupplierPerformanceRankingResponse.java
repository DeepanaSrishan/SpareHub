package com.sparehub.dto.response.supplier;

import java.util.List;

public record SupplierPerformanceRankingResponse(

        int totalSuppliers,
        List<SupplierPerformanceResponse> suppliers

) {
}
