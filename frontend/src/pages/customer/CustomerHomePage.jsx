import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  Award,
  CarFront,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Clock,
  CreditCard,
  Gauge,
  Layers,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import AnimatedSection from "../../components/common/AnimatedSection";
import AnimatedNumber from "../../components/common/AnimatedNumber";
import VehicleAssemblyBackground from "../../components/home/VehicleAssemblyBackground";
import "../../styles/home.css";

const vehicleBrands = [
  { name: "Toyota", popular: true },
  { name: "Nissan", popular: true },
  { name: "Honda", popular: true },
  { name: "Mitsubishi", popular: true },
  { name: "Suzuki", popular: true },
  { name: "Hyundai", popular: true },
  { name: "Mazda", popular: false },
  { name: "BMW", popular: false },
];

function DiscIcon({ size = 22, ...props }) {
  return <CircleDot size={size} {...props} />;
}

const featuredCategories = [
  {
    title: "Brakes & Friction",
    desc: "Ceramic pads, brake discs, calipers & ABS sensors.",
    icon: DiscIcon,
    query: "Brake",
  },
  {
    title: "Engine & Filtration",
    desc: "Oil filters, air filters, spark plugs, timing belts & gaskets.",
    icon: Wrench,
    query: "Engine",
  },
  {
    title: "Suspension & Steering",
    desc: "Shock absorbers, struts, tie rods, control arms & bushings.",
    icon: Layers,
    query: "Suspension",
  },
  {
    title: "Transmission & Clutch",
    desc: "Clutch kits, flywheels, transmission mounts & gear fluids.",
    icon: Gauge,
    query: "Transmission",
  },
  {
    title: "Electrical & Lighting",
    desc: "LED headlamps, alternators, starter motors & battery terminals.",
    icon: Zap,
    query: "Electrical",
  },
  {
    title: "Cooling & AC Parts",
    desc: "Radiators, water pumps, thermostats & AC compressors.",
    icon: CircleDot,
    query: "Cooling",
  },
];

const journeySteps = [
  {
    number: "01",
    title: "Precision VIN & Part Search",
    subtitle: "Instant Lookup",
    desc: "Input your vehicle chassis number (VIN) or search by model & part number to get zero-error compatibility matches instantly.",
    icon: Search,
    accent: "#B8F34A",
  },
  {
    number: "02",
    title: "Certified OEM & Aftermarket Standards",
    subtitle: "Lab Verified",
    desc: "Every component is thoroughly vetted against manufacturer tolerances, ensuring high longevity, strict safety, and uncompromised performance.",
    icon: ShieldCheck,
    accent: "#38BDF8",
  },
  {
    number: "03",
    title: "Island-Wide Express Logistics",
    subtitle: "24-48h Delivery",
    desc: "Automated warehouse fulfillment and priority dispatch network deliver your auto parts safely across Sri Lanka with live tracking.",
    icon: Truck,
    accent: "#22C55E",
  },
  {
    number: "04",
    title: "Fitment Guarantee & Loyalty Benefits",
    subtitle: "Peace of Mind",
    desc: "Enjoy genuine replacement warranty, straightforward return policies, and automated loyalty tier discounts applied directly to every purchase.",
    icon: Award,
    accent: "#FBBF24",
  },
];

const impactMetrics = [
  {
    target: 50000,
    suffix: "+",
    title: "Certified Spare Parts",
    subtitle: "OEM & quality aftermarket components in active stock",
    icon: PackageCheck,
  },
  {
    target: 99.8,
    decimals: 1,
    suffix: "%",
    title: "Fitment Accuracy",
    subtitle: "Guaranteed vehicle chassis & specification match",
    icon: CheckCircle2,
  },
  {
    target: 25,
    suffix: "+",
    title: "Supported Vehicle Makes",
    subtitle: "Japanese, European, and Asian auto brands covered",
    icon: CarFront,
  },
  {
    target: 24,
    suffix: "h",
    title: "Express Dispatch",
    subtitle: "Fast priority island-wide courier fulfillment",
    icon: Clock,
  },
];

