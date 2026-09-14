package com.sparehub.controller.inventory;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.inventory.sparepart.SparePartCreateRequest;
import com.sparehub.dto.inventory.sparepart.SparePartResponse;
import com.sparehub.dto.inventory.sparepart.SparePartStatusRequest;
import com.sparehub.dto.inventory.sparepart.SparePartUpdateRequest;
import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.service.inventory.SparePartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/spare-parts")
@RequiredArgsConstructor
public class SparePartController {

    private final SparePartService sparePartService;

    @PostMapping
    public ResponseEntity<
            ApiResponse<SparePartResponse>
            >
    createSparePart(
            @Valid
            @RequestBody
            SparePartCreateRequest request
    ) {
        SparePartResponse sparePart =
                sparePartService.createSparePart(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Spare part created successfully",
                                sparePart
                        )
                );
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<Page<SparePartResponse>>
            >
    getSpareParts(
            @RequestParam(defaultValue = "")
            String search,

            @RequestParam(required = false)
            SparePartStatus status,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "name")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction
    ) {
        Page<SparePartResponse> spareParts =
                sparePartService
                        .getInventorySpareParts(
                                search,
                                status,
                                categoryId,
                                page,
                                size,
                                sortBy,
                                direction
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare parts retrieved successfully",
                        spareParts
                )
        );
    }

    @GetMapping("/{sparePartId}")
    public ResponseEntity<
            ApiResponse<SparePartResponse>
            >
    getSparePartById(
            @PathVariable Long sparePartId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare part retrieved successfully",
                        sparePartService
                                .getSparePartById(
                                        sparePartId
                                )
                )
        );
    }

    @PutMapping("/{sparePartId}")
    public ResponseEntity<
            ApiResponse<SparePartResponse>
            >
    updateSparePart(
            @PathVariable
            Long sparePartId,

            @Valid
            @RequestBody
            SparePartUpdateRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare part updated successfully",
                        sparePartService
                                .updateSparePart(
                                        sparePartId,
                                        request
                                )
                )
        );
    }

    @PatchMapping("/{sparePartId}/status")
    public ResponseEntity<
            ApiResponse<SparePartResponse>
            >
    updateSparePartStatus(
            @PathVariable
            Long sparePartId,

            @Valid
            @RequestBody
            SparePartStatusRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare-part status updated successfully",
                        sparePartService
                                .updateSparePartStatus(
                                        sparePartId,
                                        request
                                )
                )
        );
    }

    /*
     * DELETE request එක database row එක physically delete
     * කරන්නේ නැහැ. DISCONTINUED status එකට මාරු කරනවා.
     */
    @DeleteMapping("/{sparePartId}")
    public ResponseEntity<
            ApiResponse<SparePartResponse>
            >
    discontinueSparePart(
            @PathVariable Long sparePartId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare part discontinued successfully",
                        sparePartService
                                .discontinueSparePart(
                                        sparePartId
                                )
                )
        );
    }
}
