import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    BellRing,
    Boxes,
    Building2,
    CheckCheck,
    Clock,
    DollarSign,
    ExternalLink,
    Filter,
    PackageCheck,
    PackagePlus,
    PackageSearch,
    RefreshCw,
    Search,
    ShoppingBag,
    TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";

import inventoryStockService from "../../services/inventoryStockService";
import { getReorderRecommendations } from "../../api/reorderRecommendationApi";
import { getSuppliers } from "../../api/supplierApi";
import { getSupplierProducts } from "../../api/supplierProductApi";
import { createSupplierPurchase } from "../../api/supplierPurchaseApi";
import SupplierPurchaseModal from "../../components/suppliers/SupplierPurchaseModal";
import "../../styles/inventoryOperations.css";

export default function LowStockAlertsPage() {
    const [activeTab, setActiveTab] = useState("recommendations"); // 'recommendations' | 'alerts'

    // Reorder recommendations state
    const [reorderData, setReorderData] = useState(null);
    const [reorderLoading, setReorderLoading] = useState(true);
    const [includeAdequate, setIncludeAdequate] = useState(false);
    const [reorderSearch, setReorderSearch] = useState("");
    const [reorderUrgencyFilter, setReorderUrgencyFilter] = useState("ALL");

    // Modal state for direct purchase order creation
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [purchaseInitialValues, setPurchaseInitialValues] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [savingPurchase, setSavingPurchase] = useState(false);

    // Alerts state
    const [dashboard, setDashboard] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [alertStatus, setAlertStatus] = useState("OPEN");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    // General state
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Load reorder recommendations from live database
    const loadRecommendations = useCallback(async () => {
        try {
            setReorderLoading(true);
            setError("");
            const data = await getReorderRecommendations(includeAdequate);
            setReorderData(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load reorder recommendations."
            );
        } finally {
            setReorderLoading(false);
        }
    }, [includeAdequate]);

    // Load reference suppliers for purchase order creation
    const loadSuppliersData = useCallback(async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch {
            setSuppliers([]);
        }
    }, []);

    // Load stock alert history dashboard
    const loadDashboard = async () => {
        try {
            const data = await inventoryStockService.getLowStockDashboard();
            setDashboard(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load low-stock dashboard."
            );
        }
    };

    // Load alerts list
    const loadAlerts = async () => {
        try {
            setAlertsLoading(true);
            setError("");
            const data = await inventoryStockService.getLowStockAlerts({
                status: alertStatus,
                page,
                size: 10,
            });

            if (Array.isArray(data)) {
                setAlerts(data);
                setTotalPages(data.length ? 1 : 0);
            } else {
                setAlerts(data?.content ?? []);
                setTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load low-stock alerts."
            );
        } finally {
            setAlertsLoading(false);
        }
    };

    useEffect(() => {
        loadRecommendations();
        loadSuppliersData();
        loadDashboard();
    }, [loadRecommendations, loadSuppliersData]);

    useEffect(() => {
        if (activeTab === "alerts") {
            loadAlerts();
        }
    }, [activeTab, alertStatus, page]);

    useEffect(() => {
        if (!message) return undefined;
        const timer = setTimeout(() => setMessage(""), 5000);
        return () => clearTimeout(timer);
    }, [message]);

    const handleSupplierChange = async (selectedSupplierId) => {
        if (!selectedSupplierId) {
            setSupplierProducts([]);
            return;
        }

        try {
            setProductsLoading(true);
            const data = await getSupplierProducts(selectedSupplierId);
            setSupplierProducts(data);
        } catch {
            setSupplierProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    // Open purchase order modal with data pre-filled from recommendation
    const handleOpenPurchaseOrder = async (recommendation) => {
        setError("");
        setMessage("");

        const suppId = recommendation.preferredSupplierId || "";
        const suppProdId = recommendation.preferredSupplierProductId || "";
        const suggestedQty = recommendation.suggestedOrderQuantity || 1;

        setPurchaseInitialValues({
            supplierId: suppId,
            supplierProductId: suppProdId,
            orderedQuantity: suggestedQty,
            expectedDeliveryDate: "",
            supplierInvoiceNumber: "",
            notes: `Auto-generated from reorder recommendation for ${recommendation.sparePartName} (${recommendation.partNumber}). Reason: ${recommendation.recommendationReason}`,
        });

        if (suppId) {
            await handleSupplierChange(suppId);
        }

        setPurchaseModalOpen(true);
    };

    // Save purchase order from recommendation
    const handleSavePurchase = async (purchaseData) => {
        try {
            setSavingPurchase(true);
            setError("");
            await createSupplierPurchase(purchaseData);
            setPurchaseModalOpen(false);
            setMessage("Purchase order created successfully! Recommendations will now reflect the pending order.");
            // Refresh recommendations to show outstanding order updated
            await loadRecommendations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create purchase order from recommendation."
            );
        } finally {
            setSavingPurchase(false);
        }
    };

    const handleEvaluate = async () => {
        try {
            setEvaluating(true);
            setError("");
            setMessage("");
            await inventoryStockService.evaluateLowStock();
            await Promise.all([loadDashboard(), loadAlerts(), loadRecommendations()]);
            setMessage("Low-stock evaluation completed for all inventory items.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to evaluate low-stock items."
            );
        } finally {
            setEvaluating(false);
        }
    };

    const handleAcknowledge = async (alert) => {
        try {
            setUpdatingId(alert.id);
            setError("");
            setMessage("");
            const updated = await inventoryStockService.acknowledgeAlert(alert.id);
            setAlerts((current) =>
                current.map((item) =>
                    item.id === alert.id ? { ...item, ...updated } : item
                )
            );
            await loadDashboard();
            setMessage(`${alert.sparePartName} alert acknowledged.`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to acknowledge alert."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter recommendations by query and urgency
    const filteredRecommendations = useMemo(() => {
        if (!reorderData?.recommendations) return [];
        return reorderData.recommendations.filter((rec) => {
            const matchesQuery =
                !reorderSearch.trim() ||
                rec.sparePartName?.toLowerCase().includes(reorderSearch.toLowerCase()) ||
                rec.partNumber?.toLowerCase().includes(reorderSearch.toLowerCase()) ||
                rec.brand?.toLowerCase().includes(reorderSearch.toLowerCase()) ||
                rec.categoryName?.toLowerCase().includes(reorderSearch.toLowerCase());

            const matchesUrgency =
                reorderUrgencyFilter === "ALL" ||
                rec.urgencyStatus === reorderUrgencyFilter;

            return matchesQuery && matchesUrgency;
        });
    }, [reorderData, reorderSearch, reorderUrgencyFilter]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(Number(val || 0));
    };

    const formatDate = (value) =>
        value ? new Date(value).toLocaleString() : "—";

    const getUrgencyBadge = (urgency) => {
        switch (urgency) {
            case "CRITICAL_OUT_OF_STOCK":
                return { label: "CRITICAL: OUT OF STOCK", className: "badge-danger" };
            case "LOW_STOCK_ALERT":
                return { label: "LOW STOCK: REORDER NEEDED", className: "badge-warning" };
            case "ORDER_PENDING":
                return { label: "ORDER PENDING DELIVERY", className: "badge-info" };
            case "ADEQUATELY_STOCKED":
                return { label: "ADEQUATELY STOCKED", className: "badge-success" };
            default:
                return { label: urgency, className: "badge-neutral" };
        }
    };

    return (
        <main className="stock-page">
            <div className="stock-heading">
                <div>
                    <h1>Inventory & Reorder Center</h1>
                    <p>
                        Intelligent replenishment calculations, supplier routing, and alert tracking based on live stock levels.
                    </p>
                </div>

                <div className="stock-heading-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                        type="button"
                        className="stock-primary-button"
                        onClick={handleEvaluate}
                        disabled={evaluating}
                    >
                        <RefreshCw
                            size={16}
                            className={evaluating ? "stock-spinning" : ""}
                        />
                        {evaluating ? "Evaluating..." : "Evaluate All Stock"}
                    </button>

                    <Link to="/supplier-purchases" className="stock-secondary-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <ShoppingBag size={17} />
                        <span>View Purchase Orders</span>
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="stock-tabs-nav" style={{
                display: "flex",
                gap: "8px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                marginBottom: "24px",
                paddingBottom: "4px"
            }}>
                <button
                    type="button"
                    onClick={() => setActiveTab("recommendations")}
                    style={{
                        background: activeTab === "recommendations" ? "rgba(184, 243, 74, 0.12)" : "transparent",
                        color: activeTab === "recommendations" ? "var(--primary-lime, #B8F34A)" : "rgba(255, 255, 255, 0.65)",
                        border: activeTab === "recommendations" ? "1px solid rgba(184, 243, 74, 0.4)" : "1px solid transparent",
                        borderBottom: activeTab === "recommendations" ? "2px solid var(--primary-lime, #B8F34A)" : "none",
                        padding: "10px 18px",
                        borderRadius: "8px 8px 0 0",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        transition: "all 0.2s ease"
                    }}
                >
                    <PackageSearch size={18} />
                    <span>Reorder Recommendations</span>
                    {reorderData?.recommendationsCount > 0 && (
                        <span style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 800,
                            border: "1px solid rgba(239, 68, 68, 0.4)"
                        }}>
                            {reorderData.recommendationsCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("alerts")}
                    style={{
                        background: activeTab === "alerts" ? "rgba(184, 243, 74, 0.12)" : "transparent",
                        color: activeTab === "alerts" ? "var(--primary-lime, #B8F34A)" : "rgba(255, 255, 255, 0.65)",
                        border: activeTab === "alerts" ? "1px solid rgba(184, 243, 74, 0.4)" : "1px solid transparent",
                        borderBottom: activeTab === "alerts" ? "2px solid var(--primary-lime, #B8F34A)" : "none",
                        padding: "10px 18px",
                        borderRadius: "8px 8px 0 0",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        transition: "all 0.2s ease"
                    }}
                >
                    <AlertTriangle size={18} />
                    <span>Low-Stock Alerts History</span>
                    {dashboard?.openAlerts > 0 && (
                        <span style={{
                            background: "rgba(245, 158, 11, 0.2)",
                            color: "#fbbf24",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 800,
                            border: "1px solid rgba(245, 158, 11, 0.4)"
                        }}>
                            {dashboard.openAlerts}
                        </span>
                    )}
                </button>
            </div>

            {error && (
                <div className="stock-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="stock-alert success">
                    {message}
                </div>
            )}

            {/* TAB 1: REORDER RECOMMENDATIONS */}
            {activeTab === "recommendations" && (
                <>
                    {/* Live Metric KPI Cards */}
                    <section className="stock-stat-grid" style={{ marginBottom: "24px" }}>
                        <article className="stock-stat-card warning">
                            <TrendingDown size={22} />
                            <span>Actionable Reorders</span>
                            <strong>{reorderData?.recommendationsCount ?? 0}</strong>
                        </article>

                        <article className="stock-stat-card danger">
                            <AlertCircle size={22} />
                            <span>Critical Out-of-Stock</span>
                            <strong>{reorderData?.criticalShortageCount ?? 0}</strong>
                        </article>

                        <article className="stock-stat-card">
                            <Clock size={22} />
                            <span>Covered by Pending Orders</span>
                            <strong>{reorderData?.pendingOrdersCoveredCount ?? 0}</strong>
                        </article>

                        <article className="stock-stat-card" style={{ borderColor: "rgba(184, 243, 74, 0.3)" }}>
                            <DollarSign size={22} color="var(--primary-lime, #B8F34A)" />
                            <span>Est. Procurement Cost</span>
                            <strong style={{ fontSize: "1.4rem", color: "var(--primary-lime, #B8F34A)" }}>
                                {formatCurrency(reorderData?.estimatedTotalProcurementCost ?? 0)}
                            </strong>
                        </article>
                    </section>

                    {/* Filter and Search Bar */}
                    <div className="stock-card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
                        <div style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px", alignItems: "center" }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                    borderRadius: "8px",
                                    padding: "8px 14px",
                                    flex: 1
                                }}>
                                    <Search size={16} color="rgba(255, 255, 255, 0.5)" />
                                    <input
                                        type="text"
                                        placeholder="Search part name, SKU, brand, category..."
                                        value={reorderSearch}
                                        onChange={(e) => setReorderSearch(e.target.value)}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "#fff",
                                            outline: "none",
                                            width: "100%",
                                            fontSize: "14px"
                                        }}
                                    />
                                    {reorderSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setReorderSearch("")}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "rgba(255, 255, 255, 0.5)",
                                                cursor: "pointer"
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div style={{ minWidth: "180px" }}>
                                    <select
                                        value={reorderUrgencyFilter}
                                        onChange={(e) => setReorderUrgencyFilter(e.target.value)}
                                        style={{
                                            width: "100%",
                                            background: "rgba(255, 255, 255, 0.05)",
                                            border: "1px solid rgba(255, 255, 255, 0.12)",
                                            borderRadius: "8px",
                                            color: "#fff",
                                            padding: "9px 12px",
                                            fontSize: "13px"
                                        }}
                                    >
                                        <option value="ALL">All Urgencies</option>
                                        <option value="CRITICAL_OUT_OF_STOCK">Critical Out of Stock</option>
                                        <option value="LOW_STOCK_ALERT">Low Stock Alert</option>
                                        <option value="ORDER_PENDING">Order Pending Delivery</option>
                                        <option value="ADEQUATELY_STOCKED">Adequately Stocked</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                <label style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    color: "rgba(255, 255, 255, 0.8)"
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={includeAdequate}
                                        onChange={(e) => setIncludeAdequate(e.target.checked)}
                                        style={{ cursor: "pointer", accentColor: "var(--primary-lime, #B8F34A)" }}
                                    />
                                    Include Adequately Stocked Parts
                                </label>

                                <button
                                    type="button"
                                    onClick={loadRecommendations}
                                    disabled={reorderLoading}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        background: "rgba(255, 255, 255, 0.08)",
                                        border: "1px solid rgba(255, 255, 255, 0.15)",
                                        color: "#fff",
                                        padding: "8px 14px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "13px"
                                    }}
                                >
                                    <RefreshCw size={14} className={reorderLoading ? "stock-spinning" : ""} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations List / Table */}
                    {reorderLoading ? (
                        <div className="stock-page-message">
                            Calculating dynamic reorder recommendations from inventory and purchase records...
                        </div>
                    ) : filteredRecommendations.length === 0 ? (
                        <div className="stock-empty" style={{ padding: "48px 24px", textAlign: "center" }}>
                            <PackageCheck size={56} color="var(--primary-lime, #B8F34A)" />
                            <h3 style={{ margin: "16px 0 8px" }}>Inventory Levels are Optimal</h3>
                            <p style={{ maxWidth: "480px", margin: "0 auto", color: "rgba(255, 255, 255, 0.65)" }}>
                                {reorderSearch || reorderUrgencyFilter !== "ALL"
                                    ? "No spare parts match your current filter criteria."
                                    : "All spare parts are currently above their reorder thresholds or have sufficient pending orders in progress."}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {filteredRecommendations.map((rec) => {
                                const badge = getUrgencyBadge(rec.urgencyStatus);
                                const isActionable = rec.urgencyStatus === "CRITICAL_OUT_OF_STOCK" || rec.urgencyStatus === "LOW_STOCK_ALERT";
                                const isPending = rec.urgencyStatus === "ORDER_PENDING";

                                return (
                                    <article
                                        key={rec.sparePartId}
                                        style={{
                                            background: "rgba(18, 24, 20, 0.75)",
                                            border: isActionable
                                                ? "1px solid rgba(239, 68, 68, 0.35)"
                                                : isPending
                                                    ? "1px solid rgba(56, 189, 248, 0.35)"
                                                    : "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: "14px",
                                            padding: "20px",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                                            position: "relative"
                                        }}
                                    >
                                        {/* Card Header */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                            marginBottom: "14px"
                                        }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                    <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#fff", fontWeight: 700 }}>
                                                        {rec.sparePartName}
                                                    </h3>
                                                    <span style={{
                                                        background: "rgba(255, 255, 255, 0.08)",
                                                        color: "rgba(255, 255, 255, 0.8)",
                                                        padding: "2px 8px",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontFamily: "monospace"
                                                    }}>
                                                        SKU: {rec.partNumber}
                                                    </span>
                                                    {rec.categoryName && (
                                                        <span style={{
                                                            background: "rgba(184, 243, 74, 0.12)",
                                                            color: "var(--primary-lime, #B8F34A)",
                                                            padding: "2px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "12px",
                                                            fontWeight: 600
                                                        }}>
                                                            {rec.categoryName}
                                                        </span>
                                                    )}
                                                    {rec.brand && (
                                                        <span style={{
                                                            background: "rgba(255, 255, 255, 0.05)",
                                                            color: "rgba(255, 255, 255, 0.6)",
                                                            padding: "2px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "12px"
                                                        }}>
                                                            {rec.brand}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Urgency Badge */}
                                            <span style={{
                                                fontSize: "11px",
                                                fontWeight: 800,
                                                letterSpacing: "0.05em",
                                                padding: "5px 12px",
                                                borderRadius: "999px",
                                                background: badge.className === "badge-danger"
                                                    ? "rgba(239, 68, 68, 0.18)"
                                                    : badge.className === "badge-warning"
                                                        ? "rgba(245, 158, 11, 0.18)"
                                                        : badge.className === "badge-info"
                                                            ? "rgba(56, 189, 248, 0.18)"
                                                            : "rgba(16, 185, 129, 0.18)",
                                                color: badge.className === "badge-danger"
                                                    ? "#f87171"
                                                    : badge.className === "badge-warning"
                                                        ? "#fbbf24"
                                                        : badge.className === "badge-info"
                                                            ? "#38bdf8"
                                                            : "#34d399",
                                                border: `1px solid ${
                                                    badge.className === "badge-danger"
                                                        ? "rgba(239, 68, 68, 0.4)"
                                                        : badge.className === "badge-warning"
                                                            ? "rgba(245, 158, 11, 0.4)"
                                                            : badge.className === "badge-info"
                                                                ? "rgba(56, 189, 248, 0.4)"
                                                                : "rgba(16, 185, 129, 0.4)"
                                                }`
                                            }}>
                                                {badge.label}
                                            </span>
                                        </div>

                                        {/* Stock Metrics Grid */}
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                                            gap: "12px",
                                            background: "rgba(0, 0, 0, 0.3)",
                                            padding: "12px 16px",
                                            borderRadius: "10px",
                                            marginBottom: "14px",
                                            border: "1px solid rgba(255, 255, 255, 0.05)"
                                        }}>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>Current Stock</div>
                                                <div style={{
                                                    fontSize: "1.2rem",
                                                    fontWeight: 800,
                                                    color: rec.currentStock === 0 ? "#f87171" : rec.currentStock <= rec.reorderLevel ? "#fbbf24" : "#fff"
                                                }}>
                                                    {rec.currentStock} units
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>Reorder Level</div>
                                                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                                                    {rec.reorderLevel} units
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>Net Shortage</div>
                                                <div style={{
                                                    fontSize: "1.2rem",
                                                    fontWeight: 700,
                                                    color: rec.netShortage > 0 ? "#f87171" : "rgba(255, 255, 255, 0.7)"
                                                }}>
                                                    {rec.netShortage} units
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase" }}>Pending On Order</div>
                                                <div style={{
                                                    fontSize: "1.2rem",
                                                    fontWeight: 700,
                                                    color: rec.pendingOrderedQuantity > 0 ? "#38bdf8" : "rgba(255, 255, 255, 0.5)"
                                                }}>
                                                    {rec.pendingOrderedQuantity} units
                                                </div>
                                            </div>

                                            <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.1)", paddingLeft: "12px" }}>
                                                <div style={{ fontSize: "11px", color: "var(--primary-lime, #B8F34A)", fontWeight: 700, textTransform: "uppercase" }}>
                                                    Suggested Order
                                                </div>
                                                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-lime, #B8F34A)" }}>
                                                    {rec.suggestedOrderQuantity} units
                                                </div>
                                            </div>
                                        </div>

                                        {/* Supplier & Cost Info & Recommendation Reason */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: "16px",
                                            marginBottom: "12px"
                                        }}>
                                            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px" }}>
                                                <div>
                                                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Supplier: </span>
                                                    <strong style={{ color: "#fff" }}>
                                                        {rec.preferredSupplierName
                                                            ? `${rec.preferredSupplierName} (${rec.preferredSupplierCode || ""})`
                                                            : "No linked supplier"}
                                                    </strong>
                                                </div>

                                                {rec.unitPurchasePrice && (
                                                    <div>
                                                        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Unit Price: </span>
                                                        <strong style={{ color: "#fff" }}>
                                                            {formatCurrency(rec.unitPurchasePrice)}
                                                        </strong>
                                                    </div>
                                                )}

                                                {rec.estimatedTotalCost && (
                                                    <div>
                                                        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Est. Total: </span>
                                                        <strong style={{ color: "var(--primary-lime, #B8F34A)" }}>
                                                            {formatCurrency(rec.estimatedTotalCost)}
                                                        </strong>
                                                    </div>
                                                )}

                                                {rec.minimumOrderQuantity > 1 && (
                                                    <div>
                                                        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>MOQ: </span>
                                                        <span style={{ color: "#fff" }}>{rec.minimumOrderQuantity} units</span>
                                                    </div>
                                                )}

                                                {rec.leadTimeDays > 0 && (
                                                    <div>
                                                        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Lead Time: </span>
                                                        <span style={{ color: "#fff" }}>{rec.leadTimeDays} days</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button: Create Purchase Order directly from recommendation */}
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <Link
                                                    to={`/inventory/products/${rec.sparePartId}/stock`}
                                                    className="stock-secondary-link"
                                                    style={{ fontSize: "13px" }}
                                                >
                                                    Stock Details
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPurchaseOrder(rec)}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "7px",
                                                        background: isActionable
                                                            ? "var(--primary-lime, #B8F34A)"
                                                            : "rgba(255, 255, 255, 0.12)",
                                                        color: isActionable ? "#0c1612" : "#ffffff",
                                                        border: "none",
                                                        padding: "9px 18px",
                                                        borderRadius: "8px",
                                                        fontWeight: 800,
                                                        fontSize: "13px",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                >
                                                    <ShoppingBag size={16} />
                                                    <span>{isPending ? "Create Additional PO" : "Create Purchase Order"}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Business Logic Reason Box */}
                                        <div style={{
                                            background: "rgba(255, 255, 255, 0.03)",
                                            borderLeft: "3px solid var(--primary-lime, #B8F34A)",
                                            padding: "8px 14px",
                                            borderRadius: "0 6px 6px 0",
                                            fontSize: "12px",
                                            color: "rgba(255, 255, 255, 0.8)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}>
                                            <span style={{ fontWeight: 700, color: "var(--primary-lime, #B8F34A)" }}>Reason:</span>
                                            <span>{rec.recommendationReason}</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* TAB 2: LOW STOCK ALERTS HISTORY */}
            {activeTab === "alerts" && (
                <>
                    <section className="stock-stat-grid">
                        <article className="stock-stat-card warning">
                            <AlertTriangle size={22} />
                            <span>Low-Stock Products</span>
                            <strong>{dashboard?.totalLowStockProducts ?? 0}</strong>
                        </article>

                        <article className="stock-stat-card danger">
                            <BellRing size={22} />
                            <span>Open Alerts</span>
                            <strong>{dashboard?.openAlerts ?? 0}</strong>
                        </article>

                        <article className="stock-stat-card">
                            <CheckCheck size={22} />
                            <span>Acknowledged</span>
                            <strong>{dashboard?.acknowledgedAlerts ?? 0}</strong>
                        </article>
                    </section>

                    <section className="stock-card">
                        <div className="stock-alert-filters">
                            <h2>Alert History</h2>

                            <select
                                value={alertStatus}
                                onChange={(event) => {
                                    setAlertStatus(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">All Alerts</option>
                                <option value="OPEN">Open Alerts</option>
                                <option value="ACKNOWLEDGED">Acknowledged</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>

                        {alertsLoading ? (
                            <div className="stock-page-message">
                                Loading alerts...
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="stock-empty">
                                <PackageCheck size={46} />
                                <h3>No alerts found</h3>
                                <p>No inventory alerts match this status.</p>
                            </div>
                        ) : (
                            <div className="stock-alert-list">
                                {alerts.map((alert) => (
                                    <article
                                        key={alert.id}
                                        className={`stock-alert-card ${alert.status.toLowerCase()}`}
                                    >
                                        <div className="stock-alert-icon">
                                            <AlertTriangle size={22} />
                                        </div>

                                        <div className="stock-alert-content">
                                            <div className="stock-alert-title">
                                                <div>
                                                    <h3>{alert.sparePartName}</h3>
                                                    <span>{alert.partNumber}</span>
                                                </div>

                                                <span className={`stock-alert-status ${alert.status.toLowerCase()}`}>
                                                    {alert.status}
                                                </span>
                                            </div>

                                            <p>{alert.message}</p>

                                            <div className="stock-alert-values">
                                                <span>
                                                    Current stock: <strong>{alert.stockQuantity}</strong>
                                                </span>
                                                <span>
                                                    Reorder level: <strong>{alert.reorderLevel}</strong>
                                                </span>
                                                <span>
                                                    Created: <strong>{formatDate(alert.createdAt)}</strong>
                                                </span>
                                            </div>

                                            {alert.acknowledgedByEmail && (
                                                <small>
                                                    Acknowledged by {alert.acknowledgedByEmail} at {formatDate(alert.acknowledgedAt)}
                                                </small>
                                            )}

                                            {alert.resolvedAt && (
                                                <small>
                                                    Resolved at {formatDate(alert.resolvedAt)}
                                                </small>
                                            )}
                                        </div>

                                        <div className="stock-alert-actions">
                                            <Link
                                                to={`/inventory/products/${alert.sparePartId}/stock`}
                                                className="stock-secondary-link"
                                            >
                                                Manage Stock
                                            </Link>

                                            {alert.status === "OPEN" && (
                                                <button
                                                    type="button"
                                                    className="stock-primary-button"
                                                    disabled={updatingId === alert.id}
                                                    onClick={() => handleAcknowledge(alert)}
                                                >
                                                    <CheckCheck size={16} />
                                                    {updatingId === alert.id ? "Saving..." : "Acknowledge"}
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="stock-pagination">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage((current) => current - 1)}
                                >
                                    Previous
                                </button>
                                <span>Page {page + 1} of {totalPages}</span>
                                <button
                                    disabled={page + 1 >= totalPages}
                                    onClick={() => setPage((current) => current + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Seamless Purchase Order Creation Modal */}
            <SupplierPurchaseModal
                open={purchaseModalOpen}
                suppliers={suppliers}
                supplierProducts={supplierProducts}
                productsLoading={productsLoading}
                saving={savingPurchase}
                initialValues={purchaseInitialValues}
                onSupplierChange={handleSupplierChange}
                onClose={() => {
                    setPurchaseModalOpen(false);
                    setPurchaseInitialValues(null);
                }}
                onSubmit={handleSavePurchase}
            />
        </main>
    );
}