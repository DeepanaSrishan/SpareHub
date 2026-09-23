import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Boxes,
  CarFront,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  LogOut,
  Menu,
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
import useScrollProgress from "../../hooks/useScrollProgress";
import ScrollProgress from "../common/ScrollProgress";
import MobileNavigation from "./MobileNavigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const isCustomer = normalizedRole === "CUSTOMER";
  const canManageCustomers =
    normalizedRole === "SALES_STAFF" || normalizedRole === "MANAGER";
  const canManageInventory =
    normalizedRole === "INVENTORY_STAFF" || normalizedRole === "MANAGER";
  const isManager = normalizedRole === "MANAGER";

  const cartQuantity = cart?.totalQuantity ?? 0;
  const { isScrolled } = useScrollProgress(20);

  const checkScrollable = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollable();
    const handleResize = () => checkScrollable();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(checkScrollable, 300);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [checkScrollable, isAuthenticated, normalizedRole]);

  const handleWheel = (e) => {
    if (navScrollRef.current) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      navScrollRef.current.scrollLeft += e.deltaY;
      checkScrollable();
    }
  };

  const scrollNav = (direction) => {
    if (navScrollRef.current) {
      const amount = direction === "left" ? -240 : 240;
      navScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(checkScrollable, 320);
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <>
      {/* Dynamic Scroll Progress Bar with Spring Easing */}
      <ScrollProgress />

      <header className={`navbar ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon-wrapper">
              <CarFront size={22} />
            </div>
            <span>
              SPARE<strong>HUB</strong>
            </span>
          </Link>

          {/* Desktop Scrollable Navigation Track */}
          <div className="desktop-nav-scroll-wrapper">
            {canScrollLeft && (
              <button
                type="button"
                className="nav-scroll-btn left"
                onClick={() => scrollNav("left")}
                aria-label="Scroll navigation left"
                title="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <nav
              className="desktop-nav"
              ref={navScrollRef}
              onWheel={handleWheel}
              onScroll={checkScrollable}
            >
              {isAuthenticated && (
                <>
                  {/* All authenticated users */}
                  <NavLink to="/products" className={getNavLinkClass}>
                    <PackageSearch size={17} />
                    <span>Products</span>
                  </NavLink>

                  {/* Sales Staff & Manager links */}
                  {canManageCustomers && (
                    <>
                      <NavLink to="/sales/customers" className={getNavLinkClass}>
                        <UserRound size={17} />
                        <span>Customers</span>
                      </NavLink>

                      <NavLink to="/sales/orders" className={getNavLinkClass}>
                        <ClipboardList size={17} />
                        <span>Orders</span>
                      </NavLink>
                    </>
                  )}

                  {/* Inventory Staff & Manager links */}
                  {canManageInventory && (
                    <>
                      <NavLink to="/inventory/products" className={getNavLinkClass}>
                        <PackagePlus size={17} />
                        <span>Manage Products</span>
                      </NavLink>

                      <NavLink to="/inventory/categories" className={getNavLinkClass}>
                        <Boxes size={17} />
                        <span>Categories</span>
                      </NavLink>

                      <NavLink to="/inventory/low-stock-alerts" className={getNavLinkClass}>
                        <AlertTriangle size={17} />
                        <span>Stock Alerts</span>
                      </NavLink>

                      <NavLink to="/suppliers" className={getNavLinkClass}>
                        <Truck size={17} />
                        <span>Suppliers</span>
                      </NavLink>

                      <NavLink to="/supplier-purchases" className={getNavLinkClass}>
                        <ShoppingBag size={17} />
                        <span>Purchases</span>
                      </NavLink>
                    </>
                  )}

                  {/* Manager-only links */}
                  {isManager && (
                    <>
                      <NavLink to="/manager/users" className={getNavLinkClass}>
                        <UserRound size={17} />
                        <span>User Accounts</span>
                      </NavLink>

                      <NavLink to="/manager/reports/inventory" className={getNavLinkClass}>
                        <ChartColumn size={17} />
                        <span>Inventory Reports</span>
                      </NavLink>

                      <NavLink to="/manager/order-reports" className={getNavLinkClass}>
                        <BarChart3 size={17} />
                        <span>Sales Reports</span>
                      </NavLink>

                      <NavLink to="/supplier-analytics" className={getNavLinkClass}>
                        <TrendingUp size={17} />
                        <span>Supplier Analytics</span>
                      </NavLink>

                      <NavLink to="/manager/reports" className={getNavLinkClass}>
                        <FileBarChart size={17} />
                        <span>Management Reports</span>
                      </NavLink>
                    </>
                  )}

                  {/* Customer-only links */}
                  {isCustomer && (
                    <>
                      <NavLink to="/loyalty" className={getNavLinkClass}>
                        <Award size={17} />
                        <span>Loyalty</span>
                      </NavLink>

                      <NavLink to="/customer/orders" className={getNavLinkClass}>
                        <ClipboardList size={17} />
                        <span>My Orders</span>
                      </NavLink>
                    </>
                  )}
                </>
              )}

              {!isAuthenticated && (
                <>
                  <NavLink to="/products" className={getNavLinkClass}>
                    <PackageSearch size={17} />
                    <span>Products</span>
                  </NavLink>
                </>
              )}
            </nav>

            {canScrollRight && (
              <button
                type="button"
                className="nav-scroll-btn right"
                onClick={() => scrollNav("right")}
                aria-label="Scroll navigation right"
                title="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Fixed Right Actions (Profile, Notifications, Cart, Logout) */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <NavLink
                    to="/customer/cart"
                    className={({ isActive }) =>
                      isActive
                        ? "navbar-cart-link active"
                        : "navbar-cart-link"
                    }
                    aria-label="Open shopping cart"
                  >
                    <ShoppingCart size={19} />
                    <span>Cart</span>

                    {cartQuantity > 0 && (
                      <span className="cart-count-badge">
                        {cartQuantity > 99 ? "99+" : cartQuantity}
                      </span>
                    )}
                  </NavLink>
                )}

                <NavLink to="/notifications" className={getNavLinkClass} title="Notifications">
                  <Bell size={17} />
                  <span>Notifications</span>
                </NavLink>

                <NavLink to="/profile" className={getNavLinkClass} title="User Profile">
                  <UserRound size={17} />
                  <span>Profile</span>
                </NavLink>

                <div className="nav-user-badge" title={`Signed in as ${normalizedRole}`}>
                  <UserRound size={13} />
                  <span>{user?.name || user?.fullName || normalizedRole}</span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="logout-button"
                  title="Log out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={getNavLinkClass}>
                  Login
                </NavLink>

                <NavLink to="/register" className="nav-register-btn">
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Cart quick-badge + Hamburger toggle */}
          <div className="mobile-header-controls">
            {isAuthenticated && isCustomer && (
              <NavLink
                to="/customer/cart"
                className="mobile-cart-btn"
                aria-label="View cart"
              >
                <ShoppingCart size={20} />
                {cartQuantity > 0 && (
                  <span className="cart-count-badge">
                    {cartQuantity > 99 ? "99+" : cartQuantity}
                  </span>
                )}
              </NavLink>
            )}

            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in Mobile Drawer */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        normalizedRole={normalizedRole}
        cartQuantity={cartQuantity}
        logout={logout}
      />
    </>
  );
}
