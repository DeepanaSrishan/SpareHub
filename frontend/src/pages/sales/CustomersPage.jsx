import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customerManagementService from "../../services/customerManagementService";
import "../../styles/customerManagement.css";

const resolveTierName = (tier, points = 0) => {
    const pts = Number(points) || 0;
    if (pts >= 3000) return "Platinum";
    if (pts >= 1500) return "Gold";
    if (pts >= 500) return "Silver";
    if (tier && tier.trim() && tier.toUpperCase() !== "BRONZE") {
        const clean = tier.trim();
        return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return "Bronze";
};

function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCustomers();
    }, [search, page]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await customerManagementService.getCustomers({
                    search,
                    page,
                    size: 10,
                });

            if (Array.isArray(data)) {
                setCustomers(data);
                setTotalPages(data.length > 0 ? 1 : 0);
                setTotalElements(data.length);
            } else {
                setCustomers(data?.content ?? []);
                setTotalPages(data?.totalPages ?? 0);
                setTotalElements(data?.totalElements ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Customers load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(0);
        setSearch(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(0);
    };

    const getFullName = (customer) => {
        if (!customer) return "Unknown Customer";

        if (customer.fullName && customer.fullName.trim()) {
            return customer.fullName.trim();
        }

        const combinedName = `${customer.firstName ?? ""} ${
            customer.lastName ?? ""
        }`.trim();

        if (combinedName) {
            return combinedName;
        }

        if (customer.name && customer.name.trim()) {
            return customer.name.trim();
        }

        if (customer.email && customer.email.trim()) {
            return customer.email.trim();
        }

        return "Unknown Customer";
    };

    return (
        <div className="management-page">
            <div className="management-heading">
                <div>
                    <h1>Customer Management</h1>
                    <p>
                        Search customers and view their account,
                        loyalty and transaction details.
                    </p>
                </div>

                <Link
                    to="/sales/customers/inactive"
                    className="inactive-link"
                >
                    View Inactive Customers
                </Link>
            </div>

            <form
                className="customer-search-form"
                onSubmit={handleSearch}
            >
                <input
                    type="search"
                    placeholder="Search by customer name or email..."
                    value={searchInput}
                    onChange={(event) =>
                        setSearchInput(event.target.value)
                    }
                />

                <button className="management-primary-button" type="submit">
                    Search
                </button>

                {search && (
                    <button
                        className="management-secondary-button"
                        type="button"
                        onClick={handleClearSearch}
                    >
                        Clear
                    </button>
                )}
            </form>

            {error && (
                <div className="management-alert error">{error}</div>
            )}

            <section className="management-card">
                <div className="table-heading">
                    <h2>Registered Customers</h2>
                    <span>{totalElements} customer(s)</span>
                </div>

                {loading ? (
                    <div className="management-message">
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="management-empty">
                        <h3>No customers found</h3>
                        <p>Try another customer name or email address.</p>
                    </div>
                ) : (
                    <div className="responsive-table">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Loyalty Tier</th>
                                <th>Points</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{getFullName(customer)}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone || customer.phoneNumber || "—"}</td>
                                    <td>
                                        {(() => {
                                            const tierName = resolveTierName(
                                                customer.loyaltyTier,
                                                customer.loyaltyPoints ?? customer.rewardPoints ?? 0
                                            );
                                            return (
                                                <span className={`tier-badge tier-${tierName.toLowerCase()}`}>
                                                    {tierName.toUpperCase()}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td>{customer.loyaltyPoints ?? customer.rewardPoints ?? 0}</td>
                                    <td>
                      <span
                          className={`status-badge ${
                              customer.accountStatus === "ACTIVE"
                                  ? "active"
                                  : "inactive"
                          }`}
                      >
                        {customer.accountStatus || "UNKNOWN"}
                      </span>
                                    </td>
                                    <td>
                                        <Link
                                            className="view-link"
                                            to={`/sales/customers/${customer.id}`}
                                        >
                                            View Details
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

export default CustomersPage;