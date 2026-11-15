package com.sparehub.service.order;



import com.sparehub.dto.request.order.AddCartItemRequest;
import com.sparehub.dto.request.order.UpdateCartItemRequest;
import com.sparehub.dto.response.order.CartResponse;

public interface CartService {

    CartResponse getMyCart();

    CartResponse addItem(AddCartItemRequest request);

    CartResponse updateItem(
            Long cartItemId,
            UpdateCartItemRequest request
    );

    CartResponse removeItem(Long cartItemId);

    CartResponse clearCart();
}