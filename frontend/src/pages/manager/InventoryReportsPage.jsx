import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Boxes,
    ChartColumn,
    CircleDollarSign,
    History,
    PackageCheck,
    PackageX,
    RefreshCw,
    Search,
    TrendingUp,
    Warehouse,
} from "lucide-react";

import inventoryReportService from "../../services/inventoryReportService";
import inventoryService from "../../services/inventoryService";
import "../../styles/inventoryReports.css";

const formatLocalDate = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const today = new Date();

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 29
);

const initialDateFilters = {
    fromDate: formatLocalDate(thirtyDaysAgo),
    toDate: formatLocalDate(today),
};

const transactionTypes = [
    "INITIAL_STOCK",
    "STOCK_IN",
    "DAMAGED",
    "MISSING",
    "CORRECTION_INCREASE",
    "CORRECTION_DECREASE",
    "SALE",
    "SALE_REVERSAL",
];

export default function InventoryReportsPage() {
    const [activeTab, setActiveTab] =
        useState("summary");

    const [summary, setSummary] = useState(null);
    const [movement, setMovement] =
        useState(null);
    const [stockRows, setStockRows] =
        useState([]);
    const [transactions, setTransactions] =
        useState([]);
    const [categories, setCategories] =
        useState([]);

    const [dateFilters, setDateFilters] =
        useState(initialDateFilters);

    const [appliedDateFilters, setAppliedDateFilters] =
        useState(initialDateFilters);

    const [stockFilters, setStockFilters] =
        useState({
            search: "",
            status: "",
            categoryId: "",
            lowStock: "",
            available: "",
            sortBy: "name",
            direction: "asc",
        });

    const [appliedStockFilters, setAppliedStockFilters] =
        useState(stockFilters);

    const [
        transactionFilters,
        setTransactionFilters,
    ] = useState({
        sparePartId: "",
        type: "",
        ...initialDateFilters,
    });

    const [
        appliedTransactionFilters,
        setAppliedTransactionFilters,
    ] = useState(transactionFilters);

    const [stockPage, setStockPage] =
        useState(0);
    const [stockTotalPages, setStockTotalPages] =
        useState(0);
    const [stockTotalElements, setStockTotalElements] =
        useState(0);

    const [
        transactionPage,
        setTransactionPage,
    ] = useState(0);

    const [
        transactionTotalPages,
        setTransactionTotalPages,
    ] = useState(0);

    const [
        transactionTotalElements,
        setTransactionTotalElements,
    ] = useState(0);

    const [loading, setLoading] =
        useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        initializeDashboard();
    }, []);

    useEffect(() => {
        if (activeTab === "stock") {
            loadStockReport();
        }
    }, [
        activeTab,
        appliedStockFilters,
        stockPage,
    ]);

    useEffect(() => {
        if (activeTab === "movements") {
            loadMovementSummary();
        }
    }, [
        activeTab,
        appliedDateFilters,
    ]);

    useEffect(() => {
        if (activeTab === "transactions") {
            loadTransactions();
        }
    }, [
        activeTab,
        appliedTransactionFilters,
        transactionPage,
    ]);

    const initializeDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [summaryData, categoryData] =
                await Promise.all([
                    inventoryReportService.getSummary(),

                    inventoryService.getCategories({
                        page: 0,
                        size: 100,
                    }),
                ]);

            setSummary(summaryData);

            setCategories(
                Array.isArray(categoryData)
                    ? categoryData
                    : categoryData?.content ?? []
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const loadStockReport = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryReportService
                    .getStockReport({
                        ...appliedStockFilters,
                        page: stockPage,
                        size: 20,
                    });

            if (Array.isArray(data)) {
                setStockRows(data);
                setStockTotalElements(data.length);
                setStockTotalPages(
                    data.length ? 1 : 0
                );
            } else {
                setStockRows(data?.content ?? []);
                setStockTotalElements(
                    data?.totalElements ?? 0
                );
                setStockTotalPages(
                    data?.totalPages ?? 0
                );
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const loadMovementSummary = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryReportService
                    .getMovementSummary(
                        appliedDateFilters
                    );

            setMovement(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryReportService
                    .getTransactions({
                        ...appliedTransactionFilters,
                        page: transactionPage,
                        size: 20,
                    });

            if (Array.isArray(data)) {
                setTransactions(data);
                setTransactionTotalElements(
                    data.length
                );
                setTransactionTotalPages(
                    data.length ? 1 : 0
                );
            } else {
                setTransactions(
                    data?.content ?? []
                );
                setTransactionTotalElements(
                    data?.totalElements ?? 0
                );
                setTransactionTotalPages(
                    data?.totalPages ?? 0
                );
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (err) =>
        err.response?.data?.message ||
        "Inventory report load කිරීම අසාර්ථකයි.";

    const formatMoney = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 2,
        }).format(value ?? 0);

    const formatDateTime = (value) =>
        value
            ? new Date(value).toLocaleString()
            : "—";

    const validateDates = (filters) => {
        if (
            filters.fromDate &&
            filters.toDate &&
            filters.fromDate > filters.toDate
        ) {
            setError(
                "From date එක To date එකට පසුව වෙන්න බැහැ."
            );

            return false;
        }

        return true;
    };

    const handleStockFilterChange = (
        event
    ) => {
        const { name, value } = event.target;

        setStockFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const applyStockFilters = (event) => {
        event.preventDefault();

        setError("");
        setStockPage(0);
        setAppliedStockFilters(stockFilters);
    };

    const resetStockFilters = () => {
        const emptyFilters = {
            search: "",
            status: "",
            categoryId: "",
            lowStock: "",
            available: "",
            sortBy: "name",
            direction: "asc",
        };

        setStockFilters(emptyFilters);
        setAppliedStockFilters(emptyFilters);
        setStockPage(0);
    };

    const applyMovementDates = (event) => {
        event.preventDefault();

        if (!validateDates(dateFilters)) {
            return;
        }

        setError("");
        setAppliedDateFilters(dateFilters);
    };

    const applyTransactionFilters = (
        event
    ) => {
        event.preventDefault();

        if (
            !validateDates(transactionFilters)
        ) {
            return;
        }

        setError("");
        setTransactionPage(0);

        setAppliedTransactionFilters(
            transactionFilters
        );
    };

    const refreshCurrentTab = () => {
        if (activeTab === "summary") {
            initializeDashboard();
        } else if (activeTab === "stock") {
            loadStockReport();
        } else if (activeTab === "movements") {
            loadMovementSummary();
        } else {
            loadTransactions();
        }
    };

    return (
        <main className="report-page">
            <div className="report-heading">
                <div>
                    <h1>Inventory Reports</h1>
                    <p>
                        Monitor stock availability, value and
                        inventory movements.
                    </p>
                </div>

                <button
                    type="button"
                    className="report-secondary-button"
                    onClick={refreshCurrentTab}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading ? "report-spinning" : ""
                        }
                    />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="report-alert-error">
                    {error}
                </div>
            )}

            <nav className="report-tabs">
                <button
                    className={
                        activeTab === "summary"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("summary")
                    }
                >
                    <ChartColumn size={17} />
                    Summary
                </button>

                <button
                    className={
                        activeTab === "stock"
                            ? "active"
                            : ""
                    }
                    onClick={() => setActiveTab("stock")}
                >
                    <Warehouse size={17} />
                    Stock Report
                </button>

                <button
                    className={
                        activeTab === "movements"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("movements")
                    }
                >
                    <TrendingUp size={17} />
                    Movements
                </button>

                <button
                    className={
                        activeTab === "transactions"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("transactions")
                    }
                >
                    <History size={17} />
                    Transactions
                </button>
            </nav>

            {loading && (
                <div className="report-loading">
                    Loading report...
                </div>
            )}

            {!loading &&
                activeTab === "summary" && (
                    <SummarySection
                        summary={summary}
                        formatMoney={formatMoney}
                    />
                )}

            {!loading && activeTab === "stock" && (
                <StockReportSection
                    rows={stockRows}
                    filters={stockFilters}
                    categories={categories}
                    totalElements={stockTotalElements}
                    page={stockPage}
                    totalPages={stockTotalPages}
                    onChange={handleStockFilterChange}
                    onSubmit={applyStockFilters}
                    onReset={resetStockFilters}
                    onPrevious={() =>
                        setStockPage(
                            (current) => current - 1
                        )
                    }
                    onNext={() =>
                        setStockPage(
                            (current) => current + 1
                        )
                    }
                    formatMoney={formatMoney}
                />
            )}

            {!loading &&
                activeTab === "movements" && (
                    <MovementSection
                        movement={movement}
                        filters={dateFilters}
                        setFilters={setDateFilters}
                        onSubmit={applyMovementDates}
                    />
                )}

            {!loading &&
                activeTab === "transactions" && (
                    <TransactionSection
                        transactions={transactions}
                        filters={transactionFilters}
                        setFilters={
                            setTransactionFilters
                        }
                        totalElements={
                            transactionTotalElements
                        }
                        page={transactionPage}
                        totalPages={
                            transactionTotalPages
                        }
                        onSubmit={
                            applyTransactionFilters
                        }
                        onPrevious={() =>
                            setTransactionPage(
                                (current) => current - 1
                            )
                        }
                        onNext={() =>
                            setTransactionPage(
                                (current) => current + 1
                            )
                        }
                        formatDateTime={formatDateTime}
                    />
                )}
        </main>
    );
}

