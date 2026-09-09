package com.sparehub.backend.service;

import com.sparehub.backend.dto.AuthRequest;
import com.sparehub.backend.dto.AuthResponse;
import com.sparehub.backend.dto.RegisterRequest;
import com.sparehub.backend.entity.LoyaltyTier;
import com.sparehub.backend.entity.Notification;
import com.sparehub.backend.entity.Role;
import com.sparehub.backend.entity.User;
import com.sparehub.backend.repository.LoyaltyTierRepository;
import com.sparehub.backend.repository.NotificationRepository;
import com.sparehub.backend.repository.RoleRepository;
import com.sparehub.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final NotificationRepository notificationRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       LoyaltyTierRepository loyaltyTierRepository,
                       NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.loyaltyTierRepository = loyaltyTierRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public AuthResponse registerCustomer(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            AuthResponse res = new AuthResponse();
            res.setSuccess(false);
            res.setMessage("An account with this email already exists.");
            return res;
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setIsActive(true);

        // Assign default ROLE_CUSTOMER
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CUSTOMER", "Automotive Spare Parts Customer")));
        user.setRoles(Collections.singleton(customerRole));

        // Assign starter Bronze tier
        LoyaltyTier bronzeTier = loyaltyTierRepository.findByTierName("Bronze")
                .orElse(null);
        user.setLoyaltyTier(bronzeTier);

        User savedUser = userRepository.save(user);

        // US-62: Create in-app Welcome Message after successful registration
        Notification welcomeNotification = new Notification(
                savedUser,
                "Welcome to SpareHub! 🎉",
                "Hello " + savedUser.getFirstName() + ", welcome to SpareHub! Your account has been registered successfully. You are enrolled in the Bronze Loyalty Tier with exclusive automotive spare parts discounts and privileges.",
                "WELCOME"
        );
        notificationRepository.save(welcomeNotification);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Account created successfully. Welcome to SpareHub!");
        response.setUserId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setFullName(savedUser.getFullName());
        response.setPhone(savedUser.getPhone());
        response.setAddress(savedUser.getAddress());
        response.setRoles(savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        if (savedUser.getLoyaltyTier() != null) {
            response.setLoyaltyTier(savedUser.getLoyaltyTier().getTierName());
            response.setDiscountPercentage(savedUser.getLoyaltyTier().getDiscountPercentage().doubleValue());
        } else {
            response.setLoyaltyTier("Bronze");
            response.setDiscountPercentage(0.0);
        }
        response.setToken("sparehub_token_" + savedUser.getId());
        return response;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            AuthResponse res = new AuthResponse();
            res.setSuccess(false);
            res.setMessage("Invalid email or password.");
            return res;
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            AuthResponse res = new AuthResponse();
            res.setSuccess(false);
            res.setMessage("Your account is deactivated. Please contact SpareHub support.");
            return res;
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful.");
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        if (user.getLoyaltyTier() != null) {
            response.setLoyaltyTier(user.getLoyaltyTier().getTierName());
            response.setDiscountPercentage(user.getLoyaltyTier().getDiscountPercentage().doubleValue());
        }
        response.setToken("sparehub_token_" + user.getId());
        return response;
    }
}
