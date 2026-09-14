import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { CarFront, LogIn } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { getApiError } from
        "../../utils/getApiError";

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

    const [error, setError] = useState("");
    const [submitting, setSubmitting] =
        useState(false);

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

            const requestedPage =
                location.state?.from;

            navigate(
                requestedPage ||
                getHomeRoute(user.role),
                {
                    replace: true,
                }
            );
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Login failed"
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-info">
                <CarFront size={54} />

                <span>SPAREHUB</span>

                <h1>
                    Automotive parts,
                    inventory and orders in
                    one connected system.
                </h1>
            </section>

            <section className="auth-form-section">
                <form
                    className="auth-card"
                    onSubmit={handleSubmit}
                >
                    <h2>Welcome back</h2>

                    <p>
                        Sign in to access your
                        SpareHub account.
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
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
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
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <button
                        className="primary-button"
                        disabled={submitting}
                    >
                        <LogIn size={18} />

                        {submitting
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                    <p className="auth-link">
                        New customer?{" "}

                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}