function SummarySection({
                            summary,
                            formatMoney,
                        }) {
    if (!summary) {
        return (
            <div className="report-empty">
                No summary information available.
            </div>
        );
    }

    return (
        <>
            <section className="report-summary-grid">
                <ReportCard
                    icon={<Boxes />}
                    label="Total Products"
                    value={summary.totalProducts}
                />

                <ReportCard
                    icon={<PackageCheck />}
                    label="Active Products"
                    value={summary.activeProducts}
                    type="success"
                />

                <ReportCard
                    icon={<AlertTriangle />}
                    label="Low Stock"
                    value={summary.lowStockProducts}
                    type="warning"
                />

                <ReportCard
                    icon={<PackageX />}
                    label="Out of Stock"
                    value={summary.outOfStockProducts}
                    type="danger"
                />

                <ReportCard
                    icon={<Warehouse />}
                    label="Total Units"
                    value={summary.totalStockQuantity}
                />

                <ReportCard
                    icon={<CircleDollarSign />}
                    label="Cost Value"
                    value={formatMoney(
                        summary.totalCostValue
                    )}
                />

                <ReportCard
                    icon={<CircleDollarSign />}
                    label="Selling Value"
                    value={formatMoney(
                        summary.totalSellingValue
                    )}
                />

                <ReportCard
                    icon={<TrendingUp />}
                    label="Potential Profit"
                    value={formatMoney(
                        summary.potentialProfitValue
                    )}
                    type="success"
                />
            </section>

            <section className="report-card">
                <div className="report-card-heading">
                    <h2>Product Status Summary</h2>
                    <span>
            {summary.totalCategories} categories
          </span>
                </div>

                <div className="report-status-summary">
                    <div>
                        <span>Active</span>
                        <strong>
                            {summary.activeProducts}
                        </strong>
                    </div>

                    <div>
                        <span>Inactive</span>
                        <strong>
                            {summary.inactiveProducts}
                        </strong>
                    </div>

                    <div>
                        <span>Discontinued</span>
                        <strong>
                            {summary.discontinuedProducts}
                        </strong>
                    </div>
                </div>
            </section>

            <section className="report-card">
                <div className="report-card-heading">
                    <h2>Category-wise Inventory</h2>
                </div>

                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                        <tr>
                            <th>Category</th>
                            <th>Products</th>
                            <th>Active</th>
                            <th>Stock Units</th>
                            <th>Low Stock</th>
                            <th>Out of Stock</th>
                            <th>Cost Value</th>
                            <th>Selling Value</th>
                        </tr>
                        </thead>

                        <tbody>
                        {(
                            summary.categorySummaries ?? []
                        ).map((category) => (
                            <tr key={category.categoryId}>
                                <td>
                                    <strong>
                                        {category.categoryName}
                                    </strong>
                                </td>
                                <td>
                                    {category.totalProducts}
                                </td>
                                <td>
                                    {category.activeProducts}
                                </td>
                                <td>
                                    {
                                        category.totalStockQuantity
                                    }
                                </td>
                                <td>
                    <span className="report-warning-text">
                      {
                          category.lowStockProducts
                      }
                    </span>
                                </td>
                                <td>
                    <span className="report-danger-text">
                      {
                          category.outOfStockProducts
                      }
                    </span>
                                </td>
                                <td>
                                    {formatMoney(
                                        category.totalCostValue
                                    )}
                                </td>
                                <td>
                                    {formatMoney(
                                        category.totalSellingValue
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}

function ReportCard({
                        icon,
                        label,
                        value,
                        type = "",
                    }) {
    return (
        <article
            className={`report-summary-card ${type}`}
        >
            <div className="report-summary-icon">
                {icon}
            </div>

            <span>{label}</span>
            <strong>{value ?? 0}</strong>
        </article>
    );
}

function StockReportSection({
                                rows,
                                filters,
                                categories,
                                totalElements,
                                page,
                                totalPages,
                                onChange,
                                onSubmit,
                                onReset,
                                onPrevious,
                                onNext,
                                formatMoney,
                            }) {
    return (
        <>
            <section className="report-filter-card">
                <form
                    className="report-stock-filters"
                    onSubmit={onSubmit}
                >
                    <div className="report-search-field">
                        <Search size={17} />

                        <input
                            name="search"
                            value={filters.search}
                            onChange={onChange}
                            placeholder="Name, part number or brand..."
                        />
                    </div>

                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={onChange}
                    >
                        <option value="">
                            All Categories
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={onChange}
                    >
                        <option value="">
                            All Statuses
                        </option>
                        <option value="ACTIVE">
                            Active
                        </option>
                        <option value="INACTIVE">
                            Inactive
                        </option>
                        <option value="DISCONTINUED">
                            Discontinued
                        </option>
                    </select>

                    <select
                        name="lowStock"
                        value={filters.lowStock}
                        onChange={onChange}
                    >
                        <option value="">
                            All Stock Levels
                        </option>
                        <option value="true">
                            Low Stock
                        </option>
                        <option value="false">
                            Sufficient Stock
                        </option>
                    </select>

                    <select
                        name="available"
                        value={filters.available}
                        onChange={onChange}
                    >
                        <option value="">
                            All Availability
                        </option>
                        <option value="true">
                            Available
                        </option>
                        <option value="false">
                            Unavailable
                        </option>
                    </select>

                    <select
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={onChange}
                    >
                        <option value="name">Name</option>
                        <option value="stockQuantity">
                            Stock Quantity
                        </option>
                        <option value="costPrice">
                            Cost Price
                        </option>
                        <option value="sellingPrice">
                            Selling Price
                        </option>
                    </select>

                    <select
                        name="direction"
                        value={filters.direction}
                        onChange={onChange}
                    >
                        <option value="asc">
                            Ascending
                        </option>
                        <option value="desc">
                            Descending
                        </option>
                    </select>

                    <button
                        className="report-primary-button"
                        type="submit"
                    >
                        Apply
                    </button>

                    <button
                        className="report-secondary-button"
                        type="button"
                        onClick={onReset}
                    >
                        Reset
                    </button>
                </form>
            </section>

            <section className="report-card">
                <div className="report-card-heading">
                    <h2>Detailed Stock Report</h2>
                    <span>{totalElements} record(s)</span>
                </div>

                {rows.length === 0 ? (
                    <div className="report-empty">
                        No stock records found.
                    </div>
                ) : (
                    <div className="report-table-wrapper">
                        <table className="report-table">
                            <thead>
                            <tr>
                                <th>Part</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Stock</th>
                                <th>Reorder</th>
                                <th>Cost Price</th>
                                <th>Selling Price</th>
                                <th>Cost Value</th>
                                <th>Selling Value</th>
                                <th>Potential Profit</th>
                            </tr>
                            </thead>

                            <tbody>
                            {rows.map((row) => (
                                <tr key={row.sparePartId}>
                                    <td>
                                        <strong>{row.name}</strong>
                                        <small>
                                            {row.partNumber} ·{" "}
                                            {row.brand}
                                        </small>
                                    </td>

                                    <td>{row.categoryName}</td>

                                    <td>
                      <span
                          className={`report-status ${row.status?.toLowerCase()}`}
                      >
                        {row.status}
                      </span>
                                    </td>

                                    <td>
                      <span
                          className={
                              row.lowStock
                                  ? "report-warning-text"
                                  : ""
                          }
                      >
                        {row.stockQuantity}
                      </span>
                                    </td>

                                    <td>{row.reorderLevel}</td>
                                    <td>
                                        {formatMoney(row.costPrice)}
                                    </td>
                                    <td>
                                        {formatMoney(
                                            row.sellingPrice
                                        )}
                                    </td>
                                    <td>
                                        {formatMoney(
                                            row.stockCostValue
                                        )}
                                    </td>
                                    <td>
                                        {formatMoney(
                                            row.stockSellingValue
                                        )}
                                    </td>
                                    <td className="report-success-text">
                                        {formatMoney(
                                            row.potentialProfitValue
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrevious={onPrevious}
                    onNext={onNext}
                />
            </section>
        </>
    );
}

function MovementSection({
                             movement,
                             filters,
                             setFilters,
                             onSubmit,
                         }) {
    return (
        <>
            <section className="report-filter-card">
                <form
                    className="report-date-form"
                    onSubmit={onSubmit}
                >
                    <label>
                        From Date
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    fromDate:
                                    event.target.value,
                                }))
                            }
                        />
                    </label>

                    <label>
                        To Date
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    toDate: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <button
                        className="report-primary-button"
                        type="submit"
                    >
                        Generate Movement Report
                    </button>
                </form>
            </section>

            {!movement ? (
                <div className="report-empty">
                    Select dates and generate the report.
                </div>
            ) : (
                <>
                    <section className="report-summary-grid movement">
                        <ReportCard
                            icon={<History />}
                            label="Transactions"
                            value={
                                movement.totalTransactions
                            }
                        />

                        <ReportCard
                            icon={<ArrowUp />}
                            label="Total Stock In"
                            value={movement.totalStockIn}
                            type="success"
                        />

                        <ReportCard
                            icon={<ArrowDown />}
                            label="Total Stock Out"
                            value={movement.totalStockOut}
                            type="danger"
                        />

                        <ReportCard
                            icon={<TrendingUp />}
                            label="Net Movement"
                            value={
                                movement.netStockMovement > 0
                                    ? `+${movement.netStockMovement}`
                                    : movement.netStockMovement
                            }
                        />
                    </section>

                    <section className="report-card">
                        <div className="report-card-heading">
                            <h2>Movement by Type</h2>

                            <span>
                {movement.fromDate} –{" "}
                                {movement.toDate}
              </span>
                        </div>

                        <div className="report-movement-list">
                            {(
                                movement.movementByType ?? []
                            ).map((item) => (
                                <div
                                    className="report-movement-row"
                                    key={item.transactionType}
                                >
                  <span>
                    {item.transactionType}
                  </span>

                                    <div className="report-movement-values">
                                        <small>
                                            {item.transactionCount}{" "}
                                            transaction(s)
                                        </small>

                                        <strong
                                            className={
                                                item.totalQuantityChanged >=
                                                0
                                                    ? "report-success-text"
                                                    : "report-danger-text"
                                            }
                                        >
                                            {item.totalQuantityChanged >
                                            0
                                                ? "+"
                                                : ""}
                                            {
                                                item.totalQuantityChanged
                                            }
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </>
    );
}

function TransactionSection({
                                transactions,
                                filters,
                                setFilters,
                                totalElements,
                                page,
                                totalPages,
                                onSubmit,
                                onPrevious,
                                onNext,
                                formatDateTime,
                            }) {
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    return (
        <>
            <section className="report-filter-card">
                <form
                    className="report-transaction-filters"
                    onSubmit={onSubmit}
                >
                    <input
                        type="number"
                        min="1"
                        name="sparePartId"
                        value={filters.sparePartId}
                        onChange={handleChange}
                        placeholder="Spare-part ID"
                    />

                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleChange}
                    >
                        <option value="">
                            All Transaction Types
                        </option>

                        {transactionTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        name="fromDate"
                        value={filters.fromDate}
                        onChange={handleChange}
                    />

                    <input
                        type="date"
                        name="toDate"
                        value={filters.toDate}
                        onChange={handleChange}
                    />

                    <button
                        className="report-primary-button"
                        type="submit"
                    >
                        Apply Filters
                    </button>
                </form>
            </section>

            <section className="report-card">
                <div className="report-card-heading">
                    <h2>Inventory Transactions</h2>
                    <span>{totalElements} record(s)</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="report-empty">
                        No transactions found.
                    </div>
                ) : (
                    <div className="report-table-wrapper">
                        <table className="report-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Part</th>
                                <th>Type</th>
                                <th>Change</th>
                                <th>Before</th>
                                <th>After</th>
                                <th>Reason</th>
                                <th>Reference</th>
                                <th>Performed By</th>
                            </tr>
                            </thead>

                            <tbody>
                            {transactions.map(
                                (transaction) => (
                                    <tr key={transaction.id}>
                                        <td>
                                            {formatDateTime(
                                                transaction.createdAt
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    transaction.sparePartName
                                                }
                                            </strong>
                                            <small>
                                                {transaction.partNumber}
                                            </small>
                                        </td>

                                        <td>
                        <span className="report-transaction-type">
                          {
                              transaction.transactionType
                          }
                        </span>
                                        </td>

                                        <td>
                                            <strong
                                                className={
                                                    transaction.quantityChange >=
                                                    0
                                                        ? "report-success-text"
                                                        : "report-danger-text"
                                                }
                                            >
                                                {transaction.quantityChange >
                                                0
                                                    ? "+"
                                                    : ""}
                                                {
                                                    transaction.quantityChange
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                transaction.quantityBefore
                                            }
                                        </td>

                                        <td>
                                            {
                                                transaction.quantityAfter
                                            }
                                        </td>

                                        <td>
                                            {transaction.reason}
                                        </td>

                                        <td>
                                            {transaction.referenceNumber ||
                                                "—"}
                                        </td>

                                        <td>
                                            {
                                                transaction.performedByEmail
                                            }
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrevious={onPrevious}
                    onNext={onNext}
                />
            </section>
        </>
    );
}

function Pagination({
                        page,
                        totalPages,
                        onPrevious,
                        onNext,
                    }) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="report-pagination">
            <button
                disabled={page === 0}
                onClick={onPrevious}
            >
                Previous
            </button>

            <span>
        Page {page + 1} of {totalPages}
      </span>

            <button
                disabled={page + 1 >= totalPages}
                onClick={onNext}
            >
                Next
            </button>
        </div>
    );
}