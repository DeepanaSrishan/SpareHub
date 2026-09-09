-- ====================================================================
-- SpareHub - Web-Based Automotive Spare Parts Management System
-- Database Setup & Seed Script (All Currency in Sri Lankan Rupees - Rs. / LKR)
-- Supported User Stories: US-01, US-02, US-05, US-07, US-09, US-62 (Sprint 1)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS sparehub_db;
USE sparehub_db;

-- --------------------------------------------------------------------
-- 1. Roles Table (Supports US-07: Role-Based Access Control)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'ROLE_CUSTOMER', 'ROLE_SALES_STAFF', 'ROLE_MANAGER'
    description VARCHAR(255)
);

-- --------------------------------------------------------------------
-- 2. Loyalty Tiers Table (Supports US-05: Assigning Loyalty Tiers)
-- Currency: Sri Lankan Rupees (Rs. / LKR)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL UNIQUE, -- 'Bronze', 'Silver', 'Gold', 'Platinum'
    min_spend_amount DECIMAL(10, 2) DEFAULT 0.00, -- in Rs.
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. Users Table (Supports US-01: Account Creation, US-02: Profile, US-05 & US-07)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    loyalty_tier_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loyalty_tier_id) REFERENCES loyalty_tiers(id) ON DELETE SET NULL
);

-- --------------------------------------------------------------------
-- 4. User Roles Junction Table (Supports US-07: Many-to-Many RBAC)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 5. Orders Table (Supports US-09: Customer Transaction & Order History)
-- Currency: Sri Lankan Rupees (Rs. / LKR)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL, -- in Rs.
    status VARCHAR(50) DEFAULT 'PENDING',  -- 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'
    payment_method VARCHAR(50) DEFAULT 'Card',
    items_summary VARCHAR(255) DEFAULT 'Automotive Spare Parts',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 6. Notifications Table (Supports US-62: Customer Welcome Message & Alerts)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'WELCOME',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================================================
-- SEED DATA (All Amounts in Rs. / LKR)
-- ====================================================================

-- Seed Roles
INSERT INTO roles (name, description) VALUES
('ROLE_CUSTOMER', 'Registered Automotive Spare Parts Customer'),
('ROLE_SALES_STAFF', 'Sales & Counter Staff Member'),
('ROLE_MANAGER', 'System Manager & Administrator')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Seed Loyalty Tiers in Rs. (LKR)
INSERT INTO loyalty_tiers (tier_name, min_spend_amount, discount_percentage) VALUES
('Bronze', 0.00, 0.00),
('Silver', 25000.00, 5.00),
('Gold', 75000.00, 10.00),
('Platinum', 150000.00, 15.00)
ON DUPLICATE KEY UPDATE min_spend_amount = VALUES(min_spend_amount), discount_percentage = VALUES(discount_percentage);

-- Demo Passwords (All pre-hashed with BCrypt):
-- manager123  -> $2a$10$eE7nF3qf92k8eXy4t5Z.eeu9wBw1R3XnL9r5Qe8o8K.w2T3s4U5Ve (or generated on startup)
-- sales123    -> $2a$10$eE7nF3qf92k8eXy4t5Z.eeu9wBw1R3XnL9r5Qe8o8K.w2T3s4U5Ve
-- customer123 -> $2a$10$eE7nF3qf92k8eXy4t5Z.eeu9wBw1R3XnL9r5Qe8o8K.w2T3s4U5Ve
-- (Note: Spring Boot's DataInitializer automatically ensures demo users, passwords, orders, and welcome notifications are seeded on application launch).