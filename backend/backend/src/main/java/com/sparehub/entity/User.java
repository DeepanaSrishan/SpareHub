package com.sparehub.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(
                        name = "idx_user_full_name",
                        columnList = "full_name"
                ),
                @Index(
                        name = "idx_user_email",
                        columnList = "email"
                ),
                @Index(
                        name = "idx_user_role",
                        columnList = "role"
                ),
                @Index(
                        name = "idx_user_account_status",
                        columnList = "account_status"
                ),
                @Index(
                        name = "idx_user_last_purchase",
                        columnList = "last_purchase_at"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_email",
                        columnNames = "email"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "full_name",
            nullable = false,
            length = 120
    )
    private String fullName;

    @Column(
            name = "email",
            nullable = false,
            length = 150
    )
    private String email;

    @JsonIgnore
    @Column(
            name = "password",
            nullable = false,
            length = 255
    )
    private String password;

    @Column(
            name = "phone",
            length = 20
    )
    private String phone;

    @Column(
            name = "address",
            length = 500
    )
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "role",
            nullable = false,
            length = 30
    )
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "account_status",
            nullable = false,
            length = 30
    )
    private AccountStatus accountStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "loyalty_tier_id",
            foreignKey = @ForeignKey(
                    name = "fk_user_loyalty_tier"
            )
    )
    private LoyaltyTier loyaltyTier;

    @Column(
            name = "loyalty_points",
            nullable = false
    )
    private Integer loyaltyPoints;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_purchase_at")
    private LocalDateTime lastPurchaseAt;

    @Column(name = "welcome_message_sent", nullable = false)
    private Boolean welcomeMessageSent;

    @PrePersist
    public void applyDefaults() {

        if (role == null) {
            role = Role.CUSTOMER;
        }

        if (accountStatus == null) {
            accountStatus = AccountStatus.ACTIVE;
        }

        if (loyaltyPoints == null) {
            loyaltyPoints = 0;
        }

        if (welcomeMessageSent == null) {
            welcomeMessageSent = false;
        }

        normalizeEmail();
    }

    @PreUpdate
    public void beforeUpdate() {
        normalizeEmail();
    }

    private void normalizeEmail() {
        if (email != null) {
            email = email
                    .trim()
                    .toLowerCase();
        }
    }

    public boolean canLogin() {
        return accountStatus != AccountStatus.SUSPENDED
                && accountStatus
                != AccountStatus.DEACTIVATED;
    }

    public boolean isCustomer() {
        return role == Role.CUSTOMER;
    }
}