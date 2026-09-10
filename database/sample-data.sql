-- Sample Data for SpareHub - Epic 2 Testing
-- Run this script after the application has started to populate sample data

-- Insert Categories
INSERT INTO categories (name, description, active, created_at, updated_at) VALUES
('Engine Parts', 'Components related to vehicle engines', true, NOW(), NOW()),
('Brake System', 'Brake pads, discs, calipers and related components', true, NOW(), NOW()),
('Electrical', 'Battery, alternator, starter motor and electrical components', true, NOW(), NOW()),
('Suspension', 'Shock absorbers, struts and suspension components', true, NOW(), NOW()),
('Transmission', 'Transmission and drivetrain components', true, NOW(), NOW()),
('Filters', 'Oil, air, fuel and cabin filters', true, NOW(), NOW()),
('Cooling System', 'Radiator, water pump and cooling components', true, NOW(), NOW()),
('Exhaust System', 'Mufflers, catalytic converters and exhaust components', true, NOW(), NOW());

-- Insert Subcategories
INSERT INTO subcategories (category_id, name, description, active, created_at, updated_at) VALUES
-- Engine Parts
(1, 'Oil Filter', 'Engine oil filters', true, NOW(), NOW()),
(1, 'Air Filter', 'Engine air intake filters', true, NOW(), NOW()),
(1, 'Spark Plug', 'Ignition spark plugs', true, NOW(), NOW()),
(1, 'Timing Belt', 'Engine timing belts', true, NOW(), NOW()),
(1, 'Water Pump', 'Engine cooling water pumps', true, NOW(), NOW()),
-- Brake System
(2, 'Brake Pad', 'Brake pads for disc brakes', true, NOW(), NOW()),
(2, 'Brake Disc', 'Brake rotors/discs', true, NOW(), NOW()),
(2, 'Brake Caliper', 'Brake calipers', true, NOW(), NOW()),
(2, 'Brake Drum', 'Brake drums for drum brakes', true, NOW(), NOW()),
-- Electrical
(3, 'Battery', 'Car batteries', true, NOW(), NOW()),
(3, 'Alternator', 'Alternators and generators', true, NOW(), NOW()),
(3, 'Starter Motor', 'Engine starter motors', true, NOW(), NOW()),
(3, 'Spark Plug Wire', 'Ignition wires', true, NOW(), NOW()),
-- Suspension
(4, 'Shock Absorber', 'Shock absorbers and struts', true, NOW(), NOW()),
(4, 'Control Arm', 'Suspension control arms', true, NOW(), NOW()),
(4, 'Ball Joint', 'Suspension ball joints', true, NOW(), NOW()),
-- Transmission
(5, 'Clutch Kit', 'Clutch assemblies', true, NOW(), NOW()),
(5, 'Transmission Fluid', 'Transmission oils and fluids', true, NOW(), NOW()),
(5, 'Drive Belt', 'Serpentine and drive belts', true, NOW(), NOW()),
-- Filters
(6, 'Fuel Filter', 'Fuel system filters', true, NOW(), NOW()),
(6, 'Cabin Air Filter', 'Interior air filters', true, NOW(), NOW()),
-- Cooling System
(7, 'Radiator', 'Engine radiators', true, NOW(), NOW()),
(7, 'Thermostat', 'Engine thermostats', true, NOW(), NOW()),
(7, 'Cooling Fan', 'Radiator cooling fans', true, NOW(), NOW()),
-- Exhaust System
(8, 'Muffler', 'Exhaust mufflers', true, NOW(), NOW()),
(8, 'Catalytic Converter', 'Emission control converters', true, NOW(), NOW()),
(8, 'Exhaust Pipe', 'Exhaust pipes and tubing', true, NOW(), NOW());

