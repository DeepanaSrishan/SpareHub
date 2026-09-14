import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";

import useAuth from "../../hooks/useAuth";

export default function SalesDashboardPage() {
    const { user } = useAuth();

    return (
        <main className="dashboard-page">
            <span className="brand-label">
                SALES STAFF
            </span>

            <h1>Sales Dashboard</h1>

            <p>
                Signed in as{" "}
                {user?.fullName ?? user?.email}
            </p>

            <section className="dashboard-actions">
                <Link
                    to="/sales/orders"
                    className="dashboard-action-card"
                >
                    <ClipboardList size={25} />

                    <div>
                        <h3>Customer Orders</h3>

                        <p>
                            Review, confirm, process and
                            complete customer orders.
                        </p>
                    </div>
                </Link>
            </section>
        </main>
    );
}