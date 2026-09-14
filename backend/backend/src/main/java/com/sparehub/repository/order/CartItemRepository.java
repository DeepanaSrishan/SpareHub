package com.sparehub.repository.order;



import com.sparehub.entity.order.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findAllByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndSparePartId(
            Long cartId,
            Long sparePartId
    );

    void deleteAllByCartId(Long cartId);
}
