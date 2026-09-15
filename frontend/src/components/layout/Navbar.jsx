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
    FileBarChart,
    LogOut,
    PackagePlus,
    PackageSearch,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    Truck,
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

    const getNavLinkClass = ({
                                 isActive,
                             }) =>
        isActive
            ? "nav-link active"
            : "nav-link";

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
                        {/* All authenticated users */}
                        <NavLink
                            to="/products"
                            className={
                                getNavLinkClass
                            }
                        >
                            <PackageSearch
                                size={18}
                            />

                            <span>Products</span>
                        </NavLink>

                        {/* Sales Staff සහ Manager links */}
                        {canManageCustomers && (
                            <>
                                <NavLink
                                    to="/sales/customers"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <UserRound
                                        size={18}
                                    />

                                    <span>
                                        Customers
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/sales/orders"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <ClipboardList
                                        size={18}
                                    />

                                    <span>
                                        Orders
                                    </span>
                                </NavLink>
                            </>
                        )}

                        {/* Inventory Staff සහ Manager links */}
                        {canManageInventory && (
                            <>
                                <NavLink
                                    to="/inventory/products"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <PackagePlus
                                        size={18}
                                    />

                                    <span>
                                        Manage Products
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/inventory/categories"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <Boxes
                                        size={18}
                                    />

                                    <span>
                                        Categories
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/inventory/low-stock-alerts"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <AlertTriangle
                                        size={18}
                                    />

                                    <span>
                                        Stock Alerts
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/suppliers"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <Truck
                                        size={18}
                                    />

                                    <span>
                                        Suppliers
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/supplier-purchases"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <ShoppingBag
                                        size={18}
                                    />

                                    <span>
                                        Purchases
                                    </span>
                                </NavLink>
                            </>
                        )}

                        {/* Manager-only links */}
                        {isManager && (
                            <>
                                <NavLink
                                    to="/manager/users"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <UserRound
                                        size={18}
                                    />

                                    <span>
                                        User Accounts
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/manager/reports/inventory"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <ChartColumn
                                        size={18}
                                    />

                                    <span>
                                        Inventory Reports
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/manager/order-reports"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <BarChart3
                                        size={18}
                                    />

                                    <span>
                                        Sales Reports
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/supplier-analytics"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <TrendingUp
                                        size={18}
                                    />

                                    <span>
                                        Supplier Analytics
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/manager/reports"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <FileBarChart
                                        size={18}
                                    />

                                    <span>
                                        Management Reports
                                    </span>
                                </NavLink>
                            </>
                        )}

                        <NavLink
                            to="/profile"
                            className={
                                getNavLinkClass
                            }
                        >
                            <UserRound size={18} />
                            <span>Profile</span>
                        </NavLink>

                        {/* Customer-only links */}
                        {isCustomer && (
                            <>
                                <NavLink
                                    to="/loyalty"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <Award
                                        size={18}
                                    />

                                    <span>
                                        Loyalty
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/customer/orders"
                                    className={
                                        getNavLinkClass
                                    }
                                >
                                    <ClipboardList
                                        size={18}
                                    />

                                    <span>
                                        My Orders
                                    </span>
                                </NavLink>

                                <NavLink
                                    to="/customer/cart"
                                    className={({
                                                    isActive,
                                                }) =>
                                        isActive
                                            ? "navbar-cart-link active"
                                            : "navbar-cart-link"
                                    }
                                    aria-label="Open shopping cart"
                                >
                                    <ShoppingCart
                                        size={21}
                                    />

                                    <span>Cart</span>

                                    {cartQuantity >
                                        0 && (
                                            <span className="cart-count-badge">
                                            {cartQuantity >
                                            99
                                                ? "99+"
                                                : cartQuantity}
                                        </span>
                                        )}
                                </NavLink>
                            </>
                        )}

                        <NavLink
                            to="/notifications"
                            className={
                                getNavLinkClass
                            }
                        >
                            <Bell size={18} />

                            <span>
                                Notifications
                            </span>
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
                        <NavLink
                            to="/products"
                            className={
                                getNavLinkClass
                            }
                        >
                            <PackageSearch
                                size={18}
                            />

                            <span>Products</span>
                        </NavLink>

                        <NavLink
                            to="/login"
                            className={
                                getNavLinkClass
                            }
                        >
                            Login
                        </NavLink>

                        <NavLink
                            to="/register"
                            className={
                                getNavLinkClass
                            }
                        >
                            Register
                        </NavLink>
                    </>
                )}
            </nav>
        </header>
    );
}
