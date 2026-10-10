import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import {
    CarFront,
    Eye,
    EyeOff,
    UserPlus,
} from "lucide-react";

import authService from "../../services/authService";
import { getApiError } from "../../utils/getApiError";
import BikeAssemblyBackground from "../../components/common/BikeAssemblyBackground";

const initialForm = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
};

export default function RegisterPage() {
    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
            setForm((current) => ({
                ...current,
                phone: digitsOnly,
            }));
            return;
        }

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handlePhoneKeyDown = (event) => {
        if (
            [
                "Backspace",
                "Delete",
                "Tab",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "Enter",
            ].includes(event.key) ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return;
        }
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Password and confirmation do not match.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (form.phone && form.phone.trim()) {
            const trimmedPhone = form.phone.trim();
            if (!trimmedPhone.startsWith("0")) {
                setError("Phone number must start with 0 as per Sri Lankan standard (e.g. 07XXXXXXXX).");
                return;
            }
            if (trimmedPhone.length !== 10) {
                setError(`Phone number must contain exactly 10 digits (currently ${trimmedPhone.length}/10).`);
                return;
            }
            if (!/^0[1-9]\d{8}$/.test(trimmedPhone)) {
                setError("Please enter a valid 10-digit Sri Lankan phone number (e.g. 0771234567).");
                return;
            }
        }

        setSubmitting(true);

        try {
            const response = await authService.register(form);

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        response.welcomeMessage ||
                        "Welcome to SpareHub! Your account has been created successfully. Please sign in.",
                },
            });
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Registration failed. Please check your details."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bike-page-root">
            <BikeAssemblyBackground />
            <main className="register-page bike-page-content-wrapper">
                <form
                className="register-card"
                onSubmit={handleSubmit}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <div className="brand-icon-wrapper" style={{ width: "36px", height: "36px" }}>
                        <CarFront size={20} />
                    </div>
                    <span className="brand-label">SPAREHUB AUTO</span>
                </div>

                <h1>Create Customer Account</h1>

                <p>
                    Register to order genuine automotive spare parts, track dispatches, and earn tier loyalty rewards.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-grid">
                    <label>
                        Full name *
                        <input
                            name="fullName"
                            placeholder="e.g. Kasun Silva"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Phone number (10 digits)
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            name="phone"
                            placeholder="0771234567"
                            value={form.phone}
                            onChange={handleChange}
                            onKeyDown={handlePhoneKeyDown}
                        />
                    </label>

                    <label className="full-field">
                        Email address *
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Password (min 8 chars) *
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                style={{ paddingRight: "44px" }}
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

                    <label>
                        Confirm password *
                        <div style={{ position: "relative" }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={8}
                                style={{ paddingRight: "44px" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <label className="full-field">
                        Delivery address
                        <textarea
                            name="address"
                            placeholder="Street, City, Postal Code"
                            value={form.address}
                            onChange={handleChange}
                            rows={3}
                        />
                    </label>
                </div>

                <button
                    className="primary-button"
                    style={{ marginTop: "18px" }}
                    disabled={submitting}
                >
                    <UserPlus size={18} />
                    <span>{submitting ? "Creating account..." : "Register Account"}</span>
                </button>

                <p className="auth-link">
                    Already registered?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </form>
        </main>
    </div>
);
}