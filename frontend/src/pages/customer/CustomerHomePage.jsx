import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    Cpu,
    Gauge,
    Headphones,
    Layers,
    PackageCheck,
    PackageSearch,
    Search,
    ShieldAlert,
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
import { useAutoScrollReveal, useScrollReveal } from "../../hooks/useScrollReveal";
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
        accent: "#2563eb",
    },
    {
        number: "02",
        title: "Certified OEM & Aftermarket Standards",
        subtitle: "Lab Verified",
        desc: "Every component is thoroughly vetted against manufacturer tolerances, ensuring high longevity, strict safety, and uncompromised performance.",
        icon: ShieldCheck,
        accent: "#0284c7",
    },
    {
        number: "03",
        title: "Island-Wide Express Logistics",
        subtitle: "24-48h Delivery",
        desc: "Automated warehouse fulfillment and priority dispatch network deliver your auto parts safely across Sri Lanka with live tracking.",
        icon: Truck,
        accent: "#059669",
    },
    {
        number: "04",
        title: "Fitment Guarantee & Loyalty Benefits",
        subtitle: "Peace of Mind",
        desc: "Enjoy genuine replacement warranty, straightforward return policies, and automated loyalty tier discounts applied directly to every purchase.",
        icon: Award,
        accent: "#7c3aed",
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

function DiscIcon({ size = 22, ...props }) {
    return <CircleDot size={size} {...props} />;
}

/**
 * Animated number counter component that counts up once scrolled into view
 */
function AnimatedCounter({ target, suffix = "", decimals = 0, duration = 1800, isRevealed }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isRevealed) return;

        let startTime = null;
        let animationFrameId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOutProgress * target;

            setCount(currentVal);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isRevealed, target, duration]);

    const formatted = decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count).toLocaleString();

    return (
        <span className="counter-val">
            {formatted}{suffix}
        </span>
    );
}

export default function CustomerHomePage() {
    const { user } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);

    // Auto-reveal elements on scroll
    useAutoScrollReveal([]);

    // Specific scroll reveal for the metrics section
    const [metricsRef, metricsRevealed] = useScrollReveal({ threshold: 0.2 });

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

                // Determine active milestone based on scroll depth
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
        user?.fullName ||
        user?.name ||
        "Valued Customer";

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
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - navbarOffset,
                behavior: "smooth",
            });
        }
    };

    return (
        <main className="home-page">
            {/* Hero Section */}
            <section className="home-hero scroll-reveal is-revealed">
                <div className="home-hero-badge">
                    <Sparkles size={14} />
                    <span>Sri Lanka's Premier Auto Parts Network</span>
                </div>

                <h1>
                    Precision Engineered Parts,{" "}
                    <span className="text-gradient">Built for Every Road.</span>
                </h1>

                <p className="home-hero-desc">
                    Discover thousands of certified OEM & aftermarket spare parts for Japanese, European, and Asian vehicles with guaranteed compatibility and island-wide fast delivery.
                </p>

                {/* Instant Search Bar */}
                <form onSubmit={handleSearch} className="home-search-box">
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
                </form>

                {/* Trust Highlights */}
                <div className="home-trust-badges">
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
                </div>

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
            </section>

            {/* Interactive Scroll Quick-Nav Bar */}
            <nav className="scroll-quick-nav scroll-reveal" aria-label="Page Sections Quick Navigation">
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
            </nav>

            {/* Popular Vehicle Brands Quick Selector */}
            <section id="brands-section" className="home-section scroll-reveal">
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

                <div className="brands-row scroll-stagger">
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
            </section>

            {/* Featured Component Categories */}
            <section id="categories-section" className="home-section scroll-reveal">
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

                <div className="categories-grid scroll-stagger">
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
            </section>

            {/* Scroll-Driven Interactive Journey Section */}
            <section id="journey-section" className="home-section scroll-reveal" ref={journeyRef}>
                <div className="home-section-header">
                    <div>
                        <div className="section-eyebrow">The SpareHub Standard</div>
                        <h2>How We Deliver Precision Auto Parts</h2>
                    </div>
                    <div className="journey-scroll-status">
                        <span className="status-dot-pulse" />
                        <span>Step {activeJourneyIndex + 1} of {journeySteps.length}</span>
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
                                    className={`scroll-journey-card ${isActive ? "active" : ""} ${isPast ? "completed" : ""}`}
                                    onClick={() => setActiveJourneyIndex(idx)}
                                >
                                    <div className="journey-card-marker">
                                        <div className="journey-node-dot">
                                            {isPast ? <CheckCircle2 size={16} /> : step.number}
                                        </div>
                                    </div>

                                    <div className="journey-card-content">
                                        <div className="journey-card-header">
                                            <div className="journey-icon-wrap" style={{ color: step.accent }}>
                                                <StepIcon size={22} />
                                            </div>
                                            <div>
                                                <span className="journey-step-sub">{step.subtitle}</span>
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
            <section
                id="metrics-section"
                className={`home-section metrics-section scroll-reveal ${metricsRevealed ? "is-revealed" : ""}`}
                ref={metricsRef}
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

                <div className="metrics-grid scroll-stagger">
                    {impactMetrics.map((metric) => {
                        const MetricIcon = metric.icon;
                        return (
                            <div key={metric.title} className="metric-card">
                                <div className="metric-icon-box">
                                    <MetricIcon size={24} />
                                </div>
                                <div className="metric-value-wrap">
                                    <AnimatedCounter
                                        target={metric.target}
                                        suffix={metric.suffix}
                                        decimals={metric.decimals || 0}
                                        isRevealed={metricsRevealed}
                                    />
                                </div>
                                <h4>{metric.title}</h4>
                                <p>{metric.subtitle}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Customer Command Hub */}
            <section id="hub-section" className="home-section scroll-reveal">
                <div className="home-section-header">
                    <div>
                        <div className="section-eyebrow">Your Account</div>
                        <h2>Welcome back, {customerName}</h2>
                    </div>
                </div>

                <div className="customer-hub-grid scroll-stagger">
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
                                View your current loyalty tier, accumulated points, and exclusive discounts applied automatically at checkout.
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
                                Track ongoing dispatches, complete card/bank payments on pending orders, and download printable official invoices.
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
                                Review spare parts in your cart, calculate loyalty tier savings, and proceed to secure checkout.
                            </p>
                        </div>
                        <div className="hub-card-action">
                            <span>Go to Cart & Checkout</span>
                            <ChevronRight size={16} />
                        </div>
                    </Link>
                </div>
            </section>

            {/* Technical Assistance & VIN Compatibility Banner */}
            <section className="home-support-banner scroll-reveal scroll-reveal-scale">
                <div className="home-support-info">
                    <div className="brand-label" style={{ marginBottom: "8px" }}>
                        EXPERT TECHNICAL ASSISTANCE
                    </div>
                    <h3>Need Help Finding the Exact Part for Your Vehicle?</h3>
                    <p>
                        Our specialized automotive parts team is available to assist you with vehicle chassis number (VIN) compatibility checks and custom inquiries.
                    </p>
                </div>

                <div className="home-support-actions">
                    <Link to="/products" className="primary-button" style={{ width: "auto" }}>
                        <PackageSearch size={18} />
                        <span>Browse All Parts</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}