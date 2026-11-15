import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import LoginPage from
        "../pages/auth/LoginPage";

import RegisterPage from
        "../pages/auth/RegisterPage";

import UnauthorizedPage from
        "../pages/UnauthorizedPage";

import CustomerHomePage from
        "../pages/customer/CustomerHomePage";

import ProfilePage from
        "../pages/customer/ProfilePage";

import LoyaltyPage from
        "../pages/customer/LoyaltyPage";

import NotificationsPage from
        "../pages/customer/NotificationsPage";

import CartPage from
        "../pages/customer/CartPage";

import CheckoutPage from
        "../pages/customer/CheckoutPage";

import OrderSuccessPage from
        "../pages/customer/OrderSuccessPage";

import OrdersPage from
        "../pages/customer/OrdersPage";

import OrderDetailsPage from
        "../pages/customer/OrderDetailsPage";

import InvoicePage from
        "../pages/customer/InvoicePage";

import ProductCatalogPage from
        "../pages/catalog/ProductCatalogPage";

import ProductDetailsPage from
        "../pages/catalog/ProductDetailsPage";

import SalesDashboardPage from
        "../pages/sales/SalesDashboardPage";

import CustomersPage from
        "../pages/sales/CustomersPage";

import CustomerDetailsPage from
        "../pages/sales/CustomerDetailsPage";

import InactiveCustomersPage from
        "../pages/sales/InactiveCustomersPage";

import StaffOrdersPage from
        "../pages/sales/orders/StaffOrdersPage";

import StaffOrderDetailsPage from
        "../pages/sales/orders/StaffOrderDetailsPage";

import InventoryDashboardPage from
        "../pages/inventory/InventoryDashboardPage";

import InventoryProductsPage from
        "../pages/inventory/InventoryProductsPage";

import ProductFormPage from
        "../pages/inventory/ProductFormPage";

import CategoriesPage from
        "../pages/inventory/CategoriesPage";

import StockAdjustmentPage from
        "../pages/inventory/StockAdjustmentPage";

import LowStockAlertsPage from
        "../pages/inventory/LowStockAlertsPage";

import SuppliersPage from
        "../pages/suppliers/SuppliersPage";

import SupplierProductsPage from
        "../pages/suppliers/SupplierProductsPage";

import SupplierPurchasesPage from
        "../pages/suppliers/SupplierPurchasesPage";

import SupplierAnalyticsPage from
        "../pages/suppliers/SupplierAnalyticsPage";

import ManagementReportsPage from
        "../pages/reports/ManagementReportsPage";

import ManagerDashboardPage from
        "../pages/manager/ManagerDashboardPage";

import UserAccountsPage from
        "../pages/manager/UserAccountsPage";

import UserAccountDetailsPage from
        "../pages/manager/UserAccountDetailsPage";

import InventoryReportsPage from
        "../pages/manager/InventoryReportsPage";

import OrderReportsPage from
        "../pages/manager/OrderReportsPage";

import MainLayout from
        "../layouts/MainLayout";

import ProtectedRoute from
        "./ProtectedRoute";

