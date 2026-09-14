import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customerManagementService from "../../services/customerManagementService";
import "../../styles/customerManagement.css";

function InactiveCustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [inactiveDays, setInactiveDays] = useState(90);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadInactiveCustomers();
    }, [inactiveDays, page]);

    const loadInactiveCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await customerManagementService.getInactiveCustomers({
                    inactiveDays,
                    page,
                    size: 10,
                });

            if (Array.isArray(data)) {
                setCustomers(data);
                setTotalPages(data.length > 0 ? 1 : 0);
            } else {
                setCustomers(data?.content ?? []);
                setTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Inactive customers load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDaysChange = (event) => {
        setInactiveDays(Number(event.target.value));
        setPage(0);
    };

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

                    <h1>Inactive Customers</h1>
                    <p>
                        Identify customers who have not recently made
                        a purchase.
                    </p>
                </div>

                <div className="inactive-filter">
                    <label htmlFor="inactiveDays">Inactive period</label>

                    <select
                        id="inactiveDays"
                        value={inactiveDays}
                        onChange={handleDaysChange}
                    >
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>180 days</option>
                        <option value={365}>1 year</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="management-alert error">{error}</div>
            )}

            <section className="management-card">
                {loading ? (
                    <div className="management-message">
                        Loading inactive customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="management-empty">
                        <h3>No inactive customers found</h3>
                        <p>
                            All customers have recent activity within the
                            selected period.
                        </p>
                    </div>
                ) : (
                    <div className="responsive-table">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Loyalty Tier</th>
                                <th>Last Purchase</th>
                                <th>Inactive Days</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        {`${customer.firstName ?? ""} ${
                                                customer.lastName ?? ""
                                            }`.trim() ||
                                            customer.name ||
                                            "Unknown Customer"}
                                    </td>

                                    <td>{customer.email}</td>

                                    <td>
                                        {customer.loyaltyTier || "BRONZE"}
                                    </td>

                                    <td>
                                        {customer.lastPurchaseDate
                                            ? new Date(
                                                customer.lastPurchaseDate
                                            ).toLocaleDateString()
                                            : "No purchases"}
                                    </td>

                                    <td>
                                        {customer.inactiveDays ??
                                            `${inactiveDays}+`}
                                    </td>

                                    <td>
                                        <Link
                                            className="view-link"
                                            to={`/sales/customers/${customer.id}`}
                                        >
                                            View Customer
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {totalPages > 1 && (
                <div className="management-pagination">
                    <button
                        className="management-secondary-button"
                        disabled={page === 0}
                        onClick={() =>
                            setPage((currentPage) => currentPage - 1)
                        }
                    >
                        Previous
                    </button>

                    <span>
            Page {page + 1} of {totalPages}
          </span>

                    <button
                        className="management-secondary-button"
                        disabled={page + 1 >= totalPages}
                        onClick={() =>
                            setPage((currentPage) => currentPage + 1)
                        }
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default InactiveCustomersPage;