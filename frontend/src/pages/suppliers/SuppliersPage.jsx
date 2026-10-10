import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Award,
    Boxes,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    ExternalLink,
    Eye,
    FileText,
    Pencil,
    Plus,
    Power,
    PowerOff,
    RefreshCw,
    Search,
    ShieldAlert,
    ShoppingBag,
    Star,
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
    getSupplierPerformance,
    getSuppliers,
    getSupplierTransactions,
    suspendSupplier,
    updateSupplier,
    updateSupplierStatus,
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
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE | SUSPENDED

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // View Details Modal State
    const [viewSupplier, setViewSupplier] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsTab, setDetailsTab] = useState("profile"); // profile | performance | transactions
    const [supplierPerformanceData, setSupplierPerformanceData] = useState(null);
    const [supplierTransactionsData, setSupplierTransactionsData] = useState([]);
    const [detailsTabLoading, setDetailsTabLoading] = useState(false);

    // Suspend Modal Dialog State
    const [suspendModal, setSuspendModal] = useState({
        open: false,
        supplier: null,
        reason: "",
    });

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
        setStatusFilter("ALL");
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
                await updateSupplier(editingSupplier.id, formData);
                setSuccess("Supplier updated successfully.");
            } else {
                await createSupplier(formData);
                setSuccess("Supplier created successfully.");
            }

            setFormOpen(false);
            setEditingSupplier(null);

            await loadSuppliers();
        } catch (requestError) {
            const data = requestError.response?.data;
            let errorMessage = "Unable to save supplier.";
            if (data?.validationErrors && typeof data.validationErrors === "object") {
                errorMessage = Object.values(data.validationErrors).join(" | ");
            } else if (data?.message) {
                errorMessage = data.message;
            }
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleViewSupplier = async (supplierId) => {
        try {
            setDetailsLoading(true);
            setError("");
            setDetailsTab("profile");
            setSupplierPerformanceData(null);
            setSupplierTransactionsData([]);

            const data = await getSupplierById(supplierId);
            setViewSupplier(data);

            // Fetch performance & transactions in background
            try {
                const [perf, txns] = await Promise.allSettled([
                    getSupplierPerformance(supplierId),
                    getSupplierTransactions(supplierId),
                ]);

                if (perf.status === "fulfilled") {
                    setSupplierPerformanceData(perf.value);
                }
                if (txns.status === "fulfilled") {
                    setSupplierTransactionsData(Array.isArray(txns.value) ? txns.value : []);
                }
            } catch {
                // Secondary details fetch failures do not block basic profile
            }
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load supplier details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleActivate = async (supplier) => {
        try {
            setActionId(supplier.id);
            setError("");
            await activateSupplier(supplier.id);
            setSuccess(`Supplier ${getSupplierName(supplier)} activated successfully.`);
            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to activate supplier."
            );
        } finally {
            setActionId(null);
        }
    };

    const handleDeactivate = async (supplier) => {
        const confirmed = window.confirm(`Deactivate ${getSupplierName(supplier)}? New purchase orders will be blocked.`);
        if (!confirmed) return;

        try {
            setActionId(supplier.id);
            setError("");
            await deactivateSupplier(supplier.id);
            setSuccess(`Supplier ${getSupplierName(supplier)} deactivated successfully.`);
            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to deactivate supplier."
            );
        } finally {
            setActionId(null);
        }
    };

    const openSuspendDialog = (supplier) => {
        setSuspendModal({
            open: true,
            supplier,
            reason: "",
        });
    };

    const handleConfirmSuspend = async () => {
        if (!suspendModal.supplier) return;

        try {
            setActionId(suspendModal.supplier.id);
            setError("");
            await suspendSupplier(suspendModal.supplier.id, suspendModal.reason.trim());
            setSuccess(`Supplier ${getSupplierName(suspendModal.supplier)} suspended successfully.`);
            setSuspendModal({ open: false, supplier: null, reason: "" });
            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to suspend supplier."
            );
        } finally {
            setActionId(null);
        }
    };

    // Filter suppliers by status
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier) => {
            if (statusFilter === "ALL") return true;
            const currentStatus = getNormalizedStatus(supplier);
            return currentStatus === statusFilter;
        });
    }, [suppliers, statusFilter]);

    // KPI Counts
    const activeCount = suppliers.filter((s) => getNormalizedStatus(s) === "ACTIVE").length;
    const inactiveCount = suppliers.filter((s) => getNormalizedStatus(s) === "INACTIVE").length;
    const suspendedCount = suppliers.filter((s) => getNormalizedStatus(s) === "SUSPENDED").length;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(Number(val || 0));
    };

    const formatDate = (val) => (val ? new Date(val).toLocaleDateString() : "—");

    return (
        <main className="suppliers-page">
            <section className="supplier-hero">
                <div>
                    <span className="supplier-eyebrow">SUPPLIER MANAGEMENT</span>
                    <h1>Suppliers & Vendor Registry</h1>
                    <p>
                        Complete supplier directory, lifecycle management (Active, Inactive, Suspended), order history, and performance auditing.
                    </p>
                </div>

                <div className="supplier-hero-icon">
                    <Truck size={43} />
                </div>
            </section>

            {/* KPI Metrics */}
            <section className="supplier-summary-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <article className="supplier-summary-card">
                    <span>Total Suppliers</span>
                    <strong>{suppliers.length}</strong>
                    <Building2 size={22} />
                </article>

                <article className="supplier-summary-card">
                    <span>Active Suppliers</span>
                    <strong style={{ color: "#34d399" }}>{activeCount}</strong>
                    <CheckCircle2 size={22} color="#34d399" />
                </article>

                <article className="supplier-summary-card">
                    <span>Inactive Suppliers</span>
                    <strong style={{ color: "#9ca3af" }}>{inactiveCount}</strong>
                    <PowerOff size={22} color="#9ca3af" />
                </article>

                <article className="supplier-summary-card" style={{ borderColor: "rgba(249, 115, 22, 0.3)" }}>
                    <span>Suspended</span>
                    <strong style={{ color: "#f97316" }}>{suspendedCount}</strong>
                    <ShieldAlert size={22} color="#f97316" />
                </article>
            </section>

            {error && (
                <div className="supplier-alert error">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {success && (
                <div className="supplier-alert success">
                    <span>{success}</span>
                    <button type="button" onClick={() => setSuccess("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            <section className="supplier-content-card">
                <div className="supplier-toolbar">
                    <form className="supplier-search-form" onSubmit={handleSearch}>
                        <div className="supplier-search-input">
                            <Search size={18} />
                            <input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by name, company, code, contact or email..."
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                background: "rgba(8, 18, 14, 0.92)",
                                border: "1px solid rgba(184, 243, 74, 0.25)",
                                borderRadius: "12px",
                                color: "#ffffff",
                                padding: "0 14px",
                                height: "42px",
                                fontSize: "14px",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option value="ALL">All Statuses ({suppliers.length})</option>
                            <option value="ACTIVE">Active ({activeCount})</option>
                            <option value="INACTIVE">Inactive ({inactiveCount})</option>
                            <option value="SUSPENDED">Suspended ({suspendedCount})</option>
                        </select>

                        <button type="submit" className="supplier-button primary">
                            Search
                        </button>

                        {(appliedSearch || statusFilter !== "ALL") && (
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
                            <RefreshCw size={17} className={loading ? "spin" : ""} />
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
                        <RefreshCw size={35} className="spin" />
                        <h3>Loading suppliers...</h3>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="supplier-empty-state">
                        <Building2 size={42} />
                        <h3>No suppliers found</h3>
                        <p>Adjust your search filters or register a new supplier.</p>
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
                                    <th className="supplier-actions-column">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSuppliers.map((supplier) => {
                                    const status = getNormalizedStatus(supplier);

                                    return (
                                        <tr key={supplier.id}>
                                            <td>
                                                <span className="supplier-code">
                                                    {supplier.supplierCode || "—"}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>{getSupplierName(supplier)}</strong>
                                            </td>

                                            <td>{supplier.companyName || "—"}</td>

                                            <td>{supplier.contactNumber || "—"}</td>

                                            <td>{supplier.email || "—"}</td>

                                            <td>
                                                <span
                                                    className={`supplier-status ${status.toLowerCase()}`}
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: "999px",
                                                        fontSize: "11px",
                                                        fontWeight: 800,
                                                        letterSpacing: "0.04em",
                                                        display: "inline-block",
                                                        background:
                                                            status === "ACTIVE"
                                                                ? "rgba(52, 211, 153, 0.15)"
                                                                : status === "SUSPENDED"
                                                                    ? "rgba(249, 115, 22, 0.18)"
                                                                    : "rgba(156, 163, 175, 0.15)",
                                                        color:
                                                            status === "ACTIVE"
                                                                ? "#34d399"
                                                                : status === "SUSPENDED"
                                                                    ? "#f97316"
                                                                    : "#9ca3af",
                                                        border: `1px solid ${
                                                            status === "ACTIVE"
                                                                ? "rgba(52, 211, 153, 0.35)"
                                                                : status === "SUSPENDED"
                                                                    ? "rgba(249, 115, 22, 0.4)"
                                                                    : "rgba(156, 163, 175, 0.35)"
                                                        }`,
                                                    }}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="supplier-row-actions">
                                                    {/* Manage Products */}
                                                    <button
                                                        type="button"
                                                        className="supplier-action-button view"
                                                        onClick={() => navigate(`/suppliers/${supplier.id}/products`)}
                                                        title="Manage supplied products"
                                                        aria-label={`Manage products supplied by ${getSupplierName(supplier)}`}
                                                    >
                                                        <Boxes size={17} />
                                                    </button>

                                                    {/* Analytics */}
                                                    {normalizedRole === "MANAGER" && (
                                                        <button
                                                            type="button"
                                                            className="supplier-action-button view"
                                                            onClick={() => navigate(`/supplier-analytics?supplierId=${supplier.id}`)}
                                                            title="View supplier analytics"
                                                        >
                                                            <TrendingUp size={17} />
                                                        </button>
                                                    )}

                                                    {/* View Details */}
                                                    <button
                                                        type="button"
                                                        className="supplier-action-button view"
                                                        onClick={() => handleViewSupplier(supplier.id)}
                                                        title="View details & history"
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        className="supplier-action-button edit"
                                                        onClick={() => openEditForm(supplier)}
                                                        title="Edit supplier"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    {/* Status Control Actions */}
                                                    {status === "ACTIVE" ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="supplier-action-button deactivate"
                                                                onClick={() => handleDeactivate(supplier)}
                                                                disabled={actionId === supplier.id}
                                                                title="Deactivate supplier"
                                                            >
                                                                <PowerOff size={17} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="supplier-action-button suspend"
                                                                onClick={() => openSuspendDialog(supplier)}
                                                                disabled={actionId === supplier.id}
                                                                title="Suspend supplier"
                                                                style={{ color: "#f97316" }}
                                                            >
                                                                <ShieldAlert size={17} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="supplier-action-button activate"
                                                            onClick={() => handleActivate(supplier)}
                                                            disabled={actionId === supplier.id}
                                                            title="Activate / Reactivate supplier"
                                                        >
                                                            <Power size={17} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Create/Edit Modal */}
            <SupplierFormModal
                open={formOpen}
                supplier={editingSupplier}
                loading={saving}
                error={error}
                onClose={() => {
                    if (!saving) {
                        setFormOpen(false);
                        setEditingSupplier(null);
                        setError("");
                    }
                }}
                onSubmit={handleSaveSupplier}
            />

            {/* Suspend Supplier Prompt Modal */}
            {suspendModal.open && (
                <div className="supplier-modal-overlay">
                    <div className="supplier-modal" style={{ maxWidth: "480px" }}>
                        <div className="supplier-modal-header">
                            <div>
                                <span className="supplier-modal-icon" style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.15)" }}>
                                    <ShieldAlert size={22} />
                                </span>
                                <div>
                                    <h2>Suspend Supplier</h2>
                                    <p>Temporarily suspend {getSupplierName(suspendModal.supplier)} from purchase orders.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="supplier-icon-button"
                                onClick={() => setSuspendModal({ open: false, supplier: null, reason: "" })}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: "18px 0" }}>
                            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.8)", marginBottom: "12px" }}>
                                Suspended suppliers cannot be selected for any new purchase orders, but historical orders and transactions remain preserved.
                            </p>

                            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                                Suspension Reason (Optional)
                            </label>
                            <textarea
                                value={suspendModal.reason}
                                onChange={(e) => setSuspendModal((prev) => ({ ...prev, reason: e.target.value }))}
                                placeholder="E.g. Quality audit failure, contractual dispute, repeated delivery delays..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    background: "rgba(0, 0, 0, 0.3)",
                                    border: "1px solid rgba(255, 255, 255, 0.15)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    padding: "10px",
                                    fontSize: "13px",
                                    resize: "none",
                                    outline: "none"
                                }}
                            />
                        </div>

                        <div className="supplier-modal-actions">
                            <button
                                type="button"
                                className="supplier-button secondary"
                                onClick={() => setSuspendModal({ open: false, supplier: null, reason: "" })}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="supplier-button danger"
                                onClick={handleConfirmSuspend}
                                disabled={actionId === suspendModal.supplier?.id}
                                style={{ background: "#ea580c", borderColor: "#ea580c" }}
                            >
                                Confirm Suspension
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rich Supplier Details Modal with Performance & Transaction History */}
            {(viewSupplier || detailsLoading) && (
                <div className="supplier-modal-overlay">
                    <div className="supplier-modal supplier-details-modal" style={{ maxWidth: "780px" }}>
                        <div className="supplier-modal-header">
                            <div>
                                <span className="supplier-modal-icon">
                                    <Building2 size={21} />
                                </span>
                                <div>
                                    <h2>{getSupplierName(viewSupplier || {})}</h2>
                                    <p>Code: {viewSupplier?.supplierCode || "—"} • Company: {viewSupplier?.companyName || "—"}</p>
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
                                <RefreshCw className="spin" size={30} />
                                <p>Loading supplier details and performance records...</p>
                            </div>
                        ) : (
                            <>
                                {/* Sub-navigation tabs */}
                                <div style={{
                                    display: "flex",
                                    gap: "8px",
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                                    marginBottom: "18px"
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setDetailsTab("profile")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            borderBottom: detailsTab === "profile" ? "2px solid var(--primary-lime, #B8F34A)" : "none",
                                            color: detailsTab === "profile" ? "var(--primary-lime, #B8F34A)" : "rgba(255, 255, 255, 0.6)",
                                            padding: "8px 14px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Profile & Contact
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDetailsTab("performance")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            borderBottom: detailsTab === "performance" ? "2px solid var(--primary-lime, #B8F34A)" : "none",
                                            color: detailsTab === "performance" ? "var(--primary-lime, #B8F34A)" : "rgba(255, 255, 255, 0.6)",
                                            padding: "8px 14px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Performance & Orders
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDetailsTab("transactions")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            borderBottom: detailsTab === "transactions" ? "2px solid var(--primary-lime, #B8F34A)" : "none",
                                            color: detailsTab === "transactions" ? "var(--primary-lime, #B8F34A)" : "rgba(255, 255, 255, 0.6)",
                                            padding: "8px 14px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontSize: "13px"
                                        }}
                                    >
                                        Transaction History ({supplierTransactionsData.length})
                                    </button>
                                </div>

                                {/* TAB 1: Profile & Contact */}
                                {detailsTab === "profile" && (
                                    <div className="supplier-details-grid">
                                        <DetailItem label="Supplier Code" value={viewSupplier?.supplierCode} />
                                        <DetailItem label="Supplier Name" value={getSupplierName(viewSupplier || {})} />
                                        <DetailItem label="Company Name" value={viewSupplier?.companyName} />
                                        <DetailItem label="Contact Number" value={viewSupplier?.contactNumber} />
                                        <DetailItem label="Email" value={viewSupplier?.email} />
                                        <DetailItem label="Status" value={getNormalizedStatus(viewSupplier)} />
                                        <div className="supplier-detail-item full">
                                            <span>Address</span>
                                            <strong>{viewSupplier?.address || "—"}</strong>
                                        </div>

                                        {getNormalizedStatus(viewSupplier) !== "ACTIVE" && (
                                            <div style={{
                                                gridColumn: "1 / -1",
                                                background: "rgba(239, 68, 68, 0.12)",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "8px",
                                                padding: "10px 14px",
                                                color: "#f87171",
                                                fontSize: "13px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px"
                                            }}>
                                                <AlertCircle size={16} />
                                                <span>This supplier is currently {getNormalizedStatus(viewSupplier)} and cannot receive new purchase orders.</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 2: Performance Metrics */}
                                {detailsTab === "performance" && (
                                    <div>
                                        {supplierPerformanceData ? (
                                            <>
                                                <div style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                                                    gap: "12px",
                                                    marginBottom: "16px"
                                                }}>
                                                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px" }}>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Performance Score</div>
                                                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-lime, #B8F34A)" }}>
                                                            {supplierPerformanceData.performanceScore ? `${supplierPerformanceData.performanceScore}%` : "100%"}
                                                        </div>
                                                    </div>

                                                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px" }}>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Total Orders</div>
                                                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                                                            {supplierPerformanceData.totalPurchaseOrders ?? 0}
                                                        </div>
                                                    </div>

                                                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px" }}>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Completed (Received)</div>
                                                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#34d399" }}>
                                                            {supplierPerformanceData.receivedOrders ?? 0}
                                                        </div>
                                                    </div>

                                                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px" }}>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Pending Orders</div>
                                                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#38bdf8" }}>
                                                            {supplierPerformanceData.pendingOrders ?? 0}
                                                        </div>
                                                    </div>

                                                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px" }}>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Cancelled Orders</div>
                                                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f87171" }}>
                                                            {supplierPerformanceData.cancelledOrders ?? 0}
                                                        </div>
                                                    </div>

                                                    <div style={{ background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "8px" }}>
                                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Total Procurement Value</div>
                                                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-lime, #B8F34A)" }}>
                                                            {formatCurrency(supplierPerformanceData.totalReceivedPurchaseValue ?? 0)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    background: "rgba(255, 255, 255, 0.04)",
                                                    padding: "14px",
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    display: "flex",
                                                    gap: "24px"
                                                }}>
                                                    <div>
                                                        <span style={{ color: "rgba(255,255,255,0.6)" }}>On-Time Delivery Rate: </span>
                                                        <strong>{supplierPerformanceData.onTimeDeliveryRate ? `${supplierPerformanceData.onTimeDeliveryRate}%` : "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: "rgba(255,255,255,0.6)" }}>Avg Delivery Time: </span>
                                                        <strong>{supplierPerformanceData.averageDeliveryDays ? `${supplierPerformanceData.averageDeliveryDays} days` : "N/A"}</strong>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                                                No recorded purchase orders found for this supplier yet.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* TAB 3: Transaction History */}
                                {detailsTab === "transactions" && (
                                    <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                                        {supplierTransactionsData.length === 0 ? (
                                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                                                No transaction history recorded for this supplier.
                                            </p>
                                        ) : (
                                            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                                                <thead>
                                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "rgba(255,255,255,0.6)" }}>
                                                        <th style={{ padding: "8px" }}>Date</th>
                                                        <th style={{ padding: "8px" }}>Type</th>
                                                        <th style={{ padding: "8px" }}>PO / Invoice</th>
                                                        <th style={{ padding: "8px" }}>Amount</th>
                                                        <th style={{ padding: "8px" }}>Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {supplierTransactionsData.map((txn, idx) => (
                                                        <tr key={txn.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                            <td style={{ padding: "8px" }}>{formatDate(txn.createdAt || txn.timestamp)}</td>
                                                            <td style={{ padding: "8px" }}>
                                                                <span style={{
                                                                    fontSize: "10px",
                                                                    padding: "2px 6px",
                                                                    borderRadius: "4px",
                                                                    background: "rgba(255,255,255,0.08)"
                                                                }}>
                                                                    {txn.transactionType || txn.type}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: "8px" }}>{txn.purchaseNumber || txn.referenceNumber || "—"}</td>
                                                            <td style={{ padding: "8px", color: "var(--primary-lime, #B8F34A)" }}>
                                                                {txn.amount ? formatCurrency(txn.amount) : "—"}
                                                            </td>
                                                            <td style={{ padding: "8px", color: "rgba(255,255,255,0.7)" }}>{txn.notes || txn.description || "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </>
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

function getNormalizedStatus(supplier) {
    if (supplier?.status) {
        return supplier.status.toString().toUpperCase();
    }
    if (typeof supplier?.active === "boolean") {
        return supplier.active ? "ACTIVE" : "INACTIVE";
    }
    return "ACTIVE";
}

export default SuppliersPage;
