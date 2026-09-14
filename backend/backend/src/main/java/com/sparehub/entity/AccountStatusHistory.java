package com.sparehub.entity;

import com.sparehub.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "account_status_history",
        indexes = {
                @Index(
                        name = "idx_status_history_customer",
                        columnList = "customer_id"
                ),
                @Index(
                        name = "idx_status_history_performed_by",
                        columnList = "performed_by_user_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountStatusHistory extends BaseEntity {

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
                    name = "fk_status_history_customer"
            )
    )
    private User customer;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "previous_status",
            nullable = false,
            length = 30
    )
    private AccountStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "new_status",
            nullable = false,
            length = 30
    )
    private AccountStatus newStatus;

    @Column(
            name = "reason",
            nullable = false,
            length = 500
    )
    private String reason;

    @Column(
            name = "performed_by_user_id",
            nullable = false
    )
    private Long performedByUserId;

    @Column(
            name = "performed_by_name",
            nullable = false,
            length = 120
    )
    private String performedByName;
}