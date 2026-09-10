# SpareHub – Web-Based Automotive Spare Parts Management System

## Project Overview

SpareHub is a comprehensive web-based automotive spare parts management system built with:
- **Frontend**: React.js
- **Backend**: Java Spring Boot
- **Database**: MySQL
- **Architecture**: REST API with Spring Security

## Project Structure

```
sparehub/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/sparehub/
│   │       │       ├── config/
│   │       │       │   ├── DataInitializer.java
│   │       │       │   └── SecurityConfig.java
│   │       │       ├── controller/
│   │       │       │   ├── AuthController.java
│   │       │       │   ├── CategoryController.java
│   │       │       │   ├── InventoryController.java
│   │       │       │   ├── InventoryReportController.java
│   │       │       │   ├── InventoryTransactionController.java
│   │       │       │   ├── SparePartController.java
│   │       │       │   └── SubCategoryController.java
│   │       │       ├── dto/
│   │       │       │   ├── AuthResponse.java
│   │       │       │   ├── CategoryDTO.java
│   │       │       │   ├── InventorySummaryDTO.java
│   │       │       │   ├── InventoryTransactionDTO.java
│   │       │       │   ├── LoginRequest.java
│   │       │       │   ├── RegisterRequest.java
│   │       │       │   ├── SparePartDTO.java
│   │       │       │   ├── StockUpdateRequest.java
│   │       │       │   └── SubCategoryDTO.java
│   │       │       ├── entity/
│   │       │       │   ├── Category.java
│   │       │       │   ├── InventoryTransaction.java
│   │       │       │   ├── Role.java
│   │       │       │   ├── SparePart.java
│   │       │       │   ├── SubCategory.java
│   │       │       │   └── User.java
│   │       │       ├── exception/
│   │       │       │   ├── DuplicateResourceException.java
│   │       │       │   ├── GlobalExceptionHandler.java
│   │       │       │   └── ResourceNotFoundException.java
│   │       │       ├── repository/
│   │       │       │   ├── CategoryRepository.java
│   │       │       │   ├── InventoryTransactionRepository.java
│   │       │       │   ├── RoleRepository.java
│   │       │       │   ├── SparePartRepository.java
│   │       │       │   ├── SubCategoryRepository.java
│   │       │       │   └── UserRepository.java
│   │       │       ├── security/
│   │       │       │   ├── CustomUserDetails.java
│   │       │       │   ├── JwtAuthenticationFilter.java
│   │       │       │   ├── JwtTokenProvider.java
│   │       │       │   └── UserDetailsServiceImpl.java
│   │       │       └── service/
│   │       │           ├── AuthService.java
│   │       │           ├── CategoryService.java
│   │       │           ├── InventoryReportService.java
│   │       │           ├── InventoryService.java
│   │       │           ├── InventoryTransactionService.java
│   │       │           ├── SparePartService.java
│   │       │           └── SubCategoryService.java
│   │       └── resources/
│   │           ├── application.yml
│   │           └── data.sql
│   └── pom.xml
├── frontend/                # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterPanel.js
│   │   │   ├── Layout.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── SparePartForm.js
│   │   │   ├── SparePartTable.js
│   │   │   ├── StockStatusBadge.js
│   │   │   └── StockUpdateModal.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── AddCategory.js
│   │   │   ├── AddSparePart.js
│   │   │   ├── Categories.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EditSparePart.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Reports.js
│   │   │   ├── SparePartDetails.js
│   │   │   ├── SpareParts.js
│   │   │   └── Transactions.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
└── database/
    └── sample-data.sql
```

## Epic 2 – Spare Parts & Inventory Management

This module includes:
- Add/Update/Deactivate spare parts
- Category and sub-category management
- Inventory dashboard with stock overview
- Stock update functionality
- Low stock alerts
- Search and filter spare parts
- Spare part details view
- Availability status calculation
- Inventory transaction logging
- Transaction history
- Inventory reports

## User Roles

- **INVENTORY_STAFF**: Add/edit spare parts, manage categories, update stock
- **MANAGER**: View inventory, transactions, and reports
- **CUSTOMER**: Search and view spare parts

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven

### Database Setup

1. Install MySQL 8.0 or higher if not already installed

2. Create MySQL database:
```sql
CREATE DATABASE sparehub;
```

3. Configure database credentials in `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/sparehub?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: your_password  # Change this to your MySQL password
```

4. The application will automatically create tables on first run using Hibernate DDL auto-update

5. (Optional) Load sample data:
```bash
mysql -u root -p sparehub < database/sample-data.sql
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

Backend will run on `http://localhost:8080/api`

