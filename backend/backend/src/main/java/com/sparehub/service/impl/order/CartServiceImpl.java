package com.sparehub.service.impl.order;


import com.sparehub.entity.inventory.SparePartStatus;
import com.sparehub.exception.BadRequestException;
import com.sparehub.exception.ResourceNotFoundException;
import com.sparehub.entity.inventory.SparePart;
import com.sparehub.repository.SparePartRepository;
import com.sparehub.dto.request.order.AddCartItemRequest;
import com.sparehub.dto.request.order.UpdateCartItemRequest;
import com.sparehub.dto.response.order.CartItemResponse;
import com.sparehub.dto.response.order.CartResponse;
import com.sparehub.entity.order.Cart;
import com.sparehub.entity.order.CartItem;
import com.sparehub.repository.order.CartItemRepository;
import com.sparehub.repository.order.CartRepository;
import com.sparehub.service.order.CartService;
import com.sparehub.entity.User;
import com.sparehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final SparePartRepository sparePartRepository;
    private final UserRepository userRepository;

    /*
     * Logged-in customerගේ cart එක return කරනවා.
     * Cart එකක් නැත්නම් automatic create කරනවා.
     */
    @Override
    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        User customer = getCurrentUser();

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElse(null);

        if (cart == null) {
            return createEmptyCartResponse(customer);
        }

        return mapToCartResponse(cart);
    }

    /*
     * New product එකක් cart එකට add කරනවා.
     * එම product එක දැනටමත් තිබුණොත් quantity එකට එකතු කරනවා.
     */
    @Override
    public CartResponse addItem(AddCartItemRequest request) {
        User customer = getCurrentUser();

        SparePart sparePart = sparePartRepository
                .findById(request.sparePartId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Spare part not found with ID: "
                                + request.sparePartId()
                ));

        validateSparePartForCart(sparePart);

        Cart cart = getOrCreateCart(customer);

        CartItem cartItem = cartItemRepository
                .findByCartIdAndSparePartId(
                        cart.getId(),
                        sparePart.getId()
                )
                .orElse(null);

        int requestedQuantity;

        if (cartItem == null) {
            requestedQuantity = request.quantity();
        } else {
            requestedQuantity =
                    cartItem.getQuantity() + request.quantity();
        }

        validateRequestedQuantity(sparePart, requestedQuantity);

        if (cartItem == null) {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setSparePart(sparePart);
            cartItem.setQuantity(request.quantity());
            cartItem.setUnitPrice(sparePart.getSellingPrice());

            cart.getItems().add(cartItem);
        } else {
            cartItem.setQuantity(requestedQuantity);

            // Product price වෙනස් වී ඇත්නම් current price update කරනවා.
            cartItem.setUnitPrice(sparePart.getSellingPrice());
        }

        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    /*
     * Customerට අයිති cart item එකේ quantity update කරනවා.
     */
    @Override
    public CartResponse updateItem(
            Long cartItemId,
            UpdateCartItemRequest request
    ) {
        User customer = getCurrentUser();
        Cart cart = getRequiredCart(customer);

        CartItem cartItem = getCustomerCartItem(
                cart,
                cartItemId
        );

        SparePart sparePart = cartItem.getSparePart();

        validateSparePartForCart(sparePart);
        validateRequestedQuantity(
                sparePart,
                request.quantity()
        );

        cartItem.setQuantity(request.quantity());
        cartItem.setUnitPrice(sparePart.getSellingPrice());

        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    /*
     * Customerට අයිති item එක cart එකෙන් remove කරනවා.
     */
    @Override
    public CartResponse removeItem(Long cartItemId) {
        User customer = getCurrentUser();
        Cart cart = getRequiredCart(customer);

        CartItem cartItem = getCustomerCartItem(
                cart,
                cartItemId
        );

        cart.removeItem(cartItem);

        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    /*
     * Logged-in customerගේ cart එක සම්පූර්ණයෙන් clear කරනවා.
     */
    @Override
    public CartResponse clearCart() {
        User customer = getCurrentUser();

        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElse(null);

        if (cart == null) {
            return createEmptyCartResponse(customer);
        }

        cart.clearItems();
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new BadRequestException(
                    "Authenticated customer is required"
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user account was not found"
                        )
                );
    }

    private Cart getOrCreateCart(User customer) {
        return cartRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setCustomer(customer);
                    return cartRepository.save(cart);
                });
    }

    private Cart getRequiredCart(User customer) {
        return cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart was not found"
                ));
    }

    private CartItem getCustomerCartItem(
            Cart cart,
            Long cartItemId
    ) {
        return cart.getItems()
                .stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item not found with ID: " + cartItemId
                ));
    }

    private void validateSparePartForCart(SparePart sparePart) {
        if (sparePart.getStatus() != SparePartStatus.ACTIVE) {
            throw new BadRequestException(
                    "This spare part is inactive or discontinued"
            );
        }

        if (sparePart.getStockQuantity() == null
                || sparePart.getStockQuantity() <= 0) {
            throw new BadRequestException(
                    "This spare part is currently out of stock"
            );
        }

        if (sparePart.getSellingPrice() == null
                || sparePart.getSellingPrice()
                .compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                    "This spare part does not have a valid selling price"
            );
        }
    }

    private void validateRequestedQuantity(
            SparePart sparePart,
            Integer requestedQuantity
    ) {
        if (requestedQuantity == null || requestedQuantity < 1) {
            throw new BadRequestException(
                    "Quantity must be at least 1"
            );
        }

        if (requestedQuantity > sparePart.getStockQuantity()) {
            throw new BadRequestException(
                    "Requested quantity exceeds available stock. "
                            + "Available stock: "
                            + sparePart.getStockQuantity()
            );
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems()
                .stream()
                .sorted(Comparator.comparing(CartItem::getId))
                .map(this::mapToItemResponse)
                .toList();

        int totalQuantity = itemResponses.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        User customer = cart.getCustomer();

        return new CartResponse(
                cart.getId(),
                customer.getId(),
                getCustomerName(customer),
                customer.getEmail(),
                itemResponses,
                itemResponses.size(),
                totalQuantity,
                subtotal
        );
    }

    private CartItemResponse mapToItemResponse(CartItem cartItem) {
        SparePart sparePart = cartItem.getSparePart();

        BigDecimal unitPrice = sparePart.getSellingPrice();

        if (unitPrice == null) {
            unitPrice = cartItem.getUnitPrice();
        }

        BigDecimal subtotal = unitPrice.multiply(
                BigDecimal.valueOf(cartItem.getQuantity())
        );

        boolean available =
                sparePart.getStatus() == SparePartStatus.ACTIVE
                        && sparePart.getStockQuantity() != null
                        && sparePart.getStockQuantity()
                        >= cartItem.getQuantity();

        return new CartItemResponse(
                cartItem.getId(),
                sparePart.getId(),
                sparePart.getPartNumber(),
                sparePart.getName(),
                sparePart.getBrand(),
                sparePart.getImageUrl(),
                unitPrice,
                cartItem.getQuantity(),
                sparePart.getStockQuantity(),
                subtotal,
                available
        );
    }

    private CartResponse createEmptyCartResponse(User customer) {
        return new CartResponse(
                null,
                customer.getId(),
                getCustomerName(customer),
                customer.getEmail(),
                List.of(),
                0,
                0,
                BigDecimal.ZERO
        );
    }

    private String getCustomerName(User customer) {
        if (customer == null
                || customer.getFullName() == null) {
            return "";
        }

        return customer.getFullName().trim();
    }
}
