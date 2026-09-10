-- Insert default roles
INSERT INTO roles (name) VALUES ('INVENTORY_STAFF'), ('MANAGER'), ('CUSTOMER');

-- Insert default users (passwords are BCrypt encoded)
-- Staff@123 -> $2a$10$YourHashedPasswordHere
-- Manager@123 -> $2a$10$YourHashedPasswordHere
-- Customer@123 -> $2a$10$YourHashedPasswordHere

-- Note: These passwords will be set programmatically on first run