**Note**: On first run, the application will:
- Create all database tables automatically
- Initialize default roles (INVENTORY_STAFF, MANAGER, CUSTOMER)
- Create default users (see Default Users section below)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Spare Parts
- GET `/api/spare-parts` - Get all spare parts
- GET `/api/spare-parts/{id}` - Get spare part by ID
- POST `/api/spare-parts` - Add new spare part
- PUT `/api/spare-parts/{id}` - Update spare part
- PATCH `/api/spare-parts/{id}/deactivate` - Deactivate spare part
- PATCH `/api/spare-parts/{id}/activate` - Activate spare part
- GET `/api/spare-parts/search?keyword=` - Search spare parts
- GET `/api/spare-parts/filter` - Filter spare parts

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Add category
- PUT `/api/categories/{id}` - Update category
- PATCH `/api/categories/{id}/deactivate` - Deactivate category

### Subcategories
- GET `/api/subcategories` - Get all subcategories
- GET `/api/subcategories/category/{categoryId}` - Get subcategories by category
- POST `/api/subcategories` - Add subcategory
- PUT `/api/subcategories/{id}` - Update subcategory

### Inventory
- GET `/api/inventory` - Get inventory overview
- PATCH `/api/inventory/{sparePartId}/stock` - Update stock
- GET `/api/inventory/low-stock` - Get low stock items
- GET `/api/inventory/out-of-stock` - Get out of stock items

### Inventory Transactions
- GET `/api/inventory/transactions` - Get transaction history
- POST `/api/inventory/transactions` - Create transaction

### Inventory Reports
- GET `/api/inventory/reports` - Get inventory reports

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Default Users

After running the application, the following users will be available:

**Inventory Staff:**
- Username: `staff@sparehub.com`
- Password: `Staff@123`

**Manager:**
- Username: `manager@sparehub.com`
- Password: `Manager@123`

**Customer:**
- Username: `customer@sparehub.com`
- Password: `Customer@123`

## License

This project is for educational purposes.

## Epic 2 Implementation Summary

### Files Created/Modified

#### Backend (Spring Boot)
- **Configuration**: `SecurityConfig.java`, `DataInitializer.java`
- **Controllers**: `AuthController.java`, `SparePartController.java`, `CategoryController.java`, `SubCategoryController.java`, `InventoryController.java`, `InventoryTransactionController.java`, `InventoryReportController.java`
- **DTOs**: `LoginRequest.java`, `RegisterRequest.java`, `AuthResponse.java`, `SparePartDTO.java`, `CategoryDTO.java`, `SubCategoryDTO.java`, `StockUpdateRequest.java`, `InventoryTransactionDTO.java`, `InventorySummaryDTO.java`
- **Entities**: `User.java`, `Role.java`, `SparePart.java`, `Category.java`, `SubCategory.java`, `InventoryTransaction.java`
- **Repositories**: `UserRepository.java`, `RoleRepository.java`, `SparePartRepository.java`, `CategoryRepository.java`, `SubCategoryRepository.java`, `InventoryTransactionRepository.java`
- **Services**: `AuthService.java`, `SparePartService.java`, `CategoryService.java`, `SubCategoryService.java`, `InventoryService.java`, `InventoryTransactionService.java`, `InventoryReportService.java`
- **Security**: `JwtTokenProvider.java`, `CustomUserDetails.java`, `UserDetailsServiceImpl.java`, `JwtAuthenticationFilter.java`
- **Exception Handling**: `ResourceNotFoundException.java`, `DuplicateResourceException.java`, `GlobalExceptionHandler.java`

#### Frontend (React)
- **Components**: `Layout.js`, `ProtectedRoute.js`, `StockStatusBadge.js`, `FilterPanel.js`, `SparePartForm.js`, `SparePartTable.js`, `StockUpdateModal.js`
- **Pages**: `Login.js`, `Register.js`, `Dashboard.js`, `SpareParts.js`, `AddSparePart.js`, `EditSparePart.js`, `SparePartDetails.js`, `Categories.js`, `AddCategory.js`, `Transactions.js`, `Reports.js`
- **Context**: `AuthContext.js`
- **Utils**: `api.js`

#### Database
- `sample-data.sql` - Sample data for testing with 8 categories, 25 subcategories, and 25 spare parts

### Database Tables Created

1. **users** - User accounts with authentication
2. **roles** - User roles (INVENTORY_STAFF, MANAGER, CUSTOMER)
3. **user_roles** - Many-to-many relationship between users and roles
4. **categories** - Product categories
5. **subcategories** - Product subcategories linked to categories
6. **spare_parts** - Spare parts inventory
7. **inventory_transactions** - Stock adjustment history

