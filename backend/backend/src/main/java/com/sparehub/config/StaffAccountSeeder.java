package com.sparehub.config;

import com.sparehub.entity.User;
import com.sparehub.enums.AccountStatus;
import com.sparehub.enums.Role;
import com.sparehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class StaffAccountSeeder
        implements CommandLineRunner {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${sparehub.bootstrap.manager-email:}")
    private String managerEmail;

    @Value("${sparehub.bootstrap.manager-password:}")
    private String managerPassword;

    @Value("${sparehub.bootstrap.sales-email:}")
    private String salesEmail;

    @Value("${sparehub.bootstrap.sales-password:}")
    private String salesPassword;

    @Value("${sparehub.bootstrap.inventory-email:}")
    private String inventoryEmail;

    @Value("${sparehub.bootstrap.inventory-password:}")
    private String inventoryPassword;

    @Override
    @Transactional
    public void run(String... args) {

        createStaffIfConfigured(
                "SpareHub Manager",
                managerEmail,
                managerPassword,
                Role.MANAGER
        );

        createStaffIfConfigured(
                "SpareHub Sales Staff",
                salesEmail,
                salesPassword,
                Role.SALES_STAFF
        );

        createStaffIfConfigured(
                "SpareHub Inventory Staff",
                inventoryEmail,
                inventoryPassword,
                Role.INVENTORY_STAFF
        );
    }

    private void createStaffIfConfigured(
            String fullName,
            String email,
            String password,
            Role role
    ) {
        if (email == null
                || email.isBlank()
                || password == null
                || password.isBlank()) {
            return;
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        if (userRepository
                .existsByEmailIgnoreCase(normalizedEmail)) {
            return;
        }

        User staff = User.builder()
                .fullName(fullName)
                .email(normalizedEmail)
                .password(
                        passwordEncoder.encode(password)
                )
                .role(role)
                .accountStatus(AccountStatus.ACTIVE)
                .loyaltyPoints(0)
                .welcomeMessageSent(true)
                .build();

        userRepository.save(staff);
    }
}