package com.sparehub.repository.order;



import com.sparehub.entity.order.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;


import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    Optional<Cart> findByCustomerId(Long customerId);

    @EntityGraph(attributePaths = {
            "customer",
            "items",
            "items.sparePart"
    })
    Optional<Cart> findByCustomerEmail(String email);
}