### Key Features Implemented

#### US-12 – Add New Spare Part
- Form with all required fields (part number, name, description, brand, category, sub-category, price, stock quantity, reorder level, image URL, active status)
- Validation for required fields, price >= 0, stock >= 0, reorder level >= 0
- Unique part number validation
- Success/error messages

#### US-13 – Update Spare Part
- Edit form pre-populated with existing data
- Prevents duplicate part numbers
- Loading states and error handling

#### US-14 – Deactivate Spare Part
- Soft deletion using active field
- Confirmation dialog
- Reactivate button available

#### US-15 – Category and Sub-Category Management
- Add/edit categories and subcategories
- Activate/deactivate functionality
- Hierarchical structure (subcategory belongs to category)

#### US-16 – View Current Stock
- Inventory dashboard with summary cards
- Spare parts table with all required fields
- Availability status display

#### US-17 – Update Stock
- Stock update modal with transaction types
- Prevents negative stock
- Automatic transaction logging

#### US-18 – Low Stock Alerts
- Automatic low stock detection on dashboard
- Visual warning indicators
- Separate low stock and out-of-stock sections

#### US-19 – Reorder Level
- Editable reorder level
- Validation (reorderLevel >= 0)
- Used in availability calculation

#### US-20 – Search Spare Parts
- Backend API search with partial matching
- Search by part number or name
- Fast and user-friendly

#### US-21 – Filter Spare Parts
- Filter by category, brand, price range, availability, active status
- Multiple filters work together
- Clear filters button

#### US-22 – Spare Part Details
- Detailed view page with all product information
- Professional layout with image display
- Edit button for authorized users

#### US-23 – Availability Status
- Automatic calculation based on rules:
  - INACTIVE if active = false
  - OUT_OF_STOCK if stock = 0
  - LOW_STOCK if stock <= reorderLevel
  - IN_STOCK otherwise
- Consistent display throughout system

#### US-24 – Stock Adjustment Logging
- Automatic transaction creation on stock changes
- Records all required fields (transaction type, quantities, reason, user, timestamp)

#### US-25 – Inventory Transaction History
- Transaction history page with table
- Filter by transaction type
- Sort by date (latest first)
- Shows all transaction details

#### US-26 – Inventory Reports
- Reports page with summary cards
- Stock valuation calculation
- Inventory insights and metrics

### How to Test Epic 2

1. **Start the Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Login with Default Users**
   - Staff: `staff@sparehub.com` / `Staff@123`
   - Manager: `manager@sparehub.com` / `Manager@123`
   - Customer: `customer@sparehub.com` / `Customer@123`

4. **Test Features**
   - Add categories and subcategories
   - Add spare parts with various stock levels
   - Update stock and verify transaction logging
   - Search and filter spare parts
   - View dashboard and reports
   - Test role-based access control

### Assumptions Made

1. MySQL is installed and running on localhost:3306
2. User has appropriate permissions to create databases and tables
3. Image URLs are provided as strings (no file upload implementation)
4. JWT token expiration is set to 24 hours
5. Password complexity requirements: min 8 chars, uppercase, lowercase, number, special character
6. CORS is configured to allow requests from localhost:3000
7. Database schema is created automatically by Hibernate on first run

### Git Commit Recommendations

Commit the following files to Git:

**Backend:**
- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/java/com/sparehub/` (all Java files)

**Frontend:**
- `frontend/package.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/` (all source files)

**Database:**
- `database/sample-data.sql`

**Documentation:**
- `README.md`

**Do NOT commit:**
- `backend/target/` (Maven build artifacts)
- `frontend/node_modules/` (npm dependencies)
- `frontend/build/` (React build artifacts)
- `.env` files (if any)
- IDE configuration files (`.idea/`, `.vscode/`, etc.)

### Troubleshooting

**Backend won't start:**
- Check MySQL is running
- Verify database credentials in application.yml
- Ensure port 8080 is not in use

**Frontend can't connect to backend:**
- Verify backend is running on http://localhost:8080
- Check CORS configuration in SecurityConfig.java
- Ensure API proxy is configured in package.json

**Login not working:**
- Check default users were created (check console logs)
- Verify password complexity requirements
- Check JWT secret in application.yml

**Database tables not created:**
- Verify `ddl-auto: update` in application.yml
- Check MySQL user has CREATE TABLE permissions
- Look for SQL errors in backend logs
