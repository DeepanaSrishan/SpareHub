import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import { UserPlus } from "lucide-react";

import authService from
        "../../services/authService";

import { getApiError } from
        "../../utils/getApiError";

const initialForm = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
};

export default function RegisterPage() {
    const [form, setForm] =
        useState(initialForm);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] =
        useState(false);

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

        if (
            form.password !==
            form.confirmPassword
        ) {
            setError(
                "Password and confirmation do not match"
            );

            return;
        }

        setSubmitting(true);

        try {
            const response =
                await authService.register(
                    form
                );

            navigate("/login", {
                replace: true,

                state: {
                    message:
                        response.welcomeMessage ||
                        "Welcome to SpareHub! Your account has been created successfully.",
                },
            });
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Registration failed"
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
                <span className="brand-label">
                    SPAREHUB
                </span>

                <h1>Create customer account</h1>

                <p>
                    Register to order automotive
                    spare parts and earn loyalty
                    rewards.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-grid">
                    <label>
                        Full name

                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Phone number

                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="0771234567"
                        />
                    </label>

                    <label className="full-field">
                        Email address

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Password

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                    </label>

                    <label>
                        Confirm password

                        <input
                            type="password"
                            name="confirmPassword"
                            value={
                                form.confirmPassword
                            }
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label className="full-field">
                        Address

                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows={3}
                        />
                    </label>
                </div>

                <button
                    className="primary-button"
                    disabled={submitting}
                >
                    <UserPlus size={18} />

                    {submitting
                        ? "Creating account..."
                        : "Create account"}
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