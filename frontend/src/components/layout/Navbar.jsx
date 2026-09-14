import {
    Link,
    NavLink,
} from "react-router-dom";

import {
    AlertTriangle,
    Award,
    BarChart3,
    Bell,
    Boxes,
    CarFront,
    ChartColumn,
    ClipboardList,
    LogOut,
    PackagePlus,
    PackageSearch,
    ShoppingCart,
    UserRound,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";

export default function Navbar() {
    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();

    const { cart } = useCart();

    /*
     * CUSTOMER සහ ROLE_CUSTOMER වැනි
     * role formats දෙකම support කරයි.
     */
    const normalizedRole = user?.role
        ?.replace("ROLE_", "")
        ?.toUpperCase();

    const isCustomer =
        normalizedRole === "CUSTOMER";

    const canManageCustomers =
        normalizedRole === "SALES_STAFF" ||
        normalizedRole === "MANAGER";

    const canManageInventory =
        normalizedRole === "INVENTORY_STAFF" ||
        normalizedRole === "MANAGER";

    const isManager =
        normalizedRole === "MANAGER";

    const cartQuantity =
        cart?.totalQuantity ?? 0;

    return (
        <header className="navbar">
            <Link
                to="/"
                className="navbar-brand"
            >
                <CarFront />

                <span>
                    SPARE<strong>HUB</strong>
                </span>
            </Link>

            <nav>
                {isAuthenticated && (
                    <>
                        <NavLink to="/products">
                            <PackageSearch size={18} />
                            <span>Products</span>
                        </NavLink>

                        {/* Sales Staff සහ Manager links */}
                        {canManageCustomers && (
                            <>
                                <NavLink to="/sales/customers">
                                    <UserRound size={18} />
                                    <span>Customers</span>
                                </NavLink>

                                <Link
                                    to="/sales/orders"
                                    className="nav-link"
                                >
                                    <ClipboardList size={18} />
                                    <span>Orders</span>
                                </Link>
                            </>
                        )}

                        {/* Inventory Staff සහ Manager links */}
                        {canManageInventory && (
                            <>
                                <NavLink
                                    to="/inventory/products"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >
                                    <PackagePlus size={18} />
                                    <span>Manage Products</span>
                                </NavLink>

                                <NavLink
                                    to="/inventory/categories"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >
                                    <Boxes size={18} />
                                    <span>Categories</span>
                                </NavLink>

                                <NavLink
                                    to="/inventory/low-stock-alerts"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >
                                    <AlertTriangle size={18} />
                                    <span>Stock Alerts</span>
                                </NavLink>
                            </>
                        )}

                        {/* Manager-only links */}
                        {isManager && (
                            <>
                                <NavLink to="/manager/users">
                                    <UserRound size={18} />
                                    <span>
                                        User Accounts
                                    </span>
                                </NavLink>

                                <NavLink to="/manager/reports/inventory">
                                    <ChartColumn size={18} />
                                    <span>
                                        Inventory Reports
                                    </span>
                                </NavLink>

                                <Link
                                    to="/manager/order-reports"
                                    className="nav-link"
                                >
                                    <BarChart3 size={18} />
                                    <span>
                                        Sales Reports
                                    </span>
                                </Link>
                            </>
                        )}

                        <NavLink to="/profile">
                            <UserRound size={18} />
                            <span>Profile</span>
                        </NavLink>

                        {/* Customer-only links */}
                        {isCustomer && (
                            <>
                                <NavLink to="/loyalty">
                                    <Award size={18} />
                                    <span>Loyalty</span>
                                </NavLink>

                                <NavLink
                                    to="/customer/orders"
                                    className="nav-link"
                                >
                                    <ClipboardList size={18} />
                                    <span>My Orders</span>
                                </NavLink>

                                <Link
                                    to="/customer/cart"
                                    className="navbar-cart-link"
                                    aria-label="Open shopping cart"
                                >
                                    <ShoppingCart size={21} />
                                    <span>Cart</span>

                                    {cartQuantity > 0 && (
                                        <span className="cart-count-badge">
                                            {cartQuantity > 99
                                                ? "99+"
                                                : cartQuantity}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        <NavLink to="/notifications">
                            <Bell size={18} />
                            <span>Notifications</span>
                        </NavLink>

                        <button
                            type="button"
                            onClick={logout}
                            className="logout-button"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </>
                )}

                {!isAuthenticated && (
                    <>
                        <NavLink to="/products">
                            <PackageSearch size={18} />
                            <span>Products</span>
                        </NavLink>

                        <NavLink to="/login">
                            Login
                        </NavLink>

                        <NavLink to="/register">
                            Register
                        </NavLink>
                    </>
                )}
            </nav>
        </header>
    );
}