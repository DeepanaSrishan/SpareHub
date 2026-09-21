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

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
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
        <main className="register-page">
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
                        Phone number
                        <input
                            name="phone"
                            placeholder="0771234567"
                            value={form.phone}
                            onChange={handleChange}
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
    );
}