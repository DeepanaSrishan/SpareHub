package com.sparehub.backend.service;

import com.sparehub.backend.dto.CreateStaffRequest;
import com.sparehub.backend.dto.UpdateProfileRequest;
import com.sparehub.backend.dto.UserProfileDto;
import com.sparehub.backend.entity.Role;
import com.sparehub.backend.entity.User;
import com.sparehub.backend.repository.RoleRepository;
import com.sparehub.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // US-02: View profile
    public UserProfileDto getUserProfile(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToProfileDto(user);
    }

    // US-02: Update profile
    @Transactional
    public UserProfileDto updateUserProfile(Integer id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        User updated = userRepository.save(user);
        return mapToProfileDto(updated);
    }

    // US-07: Get all users for Manager RBAC
    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAllUsersOrdered().stream()
                .map(this::mapToProfileDto)
                .collect(Collectors.toList());
    }

    // US-07: Update user roles (Manager RBAC)
    @Transactional
    public UserProfileDto updateUserRoles(Integer userId, List<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            roles.add(role);
        }

        user.setRoles(roles);
        User updated = userRepository.save(user);
        return mapToProfileDto(updated);
    }

    // US-07: Toggle user active status (Manager RBAC)
    @Transactional
    public UserProfileDto updateUserStatus(Integer userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(isActive);
        User updated = userRepository.save(user);
        return mapToProfileDto(updated);
    }

    // Manager creates staff accounts (Sales or Inventory)
    @Transactional
    public UserProfileDto createStaffUser(CreateStaffRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email/username '" + email + "' already exists.");
        }

        String roleName = request.getRole().trim().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        final String finalRoleName = roleName;
        Role role = roleRepository.findByName(finalRoleName).orElseGet(() ->
                roleRepository.save(new Role(finalRoleName, finalRoleName.replace("ROLE_", "") + " Staff")));

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setIsActive(true);
        user.setRoles(new HashSet<>(Collections.singletonList(role)));

        User saved = userRepository.save(user);
        return mapToProfileDto(saved);
    }

    // System RBAC statistics
    public Map<String, Object> getSystemStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long customerCount = users.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_CUSTOMER".equals(r.getName()))).count();
        long salesStaffCount = users.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_SALES_STAFF".equals(r.getName()))).count();
        long inventoryStaffCount = users.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_INVENTORY_STAFF".equals(r.getName()))).count();
        long managerCount = users.stream().filter(u -> u.getRoles().stream().anyMatch(r -> "ROLE_MANAGER".equals(r.getName()))).count();
        long activeCount = users.stream().filter(u -> Boolean.TRUE.equals(u.getIsActive())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("customerCount", customerCount);
        stats.put("salesStaffCount", salesStaffCount);
        stats.put("inventoryStaffCount", inventoryStaffCount);
        stats.put("managerCount", managerCount);
        stats.put("activeCount", activeCount);
        stats.put("deactivatedCount", totalUsers - activeCount);
        return stats;
    }

    private UserProfileDto mapToProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setIsActive(user.getIsActive());
        if (user.getLoyaltyTier() != null) {
            dto.setLoyaltyTier(user.getLoyaltyTier().getTierName());
            dto.setDiscountPercentage(user.getLoyaltyTier().getDiscountPercentage().doubleValue());
        } else {
            dto.setLoyaltyTier("Bronze");
            dto.setDiscountPercentage(0.0);
        }
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
