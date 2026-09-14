package com.sparehub.repository.order;



import com.sparehub.entity.order.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;


import java.util.Optional;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    @EntityGraph(attributePaths = {
            "order",
            "order.customer",
            "order.items",
            "order.items.sparePart",
            "generatedBy"
    })
    Optional<Invoice> findByInvoiceNumber(
            String invoiceNumber
    );

    @EntityGraph(attributePaths = {
            "order",
            "order.customer",
            "order.items",
            "order.items.sparePart",
            "generatedBy"
    })
    Optional<Invoice> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);

    boolean existsByInvoiceNumber(String invoiceNumber);
}
