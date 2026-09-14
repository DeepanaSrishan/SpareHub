package com.sparehub.controller.inventory;

import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.catalog.CatalogSparePartResponse;
import com.sparehub.dto.catalog.SparePartAvailabilityResponse;
import com.sparehub.service.inventory.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogSparePartController {

    private final CatalogService catalogService;

    @GetMapping("/spare-parts")
    public ResponseEntity<
            ApiResponse<
                    Page<CatalogSparePartResponse>
                    >
            >
    searchSpareParts(
            @RequestParam(defaultValue = "")
            String search,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(defaultValue = "")
            String brand,

            @RequestParam(required = false)
            BigDecimal minimumPrice,

            @RequestParam(required = false)
            BigDecimal maximumPrice,

            @RequestParam(required = false)
            Boolean available,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "12")
            int size,

            @RequestParam(defaultValue = "name")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction
    ) {
        Page<CatalogSparePartResponse> products =
                catalogService.searchSpareParts(
                        search,
                        categoryId,
                        brand,
                        minimumPrice,
                        maximumPrice,
                        available,
                        page,
                        size,
                        sortBy,
                        direction
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare parts retrieved successfully",
                        products
                )
        );
    }

    @GetMapping("/spare-parts/{sparePartId}")
    public ResponseEntity<
            ApiResponse<CatalogSparePartResponse>
            >
    getSparePartDetails(
            @PathVariable
            Long sparePartId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare-part details retrieved successfully",
                        catalogService
                                .getSparePartDetails(
                                        sparePartId
                                )
                )
        );
    }

    @GetMapping(
            "/spare-parts/{sparePartId}/availability"
    )
    public ResponseEntity<
            ApiResponse<
                    SparePartAvailabilityResponse
                    >
            >
    getAvailability(
            @PathVariable
            Long sparePartId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Availability retrieved successfully",
                        catalogService
                                .getAvailability(
                                        sparePartId
                                )
                )
        );
    }

    @GetMapping("/brands")
    public ResponseEntity<
            ApiResponse<List<String>>
            >
    getActiveBrands() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Active brands retrieved successfully",
                        catalogService
                                .getActiveBrands()
                )
        );
    }
}