export default function CustomerHomePage() {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);

  // Interactive journey scroll-progress track
  const journeyRef = useRef(null);
  const [journeyProgress, setJourneyProgress] = useState(0);

  useEffect(() => {
    const handleJourneyScroll = () => {
      if (!journeyRef.current) return;
      const rect = journeyRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far through the journey section the user has scrolled
      const totalDistance = rect.height - 150;
      const currentScrolled = windowHeight - rect.top - 200;

      if (currentScrolled <= 0) {
        setJourneyProgress(0);
        setActiveJourneyIndex(0);
      } else if (currentScrolled >= totalDistance) {
        setJourneyProgress(100);
        setActiveJourneyIndex(journeySteps.length - 1);
      } else {
        const pct = (currentScrolled / totalDistance) * 100;
        setJourneyProgress(pct);

        const stepFraction = 100 / journeySteps.length;
        const activeIndex = Math.min(
          journeySteps.length - 1,
          Math.floor(pct / stepFraction)
        );
        setActiveJourneyIndex(activeIndex);
      }
    };

    window.addEventListener("scroll", handleJourneyScroll, { passive: true });
    handleJourneyScroll();

    return () => window.removeEventListener("scroll", handleJourneyScroll);
  }, []);

  const customerName =
    user?.fullName || user?.name || "Valued Customer";

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  const cartCount = cart?.totalQuantity ?? 0;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navbarOffset = 80;
      const elementPosition =
        el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarOffset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="home-page-root" ref={pageRef}>
      {/* Full-Screen 3D Exploded Vehicle Assembly Canvas Background */}
      <VehicleAssemblyBackground targetRef={pageRef} />

      <main className="home-page">
      {/* Cinematic Hero Section */}
      <motion.section
        className="home-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="home-hero-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Sparkles size={14} />
          <span>Sri Lanka's Premier Auto Parts Network</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
        >
          Precision Engineered Parts,{" "}
          <span className="text-gradient">Built for Every Road.</span>
        </motion.h1>

        <motion.p
          className="home-hero-desc"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        >
          Discover thousands of certified OEM & aftermarket spare parts for
          Japanese, European, and Asian vehicles with guaranteed compatibility
          and island-wide fast delivery.
        </motion.p>

        {/* Instant Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          className="home-search-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55 }}
        >
          <Search className="home-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by part number, model, brand, or component (e.g. Brake Pads, Oil Filter, Toyota)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="home-search-btn">
            <Search size={16} />
            <span>Search Parts</span>
          </button>
        </motion.form>

        {/* Trust Highlights */}
        <motion.div
          className="home-trust-badges"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <div className="trust-badge-item">
            <ShieldCheck size={16} />
            <span>100% Genuine Certified</span>
          </div>
          <div className="trust-badge-item">
            <Truck size={16} />
            <span>Island-wide Express Delivery</span>
          </div>
          <div className="trust-badge-item">
            <CreditCard size={16} />
            <span>Card, Bank & COD Payments</span>
          </div>
          <div className="trust-badge-item">
            <Award size={16} />
            <span>Loyalty Discounts on Every Order</span>
          </div>
        </motion.div>

        {/* Quick Scroll Indicator */}
        <div className="hero-scroll-cue">
          <button
            type="button"
            className="hero-scroll-btn"
            onClick={() => scrollToSection("brands-section")}
          >
            <span>Explore Storefront</span>
            <ArrowDown size={14} className="bounce-arrow" />
          </button>
        </div>
      </motion.section>

      {/* Interactive Scroll Quick-Nav Bar */}
      <motion.nav
        className="scroll-quick-nav"
        aria-label="Page Sections Quick Navigation"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <button
          type="button"
          className="quick-nav-pill"
          onClick={() => scrollToSection("brands-section")}
        >
          <CarFront size={15} />
          <span>Vehicle Brands</span>
        </button>
        <button
          type="button"
          className="quick-nav-pill"
          onClick={() => scrollToSection("categories-section")}
        >
          <Layers size={15} />
          <span>Part Categories</span>
        </button>
        <button
          type="button"
          className="quick-nav-pill"
          onClick={() => scrollToSection("journey-section")}
        >
          <Zap size={15} />
          <span>SpareHub Journey</span>
        </button>
        <button
          type="button"
          className="quick-nav-pill"
          onClick={() => scrollToSection("metrics-section")}
        >
          <Activity size={15} />
          <span>Precision Metrics</span>
        </button>
        <button
          type="button"
          className="quick-nav-pill"
          onClick={() => scrollToSection("hub-section")}
        >
          <Sparkles size={15} />
          <span>Customer Command Hub</span>
        </button>
      </motion.nav>

      {/* Popular Vehicle Brands Quick Selector */}
      <AnimatedSection id="brands-section" className="home-section" direction="up">
        <div className="home-section-header">
          <div>
            <div className="section-eyebrow">Search By Make</div>
            <h2>Popular Vehicle Brands</h2>
          </div>
          <Link to="/products" className="view-all-link">
            <span>View all parts</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="brands-row">
          {vehicleBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="brand-chip"
            >
              <span className="brand-dot" />
              <span>{brand.name}</span>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* Featured Component Categories */}
      <AnimatedSection id="categories-section" className="home-section" direction="up" delay={0.05}>
        <div className="home-section-header">
          <div>
            <div className="section-eyebrow">Explore Inventory</div>
            <h2>Featured Part Categories</h2>
          </div>
          <Link to="/products" className="view-all-link">
            <span>Explore full catalog</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="categories-grid">
          {featuredCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.title}
                to={`/products?search=${encodeURIComponent(category.query)}`}
                className="category-card"
              >
                <div className="category-card-icon">
                  <IconComponent size={24} />
                </div>
                <div className="category-card-info">
                  <h3>{category.title}</h3>
                  <p>{category.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Scroll-Driven Interactive Journey Section */}
      <section
        id="journey-section"
        className="home-section"
        ref={journeyRef}
      >
        <div className="home-section-header">
          <div>
            <div className="section-eyebrow">The SpareHub Standard</div>
            <h2>How We Deliver Precision Auto Parts</h2>
          </div>
          <div className="journey-scroll-status">
            <span className="status-dot-pulse" />
            <span>
              Step {activeJourneyIndex + 1} of {journeySteps.length}
            </span>
          </div>
        </div>

        <div className="scroll-journey-container">
          {/* Dynamic Connecting Laser Track */}
          <div className="scroll-journey-track-bg">
            <div
              className="scroll-journey-track-fill"
              style={{ height: `${journeyProgress}%` }}
            />
          </div>

          {/* Interactive Steps */}
          <div className="scroll-journey-steps">
            {journeySteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === activeJourneyIndex;
              const isPast = idx < activeJourneyIndex;

              return (
                <div
                  key={step.number}
                  className={`scroll-journey-card ${
                    isActive ? "active" : ""
                  } ${isPast ? "completed" : ""}`}
                  onClick={() => setActiveJourneyIndex(idx)}
                >
                  <div className="journey-card-marker">
                    <div className="journey-node-dot">
                      {isPast ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        step.number
                      )}
                    </div>
                  </div>

                  <div className="journey-card-content">
                    <div className="journey-card-header">
                      <div
                        className="journey-icon-wrap"
                        style={{ color: step.accent }}
                      >
                        <StepIcon size={22} />
                      </div>
                      <div>
                        <span className="journey-step-sub">
                          {step.subtitle}
                        </span>
                        <h3>{step.title}</h3>
                      </div>
                    </div>
                    <p>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scroll-Triggered Live Impact Metrics */}
      <AnimatedSection
        id="metrics-section"
        className="home-section metrics-section"
        direction="up"
      >
        <div className="home-section-header">
          <div>
            <div className="section-eyebrow">Guaranteed Reliability</div>
            <h2>SpareHub By The Numbers</h2>
          </div>
          <div className="live-metrics-indicator">
            <TrendingUp size={16} />
            <span>Live Verification Metrics</span>
          </div>
        </div>

        <div className="metrics-grid">
          {impactMetrics.map((metric) => {
            const MetricIcon = metric.icon;
            return (
              <div key={metric.title} className="metric-card">
                <div className="metric-icon-box">
                  <MetricIcon size={24} />
                </div>
                <div className="metric-value-wrap">
                  <AnimatedNumber
                    value={metric.target}
                    suffix={metric.suffix}
                    decimals={metric.decimals || 0}
                  />
                </div>
                <h4>{metric.title}</h4>
                <p>{metric.subtitle}</p>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* Customer Command Hub */}
      <AnimatedSection id="hub-section" className="home-section" direction="up">
        <div className="home-section-header">
          <div>
            <div className="section-eyebrow">Your Account</div>
            <h2>Welcome back, {customerName}</h2>
          </div>
        </div>

        <div className="customer-hub-grid">
          {/* Loyalty Rewards */}
          <Link to="/loyalty" className="hub-card">
            <div className="hub-card-top">
              <div className="hub-icon-wrapper">
                <Award size={22} />
              </div>
              <span className="brand-label">LOYALTY PROGRAM</span>
            </div>
            <div>
              <h3>Loyalty Tier & Benefits</h3>
              <p>
                View your current loyalty tier, accumulated points, and
                exclusive discounts applied automatically at checkout.
              </p>
            </div>
            <div className="hub-card-action">
              <span>Check My Rewards</span>
              <ChevronRight size={16} />
            </div>
          </Link>

          {/* Orders Tracking */}
          <Link to="/customer/orders" className="hub-card">
            <div className="hub-card-top">
              <div className="hub-icon-wrapper">
                <ClipboardList size={22} />
              </div>
              <span className="brand-label">ORDERS</span>
            </div>
            <div>
              <h3>Orders & Invoices</h3>
              <p>
                Track ongoing dispatches, complete card/bank payments on
                pending orders, and download printable official invoices.
              </p>
            </div>
            <div className="hub-card-action">
              <span>Track Orders</span>
              <ChevronRight size={16} />
            </div>
          </Link>

          {/* Shopping Cart */}
          <Link to="/customer/cart" className="hub-card">
            <div className="hub-card-top">
              <div className="hub-icon-wrapper">
                <ShoppingCart size={22} />
              </div>
              <span className="brand-label">
                {cartCount > 0 ? `${cartCount} ITEMS IN CART` : "CART"}
              </span>
            </div>
            <div>
              <h3>Shopping Cart</h3>
              <p>
                Review spare parts in your cart, calculate loyalty tier
                savings, and proceed to secure checkout.
              </p>
            </div>
            <div className="hub-card-action">
              <span>Go to Cart & Checkout</span>
              <ChevronRight size={16} />
            </div>
          </Link>
        </div>
      </AnimatedSection>

      {/* Technical Assistance & VIN Compatibility Banner */}
      <AnimatedSection className="home-support-banner" direction="zoom">
        <div className="home-support-info">
          <div className="brand-label" style={{ marginBottom: "8px", color: "var(--primary-lime)" }}>
            EXPERT TECHNICAL ASSISTANCE
          </div>
          <h3>Need Help Finding the Exact Part for Your Vehicle?</h3>
          <p>
            Our specialized automotive parts team is available to assist you
            with vehicle chassis number (VIN) compatibility checks and custom
            inquiries.
          </p>
        </div>

        <div className="home-support-actions">
          <Link
            to="/products"
            className="primary-button"
            style={{ width: "auto" }}
          >
            <PackageSearch size={18} />
            <span>Browse All Parts</span>
          </Link>
        </div>
      </AnimatedSection>
    </main>
  </div>
);
}