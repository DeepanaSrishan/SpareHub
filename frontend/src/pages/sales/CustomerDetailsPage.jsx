import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import customerManagementService from "../../services/customerManagementService";
import "../../styles/customerManagement.css";

function CustomerDetailsPage() {
    const { customerId } = useParams();

    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [selectedTier, setSelectedTier] =
        useState("BRONZE");

    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] =
        useState(0);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] =
        useState(true);
    const [tierSaving, setTierSaving] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadCustomer();
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
            setSelectedTier(data?.loyaltyTier ?? "BRONZE");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Customer information load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
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

            setCustomer((currentCustomer) => ({
                ...currentCustomer,
                ...updatedCustomer,
                loyaltyTier:
                    updatedCustomer?.loyaltyTier ?? selectedTier,
            }));

            setSuccessMessage(
                `Loyalty tier එක ${selectedTier} ලෙස update කළා.`
            );
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
        const fullName =
            `${customer?.firstName ?? ""} ${
                customer?.lastName ?? ""
            }`.trim();

        return fullName || customer?.name || "Unknown Customer";
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

                <span
                    className={`status-badge ${
                        customer.accountStatus === "ACTIVE"
                            ? "active"
                            : "inactive"
                    }`}
                >
          {customer.accountStatus}
        </span>
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
                    <span>Reward Points</span>
                    <strong>{customer.rewardPoints ?? 0}</strong>
                </article>

                <article className="summary-card">
                    <span>Total Orders</span>
                    <strong>{customer.totalOrders ?? 0}</strong>
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
                            <dd>{customer.phoneNumber || "Not provided"}</dd>
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
                                {customer.lastPurchaseDate
                                    ? new Date(
                                        customer.lastPurchaseDate
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
                            Assign Loyalty Tier
                        </label>

                        <select
                            id="loyaltyTier"
                            value={selectedTier}
                            onChange={(event) =>
                                setSelectedTier(event.target.value)
                            }
                        >
                            <option value="BRONZE">BRONZE</option>
                            <option value="SILVER">SILVER</option>
                            <option value="GOLD">GOLD</option>
                            <option value="PLATINUM">PLATINUM</option>
                        </select>

                        <button
                            className="management-primary-button"
                            onClick={handleTierUpdate}
                            disabled={
                                tierSaving ||
                                selectedTier === customer.loyaltyTier
                            }
                        >
                            {tierSaving ? "Updating..." : "Update Tier"}
                        </button>
                    </div>
                </section>
            </div>

            <section className="management-card transaction-section">
                <h2>Order and Transaction History</h2>

                {historyLoading ? (
                    <div className="management-message">
                        Loading transaction history...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="management-empty">
                        No previous orders or transactions found.
                    </div>
                ) : (
                    <div className="responsive-table">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Order Number</th>
                                <th>Order Date</th>
                                <th>Order Status</th>
                                <th>Payment Status</th>
                                <th>Total</th>
                            </tr>
                            </thead>

                            <tbody>
                            {transactions.map((transaction) => (
                                <tr
                                    key={
                                        transaction.id ??
                                        transaction.orderNumber
                                    }
                                >
                                    <td>
                                        {transaction.orderNumber ??
                                            transaction.id}
                                    </td>

                                    <td>
                                        {transaction.orderDate
                                            ? new Date(
                                                transaction.orderDate
                                            ).toLocaleString()
                                            : "—"}
                                    </td>

                                    <td>
                      <span className="status-badge neutral">
                        {transaction.orderStatus || "UNKNOWN"}
                      </span>
                                    </td>

                                    <td>
                      <span
                          className={`status-badge ${
                              transaction.paymentStatus === "PAID"
                                  ? "active"
                                  : "pending"
                          }`}
                      >
                        {transaction.paymentStatus ||
                            "PENDING"}
                      </span>
                                    </td>

                                    <td>
                                        {formatMoney(
                                            transaction.totalAmount
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
              Page {historyPage + 1} of{" "}
                            {historyTotalPages}
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
            </section>
        </div>
    );
}

export default CustomerDetailsPage;