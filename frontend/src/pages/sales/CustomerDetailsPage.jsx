import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import customerManagementService from "../../services/customerManagementService";
import StatusBadge from "../../components/common/StatusBadge";
import "../../styles/customerManagement.css";

function CustomerDetailsPage() {
    const { customerId } = useParams();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [activeTab, setActiveTab] = useState("orders"); // "orders" | "transactions"

    const [selectedTier, setSelectedTier] =
        useState("BRONZE");

    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] =
        useState(0);

    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [historyLoading, setHistoryLoading] =
        useState(true);
    const [tierSaving, setTierSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadCustomer();
        loadCustomerOrders();
    }, [customerId]);

    useEffect(() => {
        loadCustomerHistory();
    }, [customerId, historyPage]);

    const loadCustomer = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await customerManagementService.getCustomerById(
                    customerId
                );

            setCustomer(data);
            setSelectedTier((data?.loyaltyTier ?? "BRONZE").toUpperCase());
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Customer information load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadCustomerOrders = async () => {
        try {
            setOrdersLoading(true);
            const data =
                await customerManagementService.getCustomerOrders(customerId);
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadCustomerHistory = async () => {
        try {
            setHistoryLoading(true);

            const data =
                await customerManagementService.getCustomerHistory(
                    customerId,
                    historyPage,
                    10
                );

            if (Array.isArray(data)) {
                setTransactions(data);
                setHistoryTotalPages(data.length > 0 ? 1 : 0);
            } else {
                setTransactions(data?.content ?? []);
                setHistoryTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Transaction history load කිරීම අසාර්ථකයි."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleTierUpdate = async () => {
        try {
            setTierSaving(true);
            setError("");
            setSuccessMessage("");

            const updatedCustomer =
                await customerManagementService.updateLoyaltyTier(
                    customerId,
                    selectedTier
                );

            const updatedTierName =
                updatedCustomer?.currentTier ??
                updatedCustomer?.loyaltyTier ??
                selectedTier;

            setCustomer((currentCustomer) => ({
                ...currentCustomer,
                ...updatedCustomer,
                loyaltyTier: updatedTierName,
            }));

            setSelectedTier((updatedTierName || "BRONZE").toUpperCase());

            setSuccessMessage(
                `Loyalty tier එක ${updatedTierName} ලෙස update කළා.`
            );
            loadTransactions();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Loyalty tier update කිරීම අසාර්ථකයි."
            );
        } finally {
            setTierSaving(false);
        }
    };

    const getFullName = () => {
        if (!customer) return "Unknown Customer";

        if (customer.fullName && customer.fullName.trim()) {
            return customer.fullName.trim();
        }

        const fullName =
            `${customer?.firstName ?? ""} ${
                customer?.lastName ?? ""
            }`.trim();

        if (fullName) {
            return fullName;
        }

        if (customer?.name && customer?.name.trim()) {
            return customer.name.trim();
        }

        if (customer?.email && customer?.email.trim()) {
            return customer.email.trim();
        }

        return "Unknown Customer";
    };

    const formatMoney = (value) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
        }).format(value ?? 0);
    };

    if (loading) {
        return (
            <div className="management-message">
                Loading customer details...
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="management-alert error">
                Customer record එක හමු වුණේ නැහැ.
            </div>
        );
    }

    return (
        <div className="management-page">
            <div className="management-heading">
                <div>
                    <Link
                        to="/sales/customers"
                        className="back-link"
                    >
                        ← Back to Customers
                    </Link>

                    <h1>{getFullName()}</h1>
                    <p>{customer.email}</p>
                </div>

                <StatusBadge
                    status={customer.accountStatus}
                    size="lg"
                />
            </div>

            {error && (
                <div className="management-alert error">{error}</div>
            )}

            {successMessage && (
                <div className="management-alert success">
                    {successMessage}
                </div>
            )}

            <div className="customer-summary-grid">
                <article className="summary-card">
                    <span>Customer ID</span>
                    <strong>{customer.id}</strong>
                </article>

                <article className="summary-card">
                    <span>Loyalty Tier</span>
                    <strong style={{ color: "var(--primary-forest, #071C14)" }}>
                        {customer.loyaltyTier || "BRONZE"}
                    </strong>
                </article>

                <article className="summary-card">
                    <span>Reward Points</span>
                    <strong>{customer.loyaltyPoints ?? customer.rewardPoints ?? 0}</strong>
                </article>

                <article className="summary-card">
                    <span>Total Orders</span>
                    <strong>{orders.length > 0 ? orders.length : (customer.totalOrders ?? 0)}</strong>
                </article>

                <article className="summary-card">
                    <span>Total Spent</span>
                    <strong>
                        {formatMoney(customer.totalSpent)}
                    </strong>
                </article>
            </div>

            <div className="details-grid">
                <section className="management-card">
                    <h2>Customer Information</h2>

                    <dl className="customer-details-list">
                        <div>
                            <dt>Full Name</dt>
                            <dd>{getFullName()}</dd>
                        </div>

                        <div>
                            <dt>Email</dt>
                            <dd>{customer.email}</dd>
                        </div>

                        <div>
                            <dt>Phone Number</dt>
                            <dd>{customer.phoneNumber || customer.phone || "Not provided"}</dd>
                        </div>

                        <div>
                            <dt>Address</dt>
                            <dd>{customer.address || "Not provided"}</dd>
                        </div>

                        <div>
                            <dt>Registered Date</dt>
                            <dd>
                                {customer.createdAt
                                    ? new Date(
                                        customer.createdAt
                                    ).toLocaleDateString()
                                    : "—"}
                            </dd>
                        </div>

                        <div>
                            <dt>Last Purchase Date</dt>
                            <dd>
                                {customer.lastPurchaseDate || customer.lastPurchaseAt
                                    ? new Date(
                                        customer.lastPurchaseDate || customer.lastPurchaseAt
                                    ).toLocaleDateString()
                                    : "No purchases"}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="management-card">
                    <h2>Loyalty Management</h2>

                    <p>
                        Current tier:{" "}
                        <span
                            className={`tier-badge tier-${(
                                customer.loyaltyTier || "BRONZE"
                            ).toLowerCase()}`}
                        >
                            {customer.loyaltyTier || "BRONZE"}
                        </span>
                    </p>

                    <div className="tier-update-form">
                        <label htmlFor="loyaltyTier">
                            Assign Loyalty Tier (US-05)
                        </label>

                        <select
                            id="loyaltyTier"
                            value={(selectedTier || "BRONZE").toUpperCase()}
                            onChange={(event) =>
                                setSelectedTier(event.target.value)
                            }
                        >
                            <option value="BRONZE">BRONZE (0% Discount)</option>
                            <option value="SILVER">SILVER (5% Discount)</option>
                            <option value="GOLD">GOLD (10% Discount)</option>
                            <option value="PLATINUM">PLATINUM (15% Discount)</option>
                        </select>

                        <button
                            className="management-primary-button"
                            onClick={handleTierUpdate}
                            disabled={
                                tierSaving ||
                                (selectedTier || "").toUpperCase() ===
                                (customer?.loyaltyTier || "").toUpperCase()
                            }
                        >
                            {tierSaving ? "Updating..." : "Update Tier"}
                        </button>
                    </div>
                </section>
            </div>

            <section className="management-card transaction-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                    <h2>History & Transactions (US-09)</h2>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            className={activeTab === "orders" ? "management-primary-button" : "management-secondary-button"}
                            onClick={() => setActiveTab("orders")}
                        >
                            Previous Orders ({orders.length})
                        </button>
                        <button
                            type="button"
                            className={activeTab === "transactions" ? "management-primary-button" : "management-secondary-button"}
                            onClick={() => setActiveTab("transactions")}
                        >
                            Loyalty & Points Activity
                        </button>
                    </div>
                </div>

                {activeTab === "orders" ? (
                    ordersLoading ? (
                        <div className="management-message">
                            Loading customer orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="management-empty">
                            No previous orders recorded for this customer.
                        </div>
                    ) : (
                        <div className="responsive-table">
                            <table className="management-table">
                                <thead>
                                <tr>
                                    <th>Order Number</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Order Status</th>
                                    <th>Payment Status</th>
                                    <th>Total Amount</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id || order.orderNumber}>
                                        <td>
                                            <strong style={{ color: "var(--primary-forest, #071C14)" }}>
                                                {order.orderNumber}
                                            </strong>
                                        </td>
                                        <td>
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td>
                                            {order.totalItemTypes || order.items?.length || 1} items ({order.totalQuantity ?? 1} units)
                                        </td>
                                        <td>
                                            <StatusBadge status={order.orderStatus} size="sm" />
                                        </td>
                                        <td>
                                            <StatusBadge status={order.paymentStatus} size="sm" />
                                        </td>
                                        <td>
                                            <strong>{formatMoney(order.totalAmount)}</strong>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/sales/orders/${order.id}`}
                                                className="view-link"
                                                style={{ fontSize: "13px" }}
                                            >
                                                Manage Order →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    historyLoading ? (
                        <div className="management-message">
                            Loading loyalty transaction history...
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="management-empty">
                            No loyalty points or tier transactions found.
                        </div>
                    ) : (
                        <>
                            <div className="responsive-table">
                                <table className="management-table">
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Activity Type</th>
                                        <th>Points</th>
                                        <th>Balance After</th>
                                        <th>Description</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>
                                                {tx.createdAt
                                                    ? new Date(tx.createdAt).toLocaleString()
                                                    : "—"}
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    status={tx.transactionType}
                                                    label={tx.transactionType?.replace(/_/g, " ")}
                                                    size="sm"
                                                />
                                            </td>
                                            <td>
                                                <strong
                                                    style={{
                                                        color: (tx.points ?? 0) >= 0 ? "#4ade80" : "#f87171",
                                                    }}
                                                >
                                                    {(tx.points ?? 0) > 0 ? `+${tx.points}` : tx.points ?? 0}
                                                </strong>
                                            </td>
                                            <td>
                                                <strong>{tx.balanceAfter ?? 0} pts</strong>
                                            </td>
                                            <td>
                                                <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                                                    {tx.description || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {historyTotalPages > 1 && (
                                <div className="management-pagination">
                                    <button
                                        className="management-secondary-button"
                                        disabled={historyPage === 0}
                                        onClick={() =>
                                            setHistoryPage((current) => current - 1)
                                        }
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        Page {historyPage + 1} of {historyTotalPages}
                                    </span>

                                    <button
                                        className="management-secondary-button"
                                        disabled={
                                            historyPage + 1 >= historyTotalPages
                                        }
                                        onClick={() =>
                                            setHistoryPage((current) => current + 1)
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )
                )}
            </section>
        </div>
    );
}

export default CustomerDetailsPage;