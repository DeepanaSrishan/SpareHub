package com.sparehub.entity;

import com.sparehub.enums.LoyaltyTransactionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "loyalty_transactions",
        indexes = {
                @Index(
                        name = "idx_loyalty_transaction_customer",
                        columnList = "customer_id"
                ),
                @Index(
                        name = "idx_loyalty_transaction_order",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_loyalty_transaction_type",
                        columnList = "transaction_type"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "customer_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_loyalty_transaction_customer"
            )
    )
    private User customer;

    /*
     * Order entity එක Epic 3 එකේදී හදන නිසා
     * දැනට order ID එකක් ලෙස save කරනවා.
     */
    @Column(name = "order_id")
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "transaction_type",
            nullable = false,
            length = 30
    )
    private LoyaltyTransactionType transactionType;

    /*
     * Earned points = positive value
     * Redeemed/expired points = negative value
     */
    @Column(
            name = "points",
            nullable = false
    )
    private Integer points;

    @Column(
            name = "balance_after",
            nullable = false
    )
    private Integer balanceAfter;

    @Column(
            name = "description",
            nullable = false,
            length = 500
    )
    private String description;

    /*
     * Sales Staff හෝ Manager adjustment එකක් නම්
     * ඒ action එක කළ userගේ ID එක.
     */
    @Column(name = "performed_by_user_id")
    private Long performedByUserId;
}