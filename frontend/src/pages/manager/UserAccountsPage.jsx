import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    RotateCcw,
    ShieldCheck,
    UserCheck,
    UserX,
} from "lucide-react";

import userAdministrationService from "../../services/userAdministrationService";
import useAuth from "../../hooks/useAuth";
import "../../styles/userAdministration.css";

export default function UserAccountsPage() {
    const { user: loggedInUser } = useAuth();

    const [users, setUsers] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [updatingUserId, setUpdatingUserId] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        loadUsers();
    }, [search, role, status, page]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await userAdministrationService.getUsers({
                    search,
                    role,
                    status,
                    page,
                    size: 10,
                });

            if (Array.isArray(data)) {
                setUsers(data);
                setTotalElements(data.length);
                setTotalPages(data.length > 0 ? 1 : 0);
            } else {
                setUsers(data?.content ?? []);
                setTotalElements(data?.totalElements ?? 0);
                setTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "User accounts load කිරීම අසාර්ථකයි."
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

    const handleResetFilters = () => {
        setSearchInput("");
        setSearch("");
        setRole("");
        setStatus("");
        setPage(0);
    };

    const handleRoleChange = (event) => {
        setRole(event.target.value);
        setPage(0);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const handleStatusUpdate = async (selectedUser) => {
        const currentStatus =
            selectedUser.accountStatus || "ACTIVE";

        const newStatus =
            currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        const actionText =
            newStatus === "ACTIVE" ? "activate" : "deactivate";

        const fullName = getFullName(selectedUser);

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} ${fullName}'s account?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingUserId(selectedUser.id);
            setError("");
            setSuccessMessage("");

            const updatedUser =
                await userAdministrationService.updateAccountStatus(
                    selectedUser.id,
                    newStatus
                );

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === selectedUser.id
                        ? {
                            ...currentUser,
                            ...updatedUser,
                            accountStatus:
                                updatedUser?.accountStatus ?? newStatus,
                        }
                        : currentUser
                )
            );

            setSuccessMessage(
                `${fullName}'s account was successfully ${actionText}d.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Account ${actionText} කිරීම අසාර්ථකයි.`
            );
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getFullName = (selectedUser) => {
        if (!selectedUser) return "Unknown User";

        if (selectedUser.fullName && selectedUser.fullName.trim()) {
            return selectedUser.fullName.trim();
        }

        const fullName = `${
            selectedUser.firstName ?? ""
        } ${selectedUser.lastName ?? ""}`.trim();

        return fullName || selectedUser.name || selectedUser.email || "Unknown User";
    };

    const normalizeRole = (userRole) => {
        return userRole?.replace("ROLE_", "") || "UNKNOWN";
    };

    const isLoggedInUser = (selectedUser) => {
        return (
            selectedUser.id === loggedInUser?.id ||
            selectedUser.email === loggedInUser?.email
        );
    };

    return (
        <div className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <h1>User Account Administration</h1>
                    <p>
                        Search, review, activate and deactivate system
                        user accounts.
                    </p>
                </div>

                <div className="admin-heading-icon">
                    <ShieldCheck size={30} />
                </div>
            </div>

            {error && (
                <div className="admin-alert error">{error}</div>
            )}

            {successMessage && (
                <div className="admin-alert success">
                    {successMessage}
                </div>
            )}

            <section className="admin-filter-card">
                <form
                    className="admin-search-form"
                    onSubmit={handleSearch}
                >
                    <div className="admin-search-input">
                        <Search size={18} />

                        <input
                            type="search"
                            placeholder="Search by name or email..."
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                        />
                    </div>

                    <select
                        value={role}
                        onChange={handleRoleChange}
                        aria-label="Filter by role"
                    >
                        <option value="">All Roles</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="SALES_STAFF">
                            Sales Staff
                        </option>
                        <option value="INVENTORY_STAFF">
                            Inventory Staff
                        </option>
                        <option value="MANAGER">Manager</option>
                    </select>

                    <select
                        value={status}
                        onChange={handleStatusChange}
                        aria-label="Filter by status"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <button
                        type="submit"
                        className="admin-primary-button"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={handleResetFilters}
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </form>
            </section>

            <section className="admin-table-card">
                <div className="admin-table-heading">
                    <h2>System Users</h2>
                    <span>{totalElements} account(s)</span>
                </div>

                {loading ? (
                    <div className="admin-message">
                        Loading user accounts...
                    </div>
                ) : users.length === 0 ? (
                    <div className="admin-empty-state">
                        <h3>No user accounts found</h3>
                        <p>Try changing the search filters.</p>
                    </div>
                ) : (
                    <div className="admin-responsive-table">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Registered Date</th>
                                <th>Details</th>
                                <th>Account Control</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map((selectedUser) => {
                                const currentStatus =
                                    selectedUser.accountStatus ||
                                    "ACTIVE";

                                const normalizedRole = normalizeRole(
                                    selectedUser.role
                                );

                                const ownAccount =
                                    isLoggedInUser(selectedUser);

                                return (
                                    <tr key={selectedUser.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-avatar">
                                                    {getFullName(selectedUser)
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {getFullName(selectedUser)}
                                                    </strong>

                                                    {ownAccount && (
                                                        <small>Current account</small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td>{selectedUser.email}</td>

                                        <td>
                        <span
                            className={`admin-role-badge role-${normalizedRole.toLowerCase()}`}
                        >
                          {normalizedRole}
                        </span>
                                        </td>

                                        <td>
                        <span
                            className={`admin-status-badge ${
                                currentStatus === "ACTIVE"
                                    ? "active"
                                    : "inactive"
                            }`}
                        >
                          {currentStatus}
                        </span>
                                        </td>

                                        <td>
                                            {selectedUser.createdAt
                                                ? new Date(
                                                    selectedUser.createdAt
                                                ).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td>
                                            <Link
                                                className="admin-details-link"
                                                to={`/manager/users/${selectedUser.id}`}
                                            >
                                                View
                                            </Link>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className={
                                                    currentStatus === "ACTIVE"
                                                        ? "admin-deactivate-button"
                                                        : "admin-activate-button"
                                                }
                                                disabled={
                                                    updatingUserId ===
                                                    selectedUser.id ||
                                                    ownAccount
                                                }
                                                onClick={() =>
                                                    handleStatusUpdate(selectedUser)
                                                }
                                                title={
                                                    ownAccount
                                                        ? "You cannot change your own account status"
                                                        : ""
                                                }
                                            >
                                                {currentStatus === "ACTIVE" ? (
                                                    <>
                                                        <UserX size={16} />
                                                        {updatingUserId ===
                                                        selectedUser.id
                                                            ? "Updating..."
                                                            : "Deactivate"}
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck size={16} />
                                                        {updatingUserId ===
                                                        selectedUser.id
                                                            ? "Updating..."
                                                            : "Activate"}
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {totalPages > 1 && (
                <div className="admin-pagination">
                    <button
                        className="admin-secondary-button"
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
                        className="admin-secondary-button"
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