package com.sparehub.controller.order;



import com.sparehub.dto.response.ApiResponse;
import com.sparehub.dto.request.order.AddCartItemRequest;
import com.sparehub.dto.request.order.UpdateCartItemRequest;
import com.sparehub.dto.response.order.CartResponse;
import com.sparehub.service.order.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart() {
        CartResponse response = cartService.getMyCart();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cart retrieved successfully",
                        response
                )
        );
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Valid @RequestBody AddCartItemRequest request
    ) {
        CartResponse response = cartService.addItem(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Spare part added to cart successfully",
                        response
                )
        );
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        CartResponse response = cartService.updateItem(
                cartItemId,
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cart item updated successfully",
                        response
                )
        );
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable Long cartItemId
    ) {
        CartResponse response =
                cartService.removeItem(cartItemId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cart item removed successfully",
                        response
                )
        );
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart() {
        CartResponse response = cartService.clearCart();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cart cleared successfully",
                        response
                )
        );
    }
}
