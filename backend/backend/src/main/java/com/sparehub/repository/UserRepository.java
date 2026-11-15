package com.sparehub.repository;

import com.sparehub.entity.User;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRole(Role role);

    Page<User> findByRole(
            Role role,
            Pageable pageable
    );

    Page<User> findByAccountStatus(
            AccountStatus accountStatus,
            Pageable pageable
    );

    @Query("""
            SELECT user
            FROM User user
            WHERE user.role = :role
            AND (
                LOWER(user.fullName)
                    LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(user.email)
                    LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    Page<User> searchByNameOrEmail(
            @Param("role") Role role,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
            SELECT user
            FROM User user
            WHERE user.role = :customerRole
            AND (
                user.lastPurchaseAt < :cutoffDate
                OR (
                    user.lastPurchaseAt IS NULL
                    AND user.createdAt < :cutoffDate
                )
            )
            """)
    Page<User> findInactiveCustomers(
            @Param("customerRole") Role customerRole,
            @Param("cutoffDate") LocalDateTime cutoffDate,
            Pageable pageable
    );
}