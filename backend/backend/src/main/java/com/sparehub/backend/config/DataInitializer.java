package com.sparehub.backend.config;

import com.sparehub.backend.entity.LoyaltyTier;
import com.sparehub.backend.entity.Notification;
import com.sparehub.backend.entity.Order;
import com.sparehub.backend.entity.Role;
import com.sparehub.backend.entity.User;
import com.sparehub.backend.repository.LoyaltyTierRepository;
import com.sparehub.backend.repository.NotificationRepository;
import com.sparehub.backend.repository.OrderRepository;
import com.sparehub.backend.repository.RoleRepository;
import com.sparehub.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(RoleRepository roleRepository,
                           LoyaltyTierRepository loyaltyTierRepository,
                           UserRepository userRepository,
                           OrderRepository orderRepository,
                           NotificationRepository notificationRepository) {
        this.roleRepository = roleRepository;
        this.loyaltyTierRepository = loyaltyTierRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Roles
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER").orElseGet(() ->
                roleRepository.save(new Role("ROLE_CUSTOMER", "Registered Customer")));
        Role salesStaffRole = roleRepository.findByName("ROLE_SALES_STAFF").orElseGet(() ->
                roleRepository.save(new Role("ROLE_SALES_STAFF", "Sales & Counter Staff")));
        Role inventoryStaffRole = roleRepository.findByName("ROLE_INVENTORY_STAFF").orElseGet(() ->
                roleRepository.save(new Role("ROLE_INVENTORY_STAFF", "Inventory & Warehouse Staff")));
        Role managerRole = roleRepository.findByName("ROLE_MANAGER").orElseGet(() ->
                roleRepository.save(new Role("ROLE_MANAGER", "System Manager & Administrator")));

        // 2. Seed Loyalty Tiers in Sri Lankan Rupees (Rs. / LKR)
        LoyaltyTier bronze = loyaltyTierRepository.findByTierName("Bronze").orElseGet(() ->
                loyaltyTierRepository.save(new LoyaltyTier("Bronze", new BigDecimal("0.00"), new BigDecimal("0.00"))));
        LoyaltyTier silver = loyaltyTierRepository.findByTierName("Silver").orElseGet(() ->
                loyaltyTierRepository.save(new LoyaltyTier("Silver", new BigDecimal("25000.00"), new BigDecimal("5.00"))));
        LoyaltyTier gold = loyaltyTierRepository.findByTierName("Gold").orElseGet(() ->
                loyaltyTierRepository.save(new LoyaltyTier("Gold", new BigDecimal("75000.00"), new BigDecimal("10.00"))));
        LoyaltyTier platinum = loyaltyTierRepository.findByTierName("Platinum").orElseGet(() ->
                loyaltyTierRepository.save(new LoyaltyTier("Platinum", new BigDecimal("150000.00"), new BigDecimal("15.00"))));

        // 3. Seed Demo Users if not present
        if (!userRepository.existsByEmail("manager@sparehub.com")) {
            User manager = new User("manager@sparehub.com", passwordEncoder.encode("manager123"), "Supun", "Bandara", "0771122334", "Head Office, Colombo 03, Sri Lanka");
            manager.setRoles(new HashSet<>(Collections.singletonList(managerRole)));
            userRepository.save(manager);
        }

        if (!userRepository.existsByEmail("sales@sparehub.com")) {
            User salesStaff = new User("sales@sparehub.com", passwordEncoder.encode("sales123"), "Nalaka", "Perera", "0773344556", "Main Branch, Colombo 10, Sri Lanka");
            salesStaff.setRoles(new HashSet<>(Collections.singletonList(salesStaffRole)));
            userRepository.save(salesStaff);
        }

        if (!userRepository.existsByEmail("inventory@sparehub.com")) {
            User inventoryStaff = new User("inventory@sparehub.com", passwordEncoder.encode("inventory123"), "Kamal", "Wickramasinghe", "0774455667", "Central Warehouse, Colombo 15, Sri Lanka");
            inventoryStaff.setRoles(new HashSet<>(Collections.singletonList(inventoryStaffRole)));
            userRepository.save(inventoryStaff);
        }

        User customer = null;
        if (!userRepository.existsByEmail("customer@sparehub.com")) {
            customer = new User("customer@sparehub.com", passwordEncoder.encode("customer123"), "Janaka", "Gamage", "0775566778", "45 Galle Road, Mount Lavinia, Sri Lanka");
            customer.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
            customer.setLoyaltyTier(bronze);
            customer = userRepository.save(customer);

            // Seed US-62 Welcome Notification
            notificationRepository.save(new Notification(
                    customer,
                    "Welcome to SpareHub! 🎉",
                    "Welcome Janaka! Your SpareHub account is active. You have been assigned Bronze Loyalty Tier with access to thousands of OEM automotive spare parts.",
                    "WELCOME"
            ));
        }

        // Additional sample customers for testing US-05 and US-09
        User kasun = null;
        if (!userRepository.existsByEmail("kasun.fernando@example.com")) {
            kasun = new User("kasun.fernando@example.com", passwordEncoder.encode("kasun123"), "Kasun", "Fernando", "0712345678", "12 Temple Road, Colombo 07, Sri Lanka");
            kasun.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
            kasun.setLoyaltyTier(silver);
            kasun = userRepository.save(kasun);

            notificationRepository.save(new Notification(
                    kasun,
                    "Welcome to SpareHub! 🎉",
                    "Welcome Kasun! Thank you for registering with SpareHub automotive spare parts.",
                    "WELCOME"
            ));
        } else {
            kasun = userRepository.findByEmail("kasun.fernando@example.com").orElse(null);
        }

        User anura = null;
        if (!userRepository.existsByEmail("anura.silva@example.com")) {
            anura = new User("anura.silva@example.com", passwordEncoder.encode("anura123"), "Anura", "Silva", "0723456789", "88 Peradeniya Road, Kandy, Sri Lanka");
            anura.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
            anura.setLoyaltyTier(gold);
            anura = userRepository.save(anura);

            notificationRepository.save(new Notification(
                    anura,
                    "Welcome to SpareHub! 🎉",
                    "Welcome Anura! Explore genuine Japanese and European vehicle parts.",
                    "WELCOME"
            ));
        } else {
            anura = userRepository.findByEmail("anura.silva@example.com").orElse(null);
        }

        // 4. Seed Sample Orders for Kasun and Anura (US-09)
        if (kasun != null && orderRepository.findByCustomerIdOrderByCreatedAtDesc(kasun.getId()).isEmpty()) {
            orderRepository.save(new Order(kasun, "SPH-2026-001", new BigDecimal("18500.00"), "COMPLETED", "Card", "Brembo Ceramic Front Brake Pads x2, Dot 4 Brake Fluid 1L"));
            orderRepository.save(new Order(kasun, "SPH-2026-002", new BigDecimal("20000.00"), "COMPLETED", "Online Bank Transfer", "Toyota Genuine Oil Filter x2, Mobil 1 5W-30 Full Synthetic Oil 4L"));
        }

        if (anura != null && orderRepository.findByCustomerIdOrderByCreatedAtDesc(anura.getId()).isEmpty()) {
            orderRepository.save(new Order(anura, "SPH-2026-003", new BigDecimal("42000.00"), "COMPLETED", "Card", "Denso Alternator 12V 90A, Serpentine Drive Belt"));
            orderRepository.save(new Order(anura, "SPH-2026-004", new BigDecimal("50000.00"), "COMPLETED", "Card", "KYB Excel-G Front Shock Absorber Pair (Left & Right)"));
        }

        if (customer != null && orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).isEmpty()) {
            orderRepository.save(new Order(customer, "SPH-2026-005", new BigDecimal("8200.00"), "PROCESSING", "Cash on Delivery", "NGK Laser Iridium Spark Plugs Set of 4"));
        }
    }
}
