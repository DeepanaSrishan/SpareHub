import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    Award,
    CarFront,
    CreditCard,
    Eye,
    EyeOff,
    LogIn,
    ShieldCheck,
    Truck,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { getApiError } from "../../utils/getApiError";

function getHomeRoute(role) {
    switch (role) {
        case "MANAGER":
            return "/manager/dashboard";

        case "SALES_STAFF":
            return "/sales/dashboard";

        case "INVENTORY_STAFF":
            return "/inventory/dashboard";

        default:
            return "/";
    }
}

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const message = location.state?.message;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            const user = await login(form);

            const requestedPage = location.state?.from;

            navigate(
                requestedPage || getHomeRoute(user.role),
                {
                    replace: true,
                }
            );
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Login failed. Please verify your credentials."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-info">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div className="brand-icon-wrapper" style={{ width: "48px", height: "48px" }}>
                        <CarFront size={26} />
                    </div>
                    <span className="brand-label">SPAREHUB AUTO</span>
                </div>

                <h1>
                    Genuine Auto Parts & Integrated Management.
                </h1>

                <p>
                    Access Sri Lanka's leading automotive spare parts catalog, track customer orders, and manage inventory with high precision.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "36px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                        <ShieldCheck size={20} style={{ color: "#38bdf8" }} />
                        <span>100% Genuine certified OEM & aftermarket parts</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                        <Truck size={20} style={{ color: "#38bdf8" }} />
                        <span>Island-wide rapid dispatch and tracking</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                        <CreditCard size={20} style={{ color: "#38bdf8" }} />
                        <span>Card, Direct Bank & Cash on Delivery payments</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#cbd5e1", fontSize: "0.95rem" }}>
                        <Award size={20} style={{ color: "#38bdf8" }} />
                        <span>Loyalty rewards tier discounts on every order</span>
                    </div>
                </div>
            </section>

            <section className="auth-form-section">
                <form
                    className="auth-card"
                    onSubmit={handleSubmit}
                >
                    <h2>Welcome Back</h2>

                    <p>
                        Sign in to access your SpareHub account.
                    </p>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <label>
                        Email address
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label>
                        Password
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                style={{ paddingRight: "44px" }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "transparent",
                                    border: 0,
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                    display: "grid",
                                    placeItems: "center",
                                    padding: 0,
                                }}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <button
                        className="primary-button"
                        style={{ marginTop: "16px" }}
                        disabled={submitting}
                    >
                        <LogIn size={18} />
                        <span>{submitting ? "Signing in..." : "Sign in to SpareHub"}</span>
                    </button>

                    <p className="auth-link">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create customer account
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}