import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  LogIn,
  LogOut,
  PackagePlus,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

/**
 * MobileNavigation provides a touch-optimized slide-in drawer
 * for mobile devices with Framer Motion animations and role-aware links.
 */
export default function MobileNavigation({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  normalizedRole,
  cartQuantity = 0,
  logout,
}) {
  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isCustomer = normalizedRole === "CUSTOMER";
  const canManageCustomers =
    normalizedRole === "SALES_STAFF" || normalizedRole === "MANAGER";
  const canManageInventory =
    normalizedRole === "INVENTORY_STAFF" || normalizedRole === "MANAGER";
  const isManager = normalizedRole === "MANAGER";

  const handleLinkClick = () => {
    onClose();
  };

  const getLinkClass = ({ isActive }) =>
    isActive ? "mobile-nav-link active" : "mobile-nav-link";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="mobile-nav-portal" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop */}
          <motion.div
            className="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="mobile-nav-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="mobile-nav-header">
              <div className="navbar-brand">
                <div className="brand-icon-wrapper">
                  <CarFront size={20} />
                </div>
                <span>
                  SPARE<strong>HUB</strong>
                </span>
              </div>

              <button
                type="button"
                className="mobile-nav-close-btn"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* User status card (if logged in) */}
            {isAuthenticated && (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  <UserRound size={20} />
                </div>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">
                    {user?.name || user?.fullName || user?.email || "User"}
                  </div>
                  <div className="mobile-user-role-badge">
                    {normalizedRole}
                  </div>
                </div>
              </div>
            )}

            {/* Links list */}
            <div className="mobile-nav-body">
              <nav className="mobile-nav-links">
                {/* Products link visible to everyone */}
                <NavLink
                  to="/products"
                  className={getLinkClass}
                  onClick={handleLinkClick}
                >
                  <PackageSearch size={20} />
                  <span>Explore Products</span>
                </NavLink>

                {isAuthenticated && (
                  <>
                    {/* Customer Links */}
                    {isCustomer && (
                      <>
                        <div className="mobile-nav-section-title">Customer Store</div>
                        <NavLink
                          to="/customer/cart"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <ShoppingCart size={20} />
                          <span>My Cart</span>
                          {cartQuantity > 0 && (
                            <span className="cart-count-badge">
                              {cartQuantity > 99 ? "99+" : cartQuantity}
                            </span>
                          )}
                        </NavLink>

                        <NavLink
                          to="/customer/orders"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <ClipboardList size={20} />
                          <span>My Orders</span>
                        </NavLink>

                        <NavLink
                          to="/loyalty"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <Award size={20} />
                          <span>Loyalty Rewards</span>
                        </NavLink>
                      </>
                    )}

                    {/* Sales Staff / Manager Links */}
                    {canManageCustomers && (
                      <>
                        <div className="mobile-nav-section-title">Sales Management</div>
                        <NavLink
                          to="/sales/customers"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <UserRound size={20} />
                          <span>Customers</span>
                        </NavLink>

                        <NavLink
                          to="/sales/orders"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <ClipboardList size={20} />
                          <span>Customer Orders</span>
                        </NavLink>
                      </>
                    )}

                    {/* Inventory Staff / Manager Links */}
                    {canManageInventory && (
                      <>
                        <div className="mobile-nav-section-title">Inventory Operations</div>
                        <NavLink
                          to="/inventory/products"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <PackagePlus size={20} />
                          <span>Manage Products</span>
                        </NavLink>

                        <NavLink
                          to="/inventory/categories"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <Boxes size={20} />
                          <span>Categories</span>
                        </NavLink>

                        <NavLink
                          to="/inventory/low-stock-alerts"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <AlertTriangle size={20} />
                          <span>Stock Alerts</span>
                        </NavLink>

                        <NavLink
                          to="/suppliers"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <Truck size={20} />
                          <span>Suppliers</span>
                        </NavLink>

                        <NavLink
                          to="/supplier-purchases"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <ShoppingBag size={20} />
                          <span>Purchases</span>
                        </NavLink>
                      </>
                    )}

                    {/* Manager Only */}
                    {isManager && (
                      <>
                        <div className="mobile-nav-section-title">Executive Management</div>
                        <NavLink
                          to="/manager/users"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <UserRound size={20} />
                          <span>User Accounts</span>
                        </NavLink>

                        <NavLink
                          to="/manager/reports/inventory"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <ChartColumn size={20} />
                          <span>Inventory Reports</span>
                        </NavLink>

                        <NavLink
                          to="/manager/order-reports"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <BarChart3 size={20} />
                          <span>Sales Reports</span>
                        </NavLink>

                        <NavLink
                          to="/supplier-analytics"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <TrendingUp size={20} />
                          <span>Supplier Analytics</span>
                        </NavLink>

                        <NavLink
                          to="/manager/reports"
                          className={getLinkClass}
                          onClick={handleLinkClick}
                        >
                          <FileBarChart size={20} />
                          <span>Management Reports</span>
                        </NavLink>
                      </>
                    )}

                    {/* General authenticated links */}
                    <div className="mobile-nav-section-title">Account</div>
                    <NavLink
                      to="/profile"
                      className={getLinkClass}
                      onClick={handleLinkClick}
                    >
                      <UserRound size={20} />
                      <span>My Profile</span>
                    </NavLink>

                    <NavLink
                      to="/notifications"
                      className={getLinkClass}
                      onClick={handleLinkClick}
                    >
                      <Bell size={20} />
                      <span>Notifications</span>
                    </NavLink>
                  </>
                )}

                {/* Unauthenticated Links */}
                {!isAuthenticated && (
                  <>
                    <div className="mobile-nav-section-title">Account Access</div>
                    <NavLink
                      to="/login"
                      className={getLinkClass}
                      onClick={handleLinkClick}
                    >
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </NavLink>

                    <NavLink
                      to="/register"
                      className={getLinkClass}
                      onClick={handleLinkClick}
                    >
                      <UserPlus size={20} />
                      <span>Create Account</span>
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            {/* Footer / Logout */}
            {isAuthenticated && (
              <div className="mobile-nav-footer">
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
