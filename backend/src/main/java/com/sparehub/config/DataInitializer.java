package com.sparehub.config;

import com.sparehub.entity.Role;
import com.sparehub.entity.User;
import com.sparehub.repository.RoleRepository;
import com.sparehub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeUsers();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            Role inventoryStaffRole = new Role();
            inventoryStaffRole.setName("INVENTORY_STAFF");
            roleRepository.save(inventoryStaffRole);

            Role managerRole = new Role();
            managerRole.setName("MANAGER");
            roleRepository.save(managerRole);

            Role customerRole = new Role();
            customerRole.setName("CUSTOMER");
            roleRepository.save(customerRole);

            System.out.println("Default roles initialized successfully.");
        }
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            Role inventoryStaffRole = roleRepository.findByName("INVENTORY_STAFF")
                    .orElseThrow(() -> new RuntimeException("INVENTORY_STAFF role not found"));
            Role managerRole = roleRepository.findByName("MANAGER")
                    .orElseThrow(() -> new RuntimeException("MANAGER role not found"));
            Role customerRole = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));

            // Create Inventory Staff user
            User staff = new User();
            staff.setUsername("staff@sparehub.com");
            staff.setPassword(passwordEncoder.encode("Staff@123"));
            staff.setEmail("staff@sparehub.com");
            staff.setFirstName("John");
            staff.setLastName("Doe");
            staff.setPhone("0771234567");
            staff.setActive(true);
            Set<Role> staffRoles = new HashSet<>();
            staffRoles.add(inventoryStaffRole);
            staff.setRoles(staffRoles);
            userRepository.save(staff);

            // Create Manager user
            User manager = new User();
            manager.setUsername("manager@sparehub.com");
            manager.setPassword(passwordEncoder.encode("Manager@123"));
            manager.setEmail("manager@sparehub.com");
            manager.setFirstName("Jane");
            manager.setLastName("Smith");
            manager.setPhone("0772345678");
            manager.setActive(true);
            Set<Role> managerRoles = new HashSet<>();
            managerRoles.add(managerRole);
            manager.setRoles(managerRoles);
            userRepository.save(manager);

            // Create Customer user
            User customer = new User();
            customer.setUsername("customer@sparehub.com");
            customer.setPassword(passwordEncoder.encode("Customer@123"));
            customer.setEmail("customer@sparehub.com");
            customer.setFirstName("Bob");
            customer.setLastName("Wilson");
            customer.setPhone("0773456789");
            customer.setActive(true);
            Set<Role> customerRoles = new HashSet<>();
            customerRoles.add(customerRole);
            customer.setRoles(customerRoles);
            userRepository.save(customer);

            System.out.println("Default users initialized successfully.");
            System.out.println("Staff: staff@sparehub.com / Staff@123");
            System.out.println("Manager: manager@sparehub.com / Manager@123");
            System.out.println("Customer: customer@sparehub.com / Customer@123");
        }
    }
}
