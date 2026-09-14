import useAuth from "../../hooks/useAuth";

export default function InventoryDashboardPage() {
    const { user } = useAuth();

    return (
        <main className="dashboard-page">
            <span className="brand-label">
                INVENTORY STAFF
            </span>

            <h1>Inventory Dashboard</h1>

            <p>
                Signed in as {user.fullName}
            </p>
        </main>
    );
}