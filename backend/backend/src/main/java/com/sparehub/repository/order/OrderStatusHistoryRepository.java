package com.sparehub.repository.order;



import com.sparehub.entity.order.OrderStatusHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderStatusHistoryRepository
        extends JpaRepository<OrderStatusHistory, Long> {

    @EntityGraph(attributePaths = {
            "changedBy"
    })
    List<OrderStatusHistory>
    findAllByOrderIdOrderByChangedAtAsc(Long orderId);
}
