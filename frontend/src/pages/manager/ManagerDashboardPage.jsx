import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

import useAuth from "../../hooks/useAuth";

export default function ManagerDashboardPage() {
    const { user } = useAuth();

    return (
        <main className="dashboard-page">
            <span className="brand-label">
                MANAGER
            </span>

            <h1>Management Dashboard</h1>

            <p>
                Signed in as{" "}
                {user?.fullName ?? user?.email}
            </p>

            <section className="dashboard-actions">
                <Link
                    to="/manager/order-reports"
                    className="dashboard-action-card"
                >
                    <BarChart3 size={25} />

                    <div>
                        <h3>Sales &amp; Payments</h3>

                        <p>
                            Review sales performance,
                            payments, discounts and
                            refunds.
                        </p>
                    </div>
                </Link>
            </section>
        </main>
    );
}