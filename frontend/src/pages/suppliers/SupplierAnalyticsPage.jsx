import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
    Activity,
    Award,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Medal,
    RefreshCw,
    Search,
    Star,
    TrendingUp,
    Truck,
    X,
    XCircle,
} from "lucide-react";

import { getSuppliers } from "../../api/supplierApi";

import {
    getSupplierPerformance,
    getSupplierPerformanceRanking,
    getSupplierTransactions,
} from "../../api/supplierAnalyticsApi";

import "../../styles/SuppliersPage.css";

const today = new Date().toISOString().split("T")[0];

const oneYearAgo = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split("T")[0];
})();

const transactionTypes = [
    "PURCHASE_CREATED",
    "PURCHASE_RECEIVED",
    "PURCHASE_CANCELLED",
    "PRICE_UPDATED",
    "SUPPLIER_ACTIVATED",
    "SUPPLIER_DEACTIVATED",
];

function SupplierAnalyticsPage() {
    const [searchParams] = useSearchParams();

    const requestedSupplierId =
        searchParams.get("supplierId");

    const [suppliers, setSuppliers] = useState([]);
    const [supplierId, setSupplierId] = useState("");

    const [startDate, setStartDate] =
        useState(oneYearAgo);
    const [endDate, setEndDate] = useState(today);
    const [transactionType, setTransactionType] =
        useState("");

    const [performance, setPerformance] =
        useState(null);
    const [transactions, setTransactions] =
        useState([]);
    const [ranking, setRanking] = useState([]);

    const [search, setSearch] = useState("");
    const [loadingSuppliers, setLoadingSuppliers] =
        useState(true);
    const [loadingDetails, setLoadingDetails] =
        useState(false);
    const [loadingRanking, setLoadingRanking] =
        useState(true);

    const [error, setError] = useState("");

    const loadSuppliers = useCallback(async () => {
        try {
            setLoadingSuppliers(true);
            setError("");

            const data = await getSuppliers();
            setSuppliers(data);

            if (data.length > 0) {
                const supplierExists = data.some(
                    (supplier) =>
                        String(supplier.id) ===
                        String(requestedSupplierId)
                );

                setSupplierId(
                    supplierExists
                        ? String(requestedSupplierId)
                        : String(data[0].id)
                );
            } else {
                setSupplierId("");
            }
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to load suppliers."
                )
            );
        } finally {
            setLoadingSuppliers(false);
        }
    }, [requestedSupplierId]);

    const loadRanking = useCallback(async () => {
        try {
            setLoadingRanking(true);

            const data =
                await getSupplierPerformanceRanking({
                    startDate,
                    endDate,
                });

            setRanking(data);
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to load supplier ranking."
                )
            );
        } finally {
            setLoadingRanking(false);
        }
    }, [startDate, endDate]);

    const loadSupplierDetails =
        useCallback(async () => {
            if (!supplierId) {
                setPerformance(null);
                setTransactions([]);
                return;
            }

            if (
                startDate &&
                endDate &&
                startDate > endDate
            ) {
                setError(
                    "Start date cannot be after end date."
                );
                return;
            }

            try {
                setLoadingDetails(true);
                setError("");

                const [performanceData, transactionData] =
                    await Promise.all([
                        getSupplierPerformance(supplierId, {
                            startDate,
                            endDate,
                        }),

                        getSupplierTransactions(supplierId, {
                            startDate,
                            endDate,
                            type: transactionType,
                        }),
                    ]);

                setPerformance(performanceData);
                setTransactions(transactionData);
            } catch (requestError) {
                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to load supplier analytics."
                    )
                );
            } finally {
                setLoadingDetails(false);
            }
        }, [
            supplierId,
            startDate,
            endDate,
            transactionType,
        ]);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    useEffect(() => {
        loadRanking();
    }, [loadRanking]);

    useEffect(() => {
        loadSupplierDetails();
    }, [loadSupplierDetails]);

    const filteredTransactions = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return transactions;

        return transactions.filter((transaction) =>
            [
                transaction.referenceNumber,
                transaction.transactionType,
                transaction.description,
                transaction.purchaseNumber,
                transaction.recordedBy,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }, [transactions, search]);

    const selectedSupplier = suppliers.find(
        (supplier) =>
            String(supplier.id) === String(supplierId)
    );

    const resetFilters = () => {
        setStartDate(oneYearAgo);
        setEndDate(today);
        setTransactionType("");
        setSearch("");
    };

    return (
        <main className="suppliers-page">
            <section className="supplier-hero">
                <div>
          <span className="supplier-eyebrow">
            SUPPLIER ANALYTICS
          </span>

                    <h1>Performance & Transactions</h1>

                    <p>
                        Evaluate supplier reliability, delivery
                        performance and transaction activity.
                    </p>
                </div>

                <div className="supplier-hero-icon">
                    <TrendingUp size={43} />
                </div>
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

            <section className="supplier-content-card analytics-filter-card">
                <div className="analytics-filter-grid">
                    <div className="supplier-form-group">
                        <label>Supplier</label>

                        <select
                            value={supplierId}
                            onChange={(event) =>
                                setSupplierId(event.target.value)
                            }
                            disabled={loadingSuppliers}
                        >
                            <option value="">
                                Select supplier
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
                    </div>

                    <div className="supplier-form-group">
                        <label>Start Date</label>

                        <input
                            type="date"
                            value={startDate}
                            max={endDate || today}
                            onChange={(event) =>
                                setStartDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="supplier-form-group">
                        <label>End Date</label>

                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={today}
                            onChange={(event) =>
                                setEndDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="supplier-form-group">
                        <label>Transaction Type</label>

                        <select
                            value={transactionType}
                            onChange={(event) =>
                                setTransactionType(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">All Types</option>

                            {transactionTypes.map((type) => (
                                <option key={type} value={type}>
                                    {formatLabel(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="analytics-filter-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={resetFilters}
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="supplier-button primary"
                            onClick={() => {
                                loadSupplierDetails();
                                loadRanking();
                            }}
                            disabled={loadingDetails}
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loadingDetails ? "spin" : ""
                                }
                            />
                            Apply Filters
                        </button>
                    </div>
                </div>
            </section>

            {loadingDetails ? (
                <div className="supplier-content-card supplier-empty-state">
                    <RefreshCw size={36} className="spin" />
                    <h3>Loading supplier analytics...</h3>
                </div>
            ) : !supplierId ? (
                <div className="supplier-content-card supplier-empty-state">
                    <Truck size={42} />
                    <h3>Select a supplier</h3>
                    <p>
                        Select a supplier to view performance and
                        transactions.
                    </p>
                </div>
            ) : (
                <>
                    <section className="analytics-heading">
                        <div>
                            <h2>
                                {getSupplierName(selectedSupplier)}
                            </h2>

                            <p>
                                {selectedSupplier?.supplierCode} ·{" "}
                                {selectedSupplier?.companyName}
                            </p>
                        </div>

                        <PerformanceRating
                            rating={performance?.performanceRating}
                            score={performance?.performanceScore}
                        />
                    </section>

                    <section className="analytics-metric-grid">
                        <MetricCard
                            title="Purchase Orders"
                            value={
                                performance?.totalPurchaseOrders ?? 0
                            }
                            icon={<Activity size={21} />}
                        />

                        <MetricCard
                            title="Received Orders"
                            value={performance?.receivedOrders ?? 0}
                            icon={<CheckCircle2 size={21} />}
                            type="green"
                        />

                        <MetricCard
                            title="Pending Orders"
                            value={performance?.pendingOrders ?? 0}
                            icon={<Clock3 size={21} />}
                            type="amber"
                        />

                        <MetricCard
                            title="Cancelled Orders"
                            value={performance?.cancelledOrders ?? 0}
                            icon={<XCircle size={21} />}
                            type="red"
                        />

                        <MetricCard
                            title="On-Time Rate"
                            value={formatPercentage(
                                performance?.onTimeDeliveryRate
                            )}
                            icon={<Truck size={21} />}
                            type="green"
                        />

                        <MetricCard
                            title="Completion Rate"
                            value={formatPercentage(
                                performance?.completionRate
                            )}
                            icon={<TrendingUp size={21} />}
                        />

                        <MetricCard
                            title="Cancellation Rate"
                            value={formatPercentage(
                                performance?.cancellationRate
                            )}
                            icon={<XCircle size={21} />}
                            type="red"
                        />

                        <MetricCard
                            title="Average Delivery"
                            value={`${Number(
                                performance?.averageDeliveryDays ?? 0
                            ).toFixed(2)} days`}
                            icon={<CalendarDays size={21} />}
                        />
                    </section>

                    <section className="analytics-detail-grid">
                        <article className="analytics-detail-card">
                            <span>On-Time Deliveries</span>
                            <strong>
                                {performance?.onTimeDeliveries ?? 0}
                            </strong>
                        </article>

                        <article className="analytics-detail-card">
                            <span>Late Deliveries</span>
                            <strong>
                                {performance?.lateDeliveries ?? 0}
                            </strong>
                        </article>

                        <article className="analytics-detail-card">
                            <span>Supplied Products</span>
                            <strong>
                                {performance?.suppliedProductCount ?? 0}
                            </strong>
                        </article>

                        <article className="analytics-detail-card">
                            <span>Preferred Products</span>
                            <strong>
                                {performance?.preferredProductCount ?? 0}
                            </strong>
                        </article>

                        <article className="analytics-detail-card total-value">
                            <span>Total Received Purchase Value</span>
                            <strong>
                                {formatCurrency(
                                    performance
                                        ?.totalReceivedPurchaseValue
                                )}
                            </strong>
                        </article>
                    </section>
                </>
            )}

            <section className="supplier-content-card analytics-section">
                <div className="analytics-section-header">
                    <div>
                        <h2>Transaction History</h2>
                        <p>
                            Supplier purchases, receipts, cancellations
                            and pricing activity.
                        </p>
                    </div>

                    <div className="supplier-search-input">
                        <Search size={18} />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search reference or description..."
                        />
                    </div>
                </div>

                {loadingDetails ? (
                    <div className="supplier-empty-state">
                        <RefreshCw size={32} className="spin" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="supplier-empty-state">
                        <Activity size={42} />
                        <h3>No transactions found</h3>
                        <p>
                            No supplier activity matches the selected
                            filters.
                        </p>
                    </div>
                ) : (
                    <div className="supplier-table-wrapper">
                        <table className="supplier-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Reference</th>
                                <th>Quantity</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Recorded By</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredTransactions.map(
                                (transaction) => (
                                    <tr key={transaction.id}>
                                        <td>
                                            {formatDateTime(
                                                transaction.createdAt
                                            )}
                                        </td>

                                        <td>
                                            <TransactionBadge
                                                type={
                                                    transaction.transactionType
                                                }
                                            />
                                        </td>

                                        <td>
                        <span className="supplier-code">
                          {transaction.referenceNumber ||
                              transaction.purchaseNumber ||
                              "—"}
                        </span>
                                        </td>

                                        <td>
                                            {transaction.quantity ?? "—"}
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                transaction.amount
                                            )}
                                        </td>

                                        <td>
                                            {transaction.description || "—"}
                                        </td>

                                        <td>
                                            {transaction.recordedBy || "System"}
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="supplier-content-card analytics-section">
                <div className="analytics-section-header">
                    <div>
                        <h2>Supplier Performance Ranking</h2>
                        <p>
                            Suppliers ranked by overall performance
                            score.
                        </p>
                    </div>

                    <Medal size={28} />
                </div>

                {loadingRanking ? (
                    <div className="supplier-empty-state">
                        <RefreshCw size={32} className="spin" />
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="supplier-empty-state">
                        <Award size={42} />
                        <h3>No performance records</h3>
                    </div>
                ) : (
                    <div className="supplier-table-wrapper">
                        <table className="supplier-table">
                            <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Supplier</th>
                                <th>Orders</th>
                                <th>On-Time Rate</th>
                                <th>Completion Rate</th>
                                <th>Score</th>
                                <th>Rating</th>
                            </tr>
                            </thead>

                            <tbody>
                            {ranking.map((item, index) => (
                                <tr key={item.supplierId}>
                                    <td>
                      <span
                          className={`ranking-number rank-${
                              index + 1
                          }`}
                      >
                        {index + 1}
                      </span>
                                    </td>

                                    <td>
                                        <strong>
                                            {item.supplierName ||
                                                item.companyName}
                                        </strong>

                                        <small className="purchase-cell-note">
                                            {item.supplierCode}
                                        </small>
                                    </td>

                                    <td>
                                        {item.totalPurchaseOrders}
                                    </td>

                                    <td>
                                        {formatPercentage(
                                            item.onTimeDeliveryRate
                                        )}
                                    </td>

                                    <td>
                                        {formatPercentage(
                                            item.completionRate
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            {Number(
                                                item.performanceScore ?? 0
                                            ).toFixed(2)}
                                        </strong>
                                    </td>

                                    <td>
                                        <RatingBadge
                                            rating={
                                                item.performanceRating
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

function MetricCard({
                        title,
                        value,
                        icon,
                        type = "blue",
                    }) {
    return (
        <article
            className={`analytics-metric-card ${type}`}
        >
            <div>
                <span>{title}</span>
                <strong>{value}</strong>
            </div>

            <div className="analytics-metric-icon">
                {icon}
            </div>
        </article>
    );
}

function PerformanceRating({ rating, score }) {
    return (
        <div className="performance-rating-box">
            <Star size={22} />

            <div>
                <span>Performance Score</span>
                <strong>
                    {Number(score ?? 0).toFixed(2)} / 100
                </strong>
            </div>

            <RatingBadge
                rating={rating || "INSUFFICIENT_DATA"}
            />
        </div>
    );
}

function RatingBadge({ rating }) {
    const normalized =
        rating?.toLowerCase() || "insufficient_data";

    return (
        <span
            className={`performance-rating ${normalized}`}
        >
      {formatLabel(
          rating || "INSUFFICIENT_DATA"
      )}
    </span>
    );
}

function TransactionBadge({ type }) {
    const normalized =
        type?.toLowerCase() || "unknown";

    return (
        <span
            className={`transaction-type-badge ${normalized}`}
        >
      {formatLabel(type || "UNKNOWN")}
    </span>
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

function formatPercentage(value) {
    return `${Number(value ?? 0).toFixed(2)}%`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDateTime(value) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-LK", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatLabel(value) {
    if (!value) return "Unknown";

    return value
        .toString()
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

export default SupplierAnalyticsPage;