import PublicRoute from
        "./PublicRoute";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />
            </Route>

            <Route
                path="/unauthorized"
                element={<UnauthorizedPage />}
            />

            {/* All authenticated users */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route
                        path="/profile"
                        element={<ProfilePage />}
                    />

                    <Route
                        path="/notifications"
                        element={
                            <NotificationsPage />
                        }
                    />

                    <Route
                        path="/products"
                        element={
                            <ProductCatalogPage />
                        }
                    />

                    <Route
                        path="/products/:productId"
                        element={
                            <ProductDetailsPage />
                        }
                    />

                    {/* Customer-only routes */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "CUSTOMER",
                                ]}
                            />
                        }
                    >
                        <Route
                            path="/"
                            element={
                                <CustomerHomePage />
                            }
                        />

                        <Route
                            path="/loyalty"
                            element={<LoyaltyPage />}
                        />

                        <Route
                            path="/customer/cart"
                            element={<CartPage />}
                        />

                        <Route
                            path="/customer/checkout"
                            element={
                                <CheckoutPage />
                            }
                        />

                        <Route
                            path="/customer/order-success"
                            element={
                                <OrderSuccessPage />
                            }
                        />

                        <Route
                            path="/customer/orders"
                            element={<OrdersPage />}
                        />

                        <Route
                            path="/customer/orders/:orderId"
                            element={
                                <OrderDetailsPage />
                            }
                        />

                        <Route
                            path="/customer/orders/:orderId/invoice"
                            element={
                                <InvoicePage />
                            }
                        />
                    </Route>

                    {/* Sales staff and manager routes */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "SALES_STAFF",
                                    "MANAGER",
                                ]}
                            />
                        }
                    >
                        <Route
                            path="/sales/dashboard"
                            element={
                                <SalesDashboardPage />
                            }
                        />

                        <Route
                            path="/sales/customers"
                            element={
                                <CustomersPage />
                            }
                        />

                        <Route
                            path="/sales/customers/inactive"
                            element={
                                <InactiveCustomersPage />
                            }
                        />

                        <Route
                            path="/sales/customers/:customerId"
                            element={
                                <CustomerDetailsPage />
                            }
                        />

                        <Route
                            path="/sales/orders"
                            element={
                                <StaffOrdersPage />
                            }
                        />

                        <Route
                            path="/sales/orders/:orderId"
                            element={
                                <StaffOrderDetailsPage />
                            }
                        />
                    </Route>

                    {/* Inventory staff and manager routes */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "INVENTORY_STAFF",
                                    "MANAGER",
                                ]}
                            />
                        }
                    >
                        <Route
                            path="/inventory/dashboard"
                            element={
                                <InventoryDashboardPage />
                            }
                        />

                        <Route
                            path="/inventory/products"
                            element={
                                <InventoryProductsPage />
                            }
                        />

                        <Route
                            path="/inventory/products/new"
                            element={
                                <ProductFormPage />
                            }
                        />

                        <Route
                            path="/inventory/products/:productId/edit"
                            element={
                                <ProductFormPage />
                            }
                        />

                        <Route
                            path="/inventory/products/:productId/stock"
                            element={
                                <StockAdjustmentPage />
                            }
                        />

                        <Route
                            path="/inventory/categories"
                            element={
                                <CategoriesPage />
                            }
                        />

                        <Route
                            path="/inventory/low-stock-alerts"
                            element={
                                <LowStockAlertsPage />
                            }
                        />

                        {/* Supplier management route */}
                        <Route
                            path="/suppliers"
                            element={<SuppliersPage />}
                        />

                        <Route
                            path="/suppliers/:supplierId/products"
                            element={
                                <SupplierProductsPage />
                            }
                        />

                        <Route
                            path="/supplier-purchases"
                            element={
                                <SupplierPurchasesPage />
                            }
                        />
                    </Route>

                    {/* Manager-only routes */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "MANAGER",
                                ]}
                            />
                        }
                    >
                        <Route
                            path="/manager/dashboard"
                            element={
                                <ManagerDashboardPage />
                            }
                        />

                        <Route
                            path="/manager/users"
                            element={
                                <UserAccountsPage />
                            }
                        />

                        <Route
                            path="/manager/users/:userId"
                            element={
                                <UserAccountDetailsPage />
                            }
                        />

                        <Route
                            path="/manager/reports/inventory"
                            element={
                                <InventoryReportsPage />
                            }
                        />

                        <Route
                            path="/manager/order-reports"
                            element={
                                <OrderReportsPage />
                            }
                        />

                        <Route
                            path="/supplier-analytics"
                            element={
                                <SupplierAnalyticsPage />
                            }
                        />

                        <Route
                            path="/manager/reports"
                            element={
                                <ManagementReportsPage />
                            }
                        />
                    </Route>
                </Route>
            </Route>

            {/* Unknown URLs */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />
        </Routes>
    );
}
