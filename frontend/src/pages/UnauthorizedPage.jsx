import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

import useAuth from "../hooks/useAuth";

export default function UnauthorizedPage() {
    const { user } = useAuth();

    const role = user?.role
        ?.replace(/^ROLE_/, "")
        ?.toUpperCase();

    const homePath = (() => {
        switch (role) {
            case "MANAGER":
                return "/manager/dashboard";

            case "SALES_STAFF":
                return "/sales/dashboard";

            case "INVENTORY_STAFF":
                return "/inventory/dashboard";

            case "CUSTOMER":
                return "/";

            default:
                return "/login";
        }
    })();

    return (
        <main className="unauthorized-page">
            <section className="unauthorized-card">
                <ShieldX size={54} />

                <h1>Access denied</h1>

                <p>
                    Your account does not have
                    permission to access this page.
                </p>

                <Link
                    to={homePath}
                    className="primary-button"
                >
                    Return to home
                </Link>
            </section>
        </main>
    );
}