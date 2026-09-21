import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Boxes,
    Building2,
    CheckCircle2,
    Eye,
    Pencil,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Search,
    TrendingUp,
    Truck,
    X,
} from "lucide-react";

import SupplierFormModal from "../../components/suppliers/SupplierFormModal";
import useAuth from "../../hooks/useAuth";

import {
    activateSupplier,
    createSupplier,
    deactivateSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier,
} from "../../api/supplierApi";

import "../../styles/SuppliersPage.css";

function SuppliersPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const normalizedRole = user?.role
        ?.replace("ROLE_", "")
        ?.toUpperCase();

    const [suppliers, setSuppliers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] =
        useState(null);

    const [viewSupplier, setViewSupplier] =
        useState(null);
    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const loadSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSuppliers(appliedSearch);
            setSuppliers(data);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load suppliers."
            );
        } finally {
            setLoading(false);
        }
    }, [appliedSearch]);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    useEffect(() => {
        if (!success) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setSuccess("");
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [success]);

    const handleSearch = (event) => {
        event.preventDefault();
        setAppliedSearch(searchInput.trim());
    };

    const handleResetSearch = () => {
        setSearchInput("");
        setAppliedSearch("");
    };

    const openCreateForm = () => {
        setEditingSupplier(null);
        setFormOpen(true);
        setError("");
    };

    const openEditForm = (supplier) => {
        setEditingSupplier(supplier);
        setFormOpen(true);
        setError("");
    };

    const handleSaveSupplier = async (formData) => {
        try {
            setSaving(true);
            setError("");

            if (editingSupplier?.id) {
                await updateSupplier(
                    editingSupplier.id,
                    formData
                );

                setSuccess("Supplier updated successfully.");
            } else {
                await createSupplier(formData);
                setSuccess("Supplier created successfully.");
            }

            setFormOpen(false);
            setEditingSupplier(null);

            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to save supplier."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleViewSupplier = async (supplierId) => {
        try {
            setDetailsLoading(true);
            setError("");

            const data = await getSupplierById(supplierId);
            setViewSupplier(data);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load supplier details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStatusChange = async (supplier) => {
        const active = isActive(supplier);

        const confirmed = window.confirm(
            active
                ? `Deactivate ${getSupplierName(supplier)}?`
                : `Activate ${getSupplierName(supplier)}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(supplier.id);
            setError("");

            if (active) {
                await deactivateSupplier(supplier.id);
                setSuccess(
                    "Supplier deactivated successfully."
                );
            } else {
                await activateSupplier(supplier.id);
                setSuccess(
                    "Supplier activated successfully."
                );
            }

            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to change supplier status."
            );
        } finally {
            setActionId(null);
        }
    };

    const activeCount = suppliers.filter(isActive).length;

    return (
        <main className="suppliers-page">
            <section className="supplier-hero">
                <div>
          <span className="supplier-eyebrow">
            SUPPLIER MANAGEMENT
          </span>

                    <h1>Suppliers</h1>

                    <p>
                        Add suppliers, maintain contact details and
                        manage supplier availability.
                    </p>
                </div>

                <div className="supplier-hero-icon">
                    <Truck size={43} />
                </div>
            </section>

            <section className="supplier-summary-grid">
                <article className="supplier-summary-card">
                    <span>Total Suppliers</span>
                    <strong>{suppliers.length}</strong>
                    <Building2 size={22} />
                </article>

                <article className="supplier-summary-card">
                    <span>Active Suppliers</span>
                    <strong>{activeCount}</strong>
                    <CheckCircle2 size={22} />
                </article>

                <article className="supplier-summary-card">
                    <span>Inactive Suppliers</span>
                    <strong>
                        {suppliers.length - activeCount}
                    </strong>
                    <PowerOff size={22} />
                </article>
            </section>

            {error && (
                <div className="supplier-alert error">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {success && (
                <div className="supplier-alert success">
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            <section className="supplier-content-card">
                <div className="supplier-toolbar">
                    <form
                        className="supplier-search-form"
                        onSubmit={handleSearch}
                    >
                        <div className="supplier-search-input">
                            <Search size={18} />

                            <input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Search name, company or contact..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="supplier-button primary"
                        >
                            Search
                        </button>

                        {appliedSearch && (
                            <button
                                type="button"
                                className="supplier-button secondary"
                                onClick={handleResetSearch}
                            >
                                Reset
                            </button>
                        )}
                    </form>

                    <div className="supplier-toolbar-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={loadSuppliers}
                            disabled={loading}
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            className="supplier-button primary"
                            onClick={openCreateForm}
                        >
                            <Plus size={18} />
                            Add New Supplier
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="supplier-empty-state">
                        <RefreshCw
                            size={35}
                            className="spin"
                        />
                        <h3>Loading suppliers...</h3>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div className="supplier-empty-state">
                        <Building2 size={42} />
                        <h3>No suppliers found</h3>
                        <p>
                            Add a new supplier or change the search
                            keyword.
                        </p>

                        <button
                            type="button"
                            className="supplier-button primary"
                            onClick={openCreateForm}
                        >
                            <Plus size={18} />
                            Add First Supplier
                        </button>
                    </div>
                ) : (
                    <div className="supplier-table-wrapper">
                        <table className="supplier-table">
                            <thead>
                            <tr>
                                <th>Code</th>
                                <th>Supplier</th>
                                <th>Company</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th className="supplier-actions-column">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td>
                      <span className="supplier-code">
                        {supplier.supplierCode || "—"}
                      </span>
                                    </td>

                                    <td>
                                        <strong>
                                            {getSupplierName(supplier)}
                                        </strong>
                                    </td>

                                    <td>
                                        {supplier.companyName || "—"}
                                    </td>

                                    <td>
                                        {supplier.contactNumber || "—"}
                                    </td>

                                    <td>{supplier.email || "—"}</td>

                                    <td>
                      <span
                          className={`supplier-status ${
                              isActive(supplier)
                                  ? "active"
                                  : "inactive"
                          }`}
                      >
                        {isActive(supplier)
                            ? "Active"
                            : "Inactive"}
                      </span>
                                    </td>

                                    <td>
                                        <div className="supplier-row-actions">
                                            <button
                                                type="button"
                                                className="supplier-action-button view"
                                                onClick={() =>
                                                    navigate(
                                                        `/suppliers/${supplier.id}/products`
                                                    )
                                                }
                                                title="Manage supplied products"
                                                aria-label={`Manage products supplied by ${getSupplierName(
                                                    supplier
                                                )}`}
                                            >
                                                <Boxes size={17} />
                                            </button>

                                            {normalizedRole === "MANAGER" && (
                                                <button
                                                    type="button"
                                                    className="supplier-action-button view"
                                                    onClick={() =>
                                                        navigate(
                                                            `/supplier-analytics?supplierId=${supplier.id}`
                                                        )
                                                    }
                                                    title="View supplier analytics"
                                                    aria-label={`View analytics for ${getSupplierName(
                                                        supplier
                                                    )}`}
                                                >
                                                    <TrendingUp size={17} />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="supplier-action-button view"
                                                onClick={() =>
                                                    handleViewSupplier(
                                                        supplier.id
                                                    )
                                                }
                                                title="View supplier"
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                className="supplier-action-button edit"
                                                onClick={() =>
                                                    openEditForm(supplier)
                                                }
                                                title="Edit supplier"
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                className={`supplier-action-button ${
                                                    isActive(supplier)
                                                        ? "deactivate"
                                                        : "activate"
                                                }`}
                                                onClick={() =>
                                                    handleStatusChange(supplier)
                                                }
                                                disabled={
                                                    actionId === supplier.id
                                                }
                                                title={
                                                    isActive(supplier)
                                                        ? "Deactivate supplier"
                                                        : "Activate supplier"
                                                }
                                            >
                                                {isActive(supplier) ? (
                                                    <PowerOff size={17} />
                                                ) : (
                                                    <Power size={17} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <SupplierFormModal
                open={formOpen}
                supplier={editingSupplier}
                loading={saving}
                onClose={() => {
                    if (!saving) {
                        setFormOpen(false);
                        setEditingSupplier(null);
                    }
                }}
                onSubmit={handleSaveSupplier}
            />

            {(viewSupplier || detailsLoading) && (
                <div className="supplier-modal-overlay">
                    <div className="supplier-modal supplier-details-modal">
                        <div className="supplier-modal-header">
                            <div>
                <span className="supplier-modal-icon">
                  <Building2 size={21} />
                </span>

                                <div>
                                    <h2>Supplier Details</h2>
                                    <p>
                                        Complete supplier contact information.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="supplier-icon-button"
                                onClick={() => setViewSupplier(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="supplier-empty-state">
                                <RefreshCw
                                    className="spin"
                                    size={30}
                                />
                                <p>Loading supplier details...</p>
                            </div>
                        ) : (
                            <div className="supplier-details-grid">
                                <DetailItem
                                    label="Supplier Code"
                                    value={viewSupplier?.supplierCode}
                                />

                                <DetailItem
                                    label="Supplier Name"
                                    value={getSupplierName(
                                        viewSupplier || {}
                                    )}
                                />

                                <DetailItem
                                    label="Company Name"
                                    value={viewSupplier?.companyName}
                                />

                                <DetailItem
                                    label="Contact Number"
                                    value={viewSupplier?.contactNumber}
                                />

                                <DetailItem
                                    label="Email"
                                    value={viewSupplier?.email}
                                />

                                <DetailItem
                                    label="Status"
                                    value={
                                        isActive(viewSupplier)
                                            ? "Active"
                                            : "Inactive"
                                    }
                                />

                                <div className="supplier-detail-item full">
                                    <span>Address</span>
                                    <strong>
                                        {viewSupplier?.address || "—"}
                                    </strong>
                                </div>
                            </div>
                        )}

                        <div className="supplier-modal-actions">
                            <button
                                type="button"
                                className="supplier-button secondary"
                                onClick={() => setViewSupplier(null)}
                            >
                                Close
                            </button>

                            {viewSupplier && (
                                <button
                                    type="button"
                                    className="supplier-button primary"
                                    onClick={() => {
                                        const supplier = viewSupplier;
                                        setViewSupplier(null);
                                        openEditForm(supplier);
                                    }}
                                >
                                    <Pencil size={17} />
                                    Edit Supplier
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function DetailItem({ label, value }) {
    return (
        <div className="supplier-detail-item">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function getSupplierName(supplier) {
    return (
        supplier?.name ||
        supplier?.supplierName ||
        supplier?.contactPerson ||
        "Unnamed Supplier"
    );
}

function isActive(supplier) {
    if (typeof supplier?.active === "boolean") {
        return supplier.active;
    }

    if (supplier?.status) {
        return supplier.status.toString().toUpperCase() ===
            "ACTIVE";
    }

    return false;
}

export default SuppliersPage;