-- Insert Spare Parts
INSERT INTO spare_parts (part_number, name, description, brand, category_id, subcategory_id, price, stock_quantity, reorder_level, image_url, active, created_at, updated_at) VALUES
-- Engine Parts
('ENG-001', 'Premium Oil Filter', 'High-efficiency oil filter for most vehicles', 'Bosch', 1, 1, 15.99, 50, 20, 'https://example.com/oil-filter.jpg', true, NOW(), NOW()),
('ENG-002', 'Air Filter Standard', 'Standard air filter for sedan vehicles', 'Mann', 1, 2, 12.50, 35, 15, 'https://example.com/air-filter.jpg', true, NOW(), NOW()),
('ENG-003', 'Iridium Spark Plug', 'Long-lasting iridium spark plug set', 'NGK', 1, 3, 8.99, 100, 30, 'https://example.com/spark-plug.jpg', true, NOW(), NOW()),
('ENG-004', 'Timing Belt Kit', 'Complete timing belt replacement kit', 'Gates', 1, 4, 89.99, 15, 5, 'https://example.com/timing-belt.jpg', true, NOW(), NOW()),
('ENG-005', 'Water Pump Assembly', 'Heavy-duty water pump with gasket', 'Aisin', 1, 5, 65.00, 8, 10, 'https://example.com/water-pump.jpg', true, NOW(), NOW()),
-- Brake System
('BRK-001', 'Ceramic Brake Pads', 'Premium ceramic brake pads front', 'Brembo', 2, 6, 45.00, 60, 25, 'https://example.com/brake-pad.jpg', true, NOW(), NOW()),
('BRK-002', 'Drilled Brake Disc', 'Cross-drilled brake rotor', 'EBC', 2, 7, 75.00, 40, 15, 'https://example.com/brake-disc.jpg', true, NOW(), NOW()),
('BRK-003', 'Brake Caliper Front', 'Remanufactured front brake caliper', 'Cardone', 2, 8, 120.00, 12, 5, 'https://example.com/brake-caliper.jpg', true, NOW(), NOW()),
('BRK-004', 'Brake Drum Rear', 'Rear brake drum assembly', 'Bosch', 2, 9, 55.00, 25, 10, 'https://example.com/brake-drum.jpg', true, NOW(), NOW()),
-- Electrical
('ELE-001', 'Car Battery 12V', 'Maintenance-free lead-acid battery', 'Exide', 3, 10, 95.00, 20, 8, 'https://example.com/battery.jpg', true, NOW(), NOW()),
('ELE-002', 'Alternator 100A', '100-amp alternator', 'Denso', 3, 11, 185.00, 5, 3, 'https://example.com/alternator.jpg', true, NOW(), NOW()),
('ELE-003', 'Starter Motor', 'Remanufactured starter motor', 'Bosch', 3, 12, 145.00, 8, 4, 'https://example.com/starter.jpg', true, NOW(), NOW()),
-- Suspension
('SUS-001', 'Gas Shock Absorber', 'Gas-charged shock absorber', 'Monroe', 4, 14, 55.00, 45, 20, 'https://example.com/shock.jpg', true, NOW(), NOW()),
('SUS-002', 'Control Arm Set', 'Front control arm pair', 'Moog', 4, 15, 125.00, 15, 6, 'https://example.com/control-arm.jpg', true, NOW(), NOW()),
('SUS-003', 'Ball Joint', 'Lower ball joint', 'TRW', 4, 16, 22.00, 30, 12, 'https://example.com/ball-joint.jpg', true, NOW(), NOW()),
-- Transmission
('TRN-001', 'Clutch Kit Complete', 'Complete clutch kit with pressure plate', 'Luk', 5, 17, 195.00, 10, 4, 'https://example.com/clutch.jpg', true, NOW(), NOW()),
('TRN-002', 'ATF Fluid 4L', 'Automatic transmission fluid', 'Castrol', 5, 18, 35.00, 40, 15, 'https://example.com/atf.jpg', true, NOW(), NOW()),
-- Filters
('FLT-001', 'Fuel Filter', 'Inline fuel filter', 'Wix', 6, 19, 12.00, 55, 20, 'https://example.com/fuel-filter.jpg', true, NOW(), NOW()),
('FLT-002', 'Cabin Air Filter', 'Activated carbon cabin filter', 'Mann', 6, 20, 18.00, 35, 15, 'https://example.com/cabin-filter.jpg', true, NOW(), NOW()),
-- Cooling System
('COL-001', 'Aluminum Radiator', 'High-efficiency aluminum radiator', 'Spectra', 7, 21, 165.00, 8, 5, 'https://example.com/radiator.jpg', true, NOW(), NOW()),
('COL-002', 'Thermostat Assembly', 'Engine thermostat with housing', 'Stant', 7, 22, 25.00, 30, 12, 'https://example.com/thermostat.jpg', true, NOW(), NOW()),
-- Exhaust System
('EXH-001', 'Performance Muffler', 'Stainless steel muffler', 'Borla', 8, 24, 145.00, 12, 6, 'https://example.com/muffler.jpg', true, NOW(), NOW()),
('EXH-002', 'Catalytic Converter', 'Direct-fit catalytic converter', 'MagnaFlow', 8, 25, 285.00, 5, 3, 'https://example.com/cat-converter.jpg', true, NOW(), NOW());

-- Note: Images URLs are placeholders. Replace with actual image URLs or use image upload functionality
