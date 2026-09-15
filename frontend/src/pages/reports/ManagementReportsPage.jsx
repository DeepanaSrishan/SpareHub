import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Boxes,
    ClipboardList,
    CreditCard,
    Download,
    FileBarChart,
    PackageSearch,
    RefreshCw,
    ShoppingCart,
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
    reportType: "SALES",
    startDate: yearStart,
    endDate: today,
    productId: "",
    supplierId: "",
    transactionType: "",
    orderStatus: "",
    paymentStatus: "",
};

const reportTypes = [
    { value: "SALES", label: "Sales Report" },
    { value: "ORDERS", label: "Order Report" },
    {
        value: "INVENTORY",
        label: "Inventory Report",
    },
    {
        value: "SUPPLIERS",
        label: "Supplier Report",
    },
    {
        value: "PAYMENTS",
        label: "Payment Report",
    },
    {
        value: "SUPPLIER_TRANSACTIONS",
        label: "Supplier Transaction Report",
    },
];

function ManagementReportsPage() {
    const [filters, setFilters] =
        useState(initialFilters);

    const [dashboard, setDashboard] =
        useState(null);

    const [report, setReport] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [dashboardLoading, setDashboardLoading] =
        useState(true);

    const [reportLoading, setReportLoading] =
        useState(false);

    const [exporting, setExporting] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadReferenceData = useCallback(async () => {
        try {
            const [supplierData, productData] =
                await Promise.all([
                    getSuppliers(),
                    getActiveSpareParts(),
                ]);

            setSuppliers(supplierData);
            setProducts(productData);
        } catch {
            // Reference dropdown failures should not stop
            // dashboard and report functions.
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
                getErrorMessage(
                    requestError,
                    "Unable to load management dashboard."
                )
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

        const timer = window.setTimeout(
            () => setSuccess(""),
            3500
        );

        return () => window.clearTimeout(timer);
    }, [success]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateDates = () => {
        if (
            filters.startDate &&
            filters.endDate &&
            filters.startDate > filters.endDate
        ) {
            setError(
                "Start date cannot be after end date."
            );

            return false;
        }

        return true;
    };

    const handleGenerateReport = async (event) => {
        event.preventDefault();

        if (!validateDates()) return;

        try {
            setReportLoading(true);
            setError("");

            const data = await generateManagementReport({
                reportType: filters.reportType,
                startDate: filters.startDate || null,
                endDate: filters.endDate || null,
                productId: filters.productId
                    ? Number(filters.productId)
                    : null,
                supplierId: filters.supplierId
                    ? Number(filters.supplierId)
                    : null,
                transactionType:
                    filters.transactionType || null,
                orderStatus:
                    filters.orderStatus || null,
                paymentStatus:
                    filters.paymentStatus || null,
            });

            setReport(data);
            setSuccess(
                "Management report generated successfully."
            );
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to generate report."
                )
            );
        } finally {
            setReportLoading(false);
        }
    };

    const handleExport = async () => {
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
                transactionType:
                filters.transactionType,
                orderStatus: filters.orderStatus,
                paymentStatus: filters.paymentStatus,
            });

            setSuccess(
                "CSV report downloaded successfully."
            );
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to export CSV report."
                )
            );
        } finally {
            setExporting(false);
        }
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setReport(null);
        setError("");
    };

    const reportRecords = useMemo(
        () => report?.records ?? [],
        [report]
    );

    const tableColumns = useMemo(() => {
        if (reportRecords.length === 0) {
            return [];
        }

        return Object.keys(reportRecords[0]);
    }, [reportRecords]);

    const showProductFilter =
        filters.reportType === "INVENTORY" ||
        filters.reportType === "SALES";

    const showSupplierFilter =
        filters.reportType === "SUPPLIERS" ||
        filters.reportType ===
        "SUPPLIER_TRANSACTIONS";

    const showTransactionType =
        filters.reportType ===
        "SUPPLIER_TRANSACTIONS";

    const showOrderStatus =
        filters.reportType === "ORDERS";

    const showPaymentStatus =
        filters.reportType === "PAYMENTS";

    return (
        <main className="management-reports-page">
            <section className="management-hero">
                <div>
                    <span>MANAGEMENT CONTROL CENTER</span>

                    <h1>Dashboard & Reports</h1>

                    <p>
                        Review sales, orders, inventory, payments and
                        supplier activity.
                    </p>
                </div>

                <div className="management-hero-icon">
                    <FileBarChart size={45} />
                </div>
            </section>

            {error && (
                <Message
                    type="error"
                    message={error}
                    onClose={() => setError("")}
                />
            )}

            {success && (
                <Message
                    type="success"
                    message={success}
                    onClose={() => setSuccess("")}
                />
            )}

            <section className="dashboard-date-filter">
                <div>
                    <label>Dashboard Start Date</label>

                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        max={filters.endDate || today}
                        onChange={handleFilterChange}
                    />
                </div>

                <div>
                    <label>Dashboard End Date</label>

                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        min={filters.startDate}
                        max={today}
                        onChange={handleFilterChange}
                    />
                </div>

                <button
                    type="button"
                    className="report-button secondary"
                    onClick={loadDashboard}
                    disabled={dashboardLoading}
                >
                    <RefreshCw
                        size={17}
                        className={
                            dashboardLoading ? "spin" : ""
                        }
                    />
                    Refresh Dashboard
                </button>
            </section>

            {dashboardLoading ? (
                <section className="report-loading-card">
                    <RefreshCw size={36} className="spin" />
                    <h3>Loading dashboard...</h3>
                </section>
            ) : (
                <DashboardSummary dashboard={dashboard} />
            )}

            <section className="report-builder-card">
                <div className="report-section-heading">
                    <div>
                        <h2>Generate Management Report</h2>
                        <p>
                            Select a report type and apply the required
                            filters.
                        </p>
                    </div>

                    <FileBarChart size={28} />
                </div>

                <form
                    className="report-filter-grid"
                    onSubmit={handleGenerateReport}
                >
                    <FilterGroup label="Report Type">
                        <select
                            name="reportType"
                            value={filters.reportType}
                            onChange={handleFilterChange}
                        >
                            {reportTypes.map((type) => (
                                <option
                                    key={type.value}
                                    value={type.value}
                                >
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </FilterGroup>

                    <FilterGroup label="Start Date">
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            max={filters.endDate || today}
                            onChange={handleFilterChange}
                        />
                    </FilterGroup>

                    <FilterGroup label="End Date">
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            min={filters.startDate}
                            max={today}
                            onChange={handleFilterChange}
                        />
                    </FilterGroup>

                    {showProductFilter && (
                        <FilterGroup label="Product">
                            <select
                                name="productId"
                                value={filters.productId}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Products</option>

                                {products.map((product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.partNumber} -{" "}
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </FilterGroup>
                    )}

                    {showSupplierFilter && (
                        <FilterGroup label="Supplier">
                            <select
                                name="supplierId"
                                value={filters.supplierId}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Suppliers
                                </option>

                                {suppliers.map((supplier) => (
                                    <option
                                        key={supplier.id}
                                        value={supplier.id}
                                    >
                                        {supplier.supplierCode} -{" "}
                                        {getSupplierName(supplier)}
                                    </option>
                                ))}
                            </select>
                        </FilterGroup>
                    )}

                    {showTransactionType && (
                        <FilterGroup label="Transaction Type">
                            <select
                                name="transactionType"
                                value={filters.transactionType}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Types</option>
                                <option value="PURCHASE_CREATED">
                                    Purchase Created
                                </option>
                                <option value="PURCHASE_RECEIVED">
                                    Purchase Received
                                </option>
                                <option value="PURCHASE_CANCELLED">
                                    Purchase Cancelled
                                </option>
                                <option value="PRICE_UPDATED">
                                    Price Updated
                                </option>
                                <option value="SUPPLIER_ACTIVATED">
                                    Supplier Activated
                                </option>
                                <option value="SUPPLIER_DEACTIVATED">
                                    Supplier Deactivated
                                </option>
                            </select>
                        </FilterGroup>
                    )}

                    {showOrderStatus && (
                        <FilterGroup label="Order Status">
                            <select
                                name="orderStatus"
                                value={filters.orderStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Statuses
                                </option>
                                <option value="PENDING">
                                    Pending
                                </option>
                                <option value="CONFIRMED">
                                    Confirmed
                                </option>
                                <option value="COMPLETED">
                                    Completed
                                </option>
                                <option value="CANCELLED">
                                    Cancelled
                                </option>
                            </select>
                        </FilterGroup>
                    )}

                    {showPaymentStatus && (
                        <FilterGroup label="Payment Status">
                            <select
                                name="paymentStatus"
                                value={filters.paymentStatus}
                                onChange={handleFilterChange}
                            >
                                <option value="">
                                    All Statuses
                                </option>
                                <option value="PENDING">
                                    Pending
                                </option>
                                <option value="COMPLETED">
                                    Completed
                                </option>
                                <option value="FAILED">
                                    Failed
                                </option>
                                <option value="REFUNDED">
                                    Refunded
                                </option>
                            </select>
                        </FilterGroup>
                    )}

                    <div className="report-filter-actions">
                        <button
                            type="button"
                            className="report-button secondary"
                            onClick={resetFilters}
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            className="report-button primary"
                            disabled={reportLoading}
                        >
                            <FileBarChart size={17} />

                            {reportLoading
                                ? "Generating..."
                                : "Generate Report"}
                        </button>

                        <button
                            type="button"
                            className="report-button export"
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <Download size={17} />

                            {exporting
                                ? "Downloading..."
                                : "Export CSV"}
                        </button>
                    </div>
                </form>
            </section>

            {report && (
                <section className="generated-report-card">
                    <div className="report-section-heading">
                        <div>
                            <h2>
                                {formatLabel(report.reportType)} Report
                            </h2>

                            <p>
                                {report.startDate} to {report.endDate}
                            </p>
                        </div>

                        <div className="report-result-summary">
              <span>
                Records:{" "}
                  <strong>
                  {report.totalRecords ?? 0}
                </strong>
              </span>

                            <span>
                Total:{" "}
                                <strong>
                  {formatCurrency(
                      report.totalAmount
                  )}
                </strong>
              </span>
                        </div>
                    </div>

                    {reportLoading ? (
                        <div className="report-loading-card">
                            <RefreshCw
                                size={32}
                                className="spin"
                            />
                        </div>
                    ) : reportRecords.length === 0 ? (
                        <div className="report-empty-state">
                            <FileBarChart size={43} />
                            <h3>No report records found</h3>
                            <p>
                                Change the selected filters and generate
                                the report again.
                            </p>
                        </div>
                    ) : (
                        <div className="report-table-wrapper">
                            <table className="report-table">
                                <thead>
                                <tr>
                                    {tableColumns.map((column) => (
                                        <th key={column}>
                                            {formatLabel(column)}
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {reportRecords.map(
                                    (record, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {tableColumns.map(
                                                (column) => (
                                                    <td key={column}>
                                                        {formatCellValue(
                                                            column,
                                                            record[column]
                                                        )}
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

function DashboardSummary({ dashboard }) {
    const sales = dashboard?.sales ?? {};
    const orders = dashboard?.orders ?? {};
    const inventory = dashboard?.inventory ?? {};
    const suppliers = dashboard?.suppliers ?? {};
    const payments = dashboard?.payments ?? {};

    return (
        <>
            <section className="management-main-metrics">
                <DashboardMetric
                    title="Net Sales"
                    value={formatCurrency(sales.netSales)}
                    subtitle={`${sales.completedSales ?? 0} completed sales`}
                    icon={<TrendingUp size={24} />}
                    type="green"
                />

                <DashboardMetric
                    title="Total Orders"
                    value={orders.totalOrders ?? 0}
                    subtitle={`${orders.pendingOrders ?? 0} pending orders`}
                    icon={<ShoppingCart size={24} />}
                    type="blue"
                />

                <DashboardMetric
                    title="Products"
                    value={inventory.totalProducts ?? 0}
                    subtitle={`${inventory.lowStockProducts ?? 0} low-stock products`}
                    icon={<Boxes size={24} />}
                    type="amber"
                />

                <DashboardMetric
                    title="Suppliers"
                    value={suppliers.totalSuppliers ?? 0}
                    subtitle={`${suppliers.activeSuppliers ?? 0} active suppliers`}
                    icon={<Truck size={24} />}
                    type="purple"
                />

                <DashboardMetric
                    title="Payments Received"
                    value={formatCurrency(
                        payments.totalReceivedAmount
                    )}
                    subtitle={`${payments.pendingPayments ?? 0} pending payments`}
                    icon={<CreditCard size={24} />}
                    type="green"
                />
            </section>

            <section className="dashboard-breakdown-grid">
                <BreakdownCard
                    title="Sales Summary"
                    icon={<TrendingUp size={21} />}
                    values={[
                        [
                            "Gross Sales",
                            formatCurrency(sales.grossSales),
                        ],
                        [
                            "Discounts",
                            formatCurrency(sales.discounts),
                        ],
                        [
                            "Refunds",
                            formatCurrency(sales.refunds),
                        ],
                        [
                            "Net Sales",
                            formatCurrency(sales.netSales),
                        ],
                    ]}
                />

                <BreakdownCard
                    title="Order Activity"
                    icon={<ClipboardList size={21} />}
                    values={[
                        ["Pending", orders.pendingOrders ?? 0],
                        [
                            "Confirmed",
                            orders.confirmedOrders ?? 0,
                        ],
                        [
                            "Completed",
                            orders.completedOrders ?? 0,
                        ],
                        [
                            "Cancelled",
                            orders.cancelledOrders ?? 0,
                        ],
                    ]}
                />

                <BreakdownCard
                    title="Inventory Status"
                    icon={<PackageSearch size={21} />}
                    values={[
                        [
                            "Active Products",
                            inventory.activeProducts ?? 0,
                        ],
                        [
                            "Inactive Products",
                            inventory.inactiveProducts ?? 0,
                        ],
                        [
                            "Low Stock",
                            inventory.lowStockProducts ?? 0,
                        ],
                        [
                            "Out of Stock",
                            inventory.outOfStockProducts ?? 0,
                        ],
                    ]}
                />

                <BreakdownCard
                    title="Supplier Purchases"
                    icon={<Truck size={21} />}
                    values={[
                        [
                            "Active Suppliers",
                            suppliers.activeSuppliers ?? 0,
                        ],
                        [
                            "Pending Purchases",
                            suppliers.pendingPurchases ?? 0,
                        ],
                        [
                            "Received Purchases",
                            suppliers.receivedPurchases ?? 0,
                        ],
                        [
                            "Cancelled Purchases",
                            suppliers.cancelledPurchases ?? 0,
                        ],
                    ]}
                />
            </section>
        </>
    );
}

function DashboardMetric({
                             title,
                             value,
                             subtitle,
                             icon,
                             type,
                         }) {
    return (
        <article
            className={`management-metric-card ${type}`}
        >
            <div className="management-metric-icon">
                {icon}
            </div>

            <div>
                <span>{title}</span>
                <strong>{value}</strong>
                <small>{subtitle}</small>
            </div>
        </article>
    );
}

function BreakdownCard({
                           title,
                           icon,
                           values,
                       }) {
    return (
        <article className="breakdown-card">
            <div className="breakdown-card-heading">
                {icon}
                <h3>{title}</h3>
            </div>

            <div className="breakdown-list">
                {values.map(([label, value]) => (
                    <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>
        </article>
    );
}

function FilterGroup({ label, children }) {
    return (
        <div className="report-filter-group">
            <label>{label}</label>
            {children}
        </div>
    );
}

function Message({ type, message, onClose }) {
    return (
        <div className={`report-alert ${type}`}>
            <span>{message}</span>

            <button type="button" onClick={onClose}>
                <X size={17} />
            </button>
        </div>
    );
}

function getSupplierName(supplier) {
    return (
        supplier?.name ||
        supplier?.supplierName ||
        supplier?.contactPerson ||
        "Supplier"
    );
}

function getErrorMessage(error, fallback) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        fallback
    );
}

function formatLabel(value) {
    if (!value) return "Unknown";

    return value
        .toString()
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatCellValue(column, value) {
    if (value === null || value === undefined) {
        return "—";
    }

    const lowerColumn = column.toLowerCase();

    if (
        lowerColumn.includes("amount") ||
        lowerColumn.includes("price") ||
        lowerColumn.includes("value") ||
        lowerColumn.includes("subtotal") ||
        lowerColumn.includes("discount")
    ) {
        return formatCurrency(value);
    }

    if (
        lowerColumn.includes("date") ||
        lowerColumn.includes("createdat") ||
        lowerColumn.includes("paidat")
    ) {
        const date = new Date(value);

        if (!Number.isNaN(date.getTime())) {
            return new Intl.DateTimeFormat("en-LK", {
                year: "numeric",
                month: "short",
                day: "2-digit",
            }).format(date);
        }
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);
}

export default ManagementReportsPage;
