package com.sparehub.backend.repository;

import com.sparehub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_CUSTOMER' ORDER BY u.id DESC")
    List<User> findAllCustomers();

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_CUSTOMER' AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchCustomers(@Param("query") String query);

    @Query("SELECT u FROM User u ORDER BY u.id DESC")
    List<User> findAllUsersOrdered();
}
