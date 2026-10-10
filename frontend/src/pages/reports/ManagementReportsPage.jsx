import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    Award,
    Boxes,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileBarChart,
    FileSpreadsheet,
    FileText,
    Filter,
    PackageCheck,
    PackageSearch,
    Printer,
    RefreshCw,
    Search,
    ShoppingBag,
    TrendingUp,
    Truck,
    X,
} from "lucide-react";

import {
    exportManagementReport,
    generateManagementReport,
    getManagementDashboard,
} from "../../api/managementReportApi";

import { getSuppliers } from "../../api/supplierApi";
import { getActiveSpareParts } from "../../api/supplierProductApi";

import "../../styles/ManagementReportsPage.css";

const today = new Date().toISOString().split("T")[0];
const yearStart = `${new Date().getFullYear()}-01-01`;

const initialFilters = {
    reportType: "SUPPLIER_PERFORMANCE",
    startDate: yearStart,
    endDate: today,
    productId: "",
    supplierId: "",
    transactionType: "",
    orderStatus: "",
    paymentStatus: "",
};

const reportCatalog = [
    {
        value: "SUPPLIER_PERFORMANCE",
        title: "Supplier Performance Report",
        description: "Vendor scorecards, ranking, order fulfillment rates, and on-time delivery audits.",
        icon: Award,
        badge: "Epic 4 Core",
    },
    {
        value: "PROCUREMENT",
        title: "Procurement & Purchase Report",
        description: "Purchase order logs, supplier-wise & part-wise procurement, received vs pending volumes.",
        icon: ShoppingBag,
        badge: "Epic 4 Core",
    },
    {
        value: "INVENTORY",
        title: "Inventory Stock Valuation Report",
        description: "Comprehensive stock on hand, low-stock alerts, out-of-stock items, and valuation.",
        icon: Boxes,
        badge: "Epic 4 Core",
    },
    {
        value: "REORDER_RECOMMENDATIONS",
        title: "Reorder Recommendation Report",
        description: "Parts below thresholds, suggested replenishment, lead times, MOQ, and cost estimates.",
        icon: AlertTriangle,
        badge: "Epic 4 Core",
    },
    {
        value: "SUPPLIER_TRANSACTIONS",
        title: "Supplier Transaction History",
        description: "Audit trail of purchase orders, deliveries, status updates, and supplier lifecycle events.",
        icon: Clock,
        badge: "Epic 4 Core",
    },
    {
        value: "SALES",
        title: "Sales Revenue Report",
        description: "Customer sales orders, revenue totals, profit margins, and inventory movement.",
        icon: TrendingUp,
        badge: "Management",
    },
    {
        value: "ORDERS",
        title: "Customer Orders Report",
        description: "Customer orders breakdown by status, fulfillment dates, and payment states.",
        icon: ClipboardList,
        badge: "Sales Operations",
    },
    {
        value: "PAYMENTS",
        title: "Financial Payments Report",
        description: "Customer and gateway payments, transaction IDs, statuses, and revenue collections.",
        icon: CreditCard,
        badge: "Finance",
    },
];

function ManagementReportsPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [dashboard, setDashboard] = useState(null);
    const [report, setReport] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadReferenceData = useCallback(async () => {
        try {
            const [supplierData, productData] = await Promise.all([
                getSuppliers(),
                getActiveSpareParts(),
            ]);

            setSuppliers(supplierData);
            setProducts(productData);
        } catch {
            setSuppliers([]);
            setProducts([]);
        }
    }, []);

    const loadDashboard = useCallback(async () => {
        try {
            setDashboardLoading(true);
            setError("");

            const data = await getManagementDashboard({
                startDate: filters.startDate,
                endDate: filters.endDate,
            });

            setDashboard(data);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load management dashboard."
            );
        } finally {
            setDashboardLoading(false);
        }
    }, [filters.startDate, filters.endDate]);

    useEffect(() => {
        loadReferenceData();
    }, [loadReferenceData]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        if (!success) return undefined;
        const timer = window.setTimeout(() => setSuccess(""), 4000);
        return () => window.clearTimeout(timer);
    }, [success]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSelectReportType = (reportType) => {
        setFilters((prev) => ({
            ...prev,
            reportType,
        }));
        setReport(null);
    };

    const validateDates = () => {
        if (
            filters.startDate &&
            filters.endDate &&
            filters.startDate > filters.endDate
        ) {
            setError("Start date cannot be after end date.");
            return false;
        }
        return true;
    };

    const handleGenerateReport = async (event) => {
        if (event) event.preventDefault();
        if (!validateDates()) return;

        try {
            setReportLoading(true);
            setError("");

            const data = await generateManagementReport({
                reportType: filters.reportType,
                startDate: filters.startDate || null,
                endDate: filters.endDate || null,
                productId: filters.productId ? Number(filters.productId) : null,
                supplierId: filters.supplierId ? Number(filters.supplierId) : null,
                transactionType: filters.transactionType || null,
                orderStatus: filters.orderStatus || null,
                paymentStatus: filters.paymentStatus || null,
            });

            setReport(data);
            setSuccess(`${getCurrentReportMeta()?.title || "Report"} generated successfully.`);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to generate report from database records."
            );
        } finally {
            setReportLoading(false);
        }
    };

    const handleExportCsv = async () => {
        if (!validateDates()) return;

        try {
            setExporting(true);
            setError("");

            await exportManagementReport({
                reportType: filters.reportType,
                startDate: filters.startDate,
                endDate: filters.endDate,
                productId: filters.productId,
                supplierId: filters.supplierId,
                transactionType: filters.transactionType,
                orderStatus: filters.orderStatus,
                paymentStatus: filters.paymentStatus,
            });

            setSuccess("CSV/Excel report file downloaded successfully.");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to export CSV report."
            );
        } finally {
            setExporting(false);
        }
    };

    const handlePrintPdf = () => {
        window.print();
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setReport(null);
        setError("");
    };

    const getCurrentReportMeta = () => {
        return reportCatalog.find((r) => r.value === filters.reportType) || reportCatalog[0];
    };

    const reportRecords = useMemo(() => report?.records ?? [], [report]);

    const tableColumns = useMemo(() => {
        if (reportRecords.length === 0) return [];
        return Object.keys(reportRecords[0]);
    }, [reportRecords]);

    // Show/hide contextual filters based on active report
    const showProductFilter = [
        "INVENTORY",
        "PROCUREMENT",
        "REORDER_RECOMMENDATIONS",
        "SALES",
    ].includes(filters.reportType);

    const showSupplierFilter = [
        "SUPPLIER_PERFORMANCE",
        "PROCUREMENT",
        "REORDER_RECOMMENDATIONS",
        "SUPPLIER_TRANSACTIONS",
        "SUPPLIERS",
    ].includes(filters.reportType);

    const showOrderStatusFilter = [
        "PROCUREMENT",
        "ORDERS",
    ].includes(filters.reportType);

    const showTransactionType = filters.reportType === "SUPPLIER_TRANSACTIONS";
    const showPaymentStatus = filters.reportType === "PAYMENTS";

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(Number(val || 0));
    };

    const formatHeader = (key) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .replace(/_/g, " ");
    };

    const formatCellValue = (key, value) => {
        if (value === null || value === undefined) return "—";

        // Boolean status
        if (typeof value === "boolean") {
            return value ? "Active" : "Inactive";
        }

        // Amount / currency columns
        const isAmountColumn = [
            "totalAmount",
            "unitPrice",
            "price",
            "estimatedCost",
            "totalProcurementValue",
            "grossSales",
            "netSales",
            "amount",
        ].includes(key);

        if (isAmountColumn && !isNaN(Number(value))) {
            return formatCurrency(value);
        }

        // Dates
        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("at")) {
            if (typeof value === "string" && value.length >= 10) {
                return value.includes("T") ? new Date(value).toLocaleDateString() : value;
            }
        }

        return String(value);
    };

    const currentMeta = getCurrentReportMeta();

    return (
        <main className="management-reports-page">
            {/* Header Banner */}
            <section className="management-hero">
                <div>
                    <span>MANAGEMENT CONTROL CENTER</span>
                    <h1>Reports & Business Analytics</h1>
                    <p>
                        Real-time procurement audits, vendor performance evaluation, inventory replenishment, and executive reports generated directly from database records.
                    </p>
                </div>

                <div className="management-hero-icon">
                    <FileBarChart size={45} />
                </div>
            </section>

            {error && (
                <div className="report-alert error">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {success && (
                <div className="report-alert success">
                    <span>{success}</span>
                    <button type="button" onClick={() => setSuccess("")}>
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* Global Management Dashboard KPI Highlights */}
            {dashboard && (
                <section style={{ margin: "24px 0" }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px"
                    }}>
                        <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                            Live Enterprise KPIs
                        </h2>
                        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                            Period: {filters.startDate} to {filters.endDate}
                        </span>
                    </div>

                    <div className="management-main-metrics" style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px"
                    }}>
                        <article className="management-metric-card" style={{
                            background: "rgba(12, 22, 18, 0.85)",
                            border: "1px solid rgba(184, 243, 74, 0.22)",
                            borderRadius: "16px",
                            padding: "18px 20px"
                        }}>
                            <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                Active Suppliers
                            </span>
                            <strong style={{ fontSize: "28px", color: "var(--primary-lime, #B8F34A)" }}>
                                {dashboard?.suppliers?.activeSuppliers ?? 0}
                            </strong>
                            <small style={{ display: "block", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                                of {dashboard?.suppliers?.totalSuppliers ?? 0} registered
                            </small>
                        </article>

                        <article className="management-metric-card" style={{
                            background: "rgba(12, 22, 18, 0.85)",
                            border: "1px solid rgba(184, 243, 74, 0.22)",
                            borderRadius: "16px",
                            padding: "18px 20px"
                        }}>
                            <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                Low-Stock Alerts
                            </span>
                            <strong style={{ fontSize: "28px", color: "#fbbf24" }}>
                                {dashboard?.inventory?.lowStockPartsCount ?? 0}
                            </strong>
                            <small style={{ display: "block", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                                {dashboard?.inventory?.outOfStockCount ?? 0} out of stock
                            </small>
                        </article>

                        <article className="management-metric-card" style={{
                            background: "rgba(12, 22, 18, 0.85)",
                            border: "1px solid rgba(184, 243, 74, 0.22)",
                            borderRadius: "16px",
                            padding: "18px 20px"
                        }}>
                            <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                Total Inventory Value
                            </span>
                            <strong style={{ fontSize: "24px", color: "#38bdf8" }}>
                                {formatCurrency(dashboard?.inventory?.totalStockValue ?? 0)}
                            </strong>
                            <small style={{ display: "block", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                                {dashboard?.inventory?.totalPartsCount ?? 0} part items
                            </small>
                        </article>

                        <article className="management-metric-card" style={{
                            background: "rgba(12, 22, 18, 0.85)",
                            border: "1px solid rgba(184, 243, 74, 0.22)",
                            borderRadius: "16px",
                            padding: "18px 20px"
                        }}>
                            <span style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                Gross Sales Revenue
                            </span>
                            <strong style={{ fontSize: "24px", color: "#34d399" }}>
                                {formatCurrency(dashboard?.sales?.grossSales ?? 0)}
                            </strong>
                            <small style={{ display: "block", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                                {dashboard?.sales?.completedSalesCount ?? 0} completed orders
                            </small>
                        </article>
                    </div>
                </section>
            )}

            {/* Interactive Report Selector Cards */}
            <section style={{ margin: "32px 0 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <FileText size={20} color="var(--primary-lime, #B8F34A)" />
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                        Select Report Module
                    </h2>
                </div>

                <div className="report-selector-grid">
                    {reportCatalog.map((item) => {
                        const Icon = item.icon;
                        const isSelected = filters.reportType === item.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                className={`report-selector-card ${isSelected ? "active" : ""}`}
                                onClick={() => handleSelectReportType(item.value)}
                            >
                                <div>
                                    <div className="report-card-top">
                                        <div className="report-card-icon">
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h3>{item.title}</h3>
                                        </div>
                                    </div>
                                    <p>{item.description}</p>
                                </div>

                                <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{
                                        fontSize: "10.5px",
                                        fontWeight: 800,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        padding: "2px 8px",
                                        borderRadius: "999px",
                                        background: isSelected ? "var(--primary-lime, #B8F34A)" : "rgba(255, 255, 255, 0.08)",
                                        color: isSelected ? "#071c14" : "rgba(255, 255, 255, 0.6)"
                                    }}>
                                        {item.badge}
                                    </span>

                                    {isSelected && (
                                        <span style={{ fontSize: "12px", color: "var(--primary-lime, #B8F34A)", fontWeight: 700 }}>
                                            Selected ✓
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Report Configuration & Filters Bar */}
            <section className="report-filter-card" style={{
                background: "rgba(12, 22, 18, 0.85)",
                border: "1px solid rgba(184, 243, 74, 0.22)",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "28px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingBottom: "14px",
                    marginBottom: "18px"
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 750, color: "#fff" }}>
                            Filter Criteria: {currentMeta.title}
                        </h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                            Filter records by date ranges, vendors, catalog parts, and order statuses.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            type="button"
                            className="report-button secondary"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </button>

                        <button
                            type="button"
                            className="report-button primary"
                            onClick={handleGenerateReport}
                            disabled={reportLoading}
                        >
                            <RefreshCw size={16} className={reportLoading ? "spin" : ""} />
                            {reportLoading ? "Generating..." : "Generate Report"}
                        </button>
                    </div>
                </div>

                <form className="report-filter-grid" onSubmit={handleGenerateReport}>
                    <div className="report-filter-group">
                        <label>Date Range (From)</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            max={filters.endDate || today}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="report-filter-group">
                        <label>Date Range (To)</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            min={filters.startDate}
                            max={today}
                            onChange={handleFilterChange}
                        />
                    </div>

                    {showSupplierFilter && (
                        <div className="report-filter-group">
                            <label>Supplier / Vendor</label>
                            <select
                                name="supplierId"
                                value={filters.supplierId}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Suppliers ({suppliers.length})</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.supplierCode} - {s.companyName || s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showProductFilter && (
                        <div className="report-filter-group">
                            <label>Spare Part / SKU</label>
                            <select
                                name="productId"
                                value={filters.productId}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Spare Parts ({products.length})</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.partNumber} - {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showOrderStatusFilter && (
                        <div className="report-filter-group">
                            <label>Order Status</label>
                            <select
                                name="orderStatus"
                                value={filters.orderStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Order Statuses</option>
                                <option value="ORDERED">Ordered (Pending Delivery)</option>
                                <option value="RECEIVED">Received (Completed)</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {showTransactionType && (
                        <div className="report-filter-group">
                            <label>Transaction Type</label>
                            <select
                                name="transactionType"
                                value={filters.transactionType}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Transaction Types</option>
                                <option value="PURCHASE_CREATED">Purchase Created</option>
                                <option value="PURCHASE_RECEIVED">Purchase Received</option>
                                <option value="PURCHASE_CANCELLED">Purchase Cancelled</option>
                                <option value="PRICE_UPDATED">Price Updated</option>
                                <option value="SUPPLIER_ACTIVATED">Supplier Activated</option>
                                <option value="SUPPLIER_DEACTIVATED">Supplier Deactivated</option>
                                <option value="SUPPLIER_SUSPENDED">Supplier Suspended</option>
                            </select>
                        </div>
                    )}

                    {showPaymentStatus && (
                        <div className="report-filter-group">
                            <label>Payment Status</label>
                            <select
                                name="paymentStatus"
                                value={filters.paymentStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Payment Statuses</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                    )}
                </form>
            </section>

            {/* Generated Report Output Section */}
            {report && (
                <section className="generated-report-card">
                    {/* Printable PDF Header (Visible during print / PDF generation) */}
                    <div className="report-print-header" style={{ display: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h1>SPAREHUB ENTERPRISE</h1>
                                <p style={{ fontWeight: "bold", fontSize: "14px" }}>
                                    Automotive Spare Parts & Supply Chain Management
                                </p>
                                <p>Report Title: <strong>{currentMeta.title}</strong></p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p>Generated On: <strong>{new Date().toLocaleString()}</strong></p>
                                <p>Filter Window: {filters.startDate || "All"} to {filters.endDate || "All"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Report Header */}
                    <div className="report-section-heading">
                        <div>
                            <span className="supplier-eyebrow">ACTIVE REPORT PREVIEW</span>
                            <h2>{currentMeta.title}</h2>
                            <p>
                                Results compiled from actual database records • Window: {filters.startDate} to {filters.endDate}
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <button
                                type="button"
                                className="report-button export"
                                onClick={handleExportCsv}
                                disabled={exporting || reportRecords.length === 0}
                                title="Download as CSV spreadsheet"
                            >
                                <FileSpreadsheet size={16} />
                                <span>{exporting ? "Exporting..." : "Export Excel/CSV"}</span>
                            </button>

                            <button
                                type="button"
                                className="report-button"
                                onClick={handlePrintPdf}
                                disabled={reportRecords.length === 0}
                                style={{
                                    background: "rgba(56, 189, 248, 0.15)",
                                    borderColor: "rgba(56, 189, 248, 0.35)",
                                    color: "#38bdf8"
                                }}
                                title="Print or save as professional PDF"
                            >
                                <Printer size={16} />
                                <span>Print / Save PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary KPI Strip */}
                    <div className="report-summary-bar" style={{
                        display: "flex",
                        gap: "24px",
                        flexWrap: "wrap",
                        padding: "16px 20px",
                        background: "rgba(0, 0, 0, 0.25)",
                        borderRadius: "12px",
                        margin: "18px 0"
                    }}>
                        <div>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                Matching Records
                            </span>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                                {reportRecords.length}
                            </div>
                        </div>

                        {report.totalAmount !== null && report.totalAmount !== undefined && (
                            <div>
                                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                    Total Value / Procurement Investment
                                </span>
                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary-lime, #B8F34A)" }}>
                                    {formatCurrency(report.totalAmount)}
                                </div>
                            </div>
                        )}

                        <div>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                                Generation Timestamp
                            </span>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                                {report.generatedAt ? new Date(report.generatedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    {/* Records Table or Empty State */}
                    {reportRecords.length === 0 ? (
                        <div className="report-empty-state" style={{ padding: "48px 24px", textAlign: "center" }}>
                            <PackageCheck size={50} color="var(--primary-lime, #B8F34A)" />
                            <h3 style={{ margin: "16px 0 6px" }}>No matching records found</h3>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                                No database records matched the selected date window and filter parameters. Try expanding the date range.
                            </p>
                        </div>
                    ) : (
                        <div className="report-table-wrapper" style={{ overflowX: "auto" }}>
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        {tableColumns.map((col) => (
                                            <th key={col}>{formatHeader(col)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportRecords.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {tableColumns.map((col) => {
                                                const rawVal = row[col];
                                                const formatted = formatCellValue(col, rawVal);

                                                // Colorize status tags
                                                const isStatusCol = col.toLowerCase() === "status" || col.toLowerCase() === "urgency" || col.toLowerCase() === "rating";

                                                return (
                                                    <td key={col}>
                                                        {isStatusCol ? (
                                                            <span style={{
                                                                padding: "3px 8px",
                                                                borderRadius: "999px",
                                                                fontSize: "11px",
                                                                fontWeight: 750,
                                                                background:
                                                                    String(rawVal).includes("ACTIVE") || String(rawVal).includes("RECEIVED") || String(rawVal).includes("COMPLETED") || String(rawVal).includes("EXCELLENT")
                                                                        ? "rgba(52, 211, 153, 0.15)"
                                                                        : String(rawVal).includes("CRITICAL") || String(rawVal).includes("CANCELLED")
                                                                            ? "rgba(239, 68, 68, 0.15)"
                                                                            : String(rawVal).includes("SUSPENDED") || String(rawVal).includes("LOW")
                                                                                ? "rgba(249, 115, 22, 0.15)"
                                                                                : "rgba(56, 189, 248, 0.15)",
                                                                color:
                                                                    String(rawVal).includes("ACTIVE") || String(rawVal).includes("RECEIVED") || String(rawVal).includes("COMPLETED") || String(rawVal).includes("EXCELLENT")
                                                                        ? "#34d399"
                                                                        : String(rawVal).includes("CRITICAL") || String(rawVal).includes("CANCELLED")
                                                                            ? "#f87171"
                                                                            : String(rawVal).includes("SUSPENDED") || String(rawVal).includes("LOW")
                                                                                ? "#f97316"
                                                                                : "#38bdf8",
                                                            }}>
                                                                {formatted}
                                                            </span>
                                                        ) : (
                                                            formatted
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default ManagementReportsPage;