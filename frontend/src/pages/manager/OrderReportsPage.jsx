import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Banknote,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    CreditCard,
    PackageCheck,
    Receipt,
    RefreshCcw,
    RotateCcw,
    ShoppingBag,
    TrendingUp,
    WalletCards,
    XCircle,
} from "lucide-react";

import managerReportService from "../../services/managerReportService";
import getApiError from "../../utils/getApiError";
import ReportStatCard from "../../components/reports/ReportStatCard";
import "../../styles/manager-reports.css";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const formatNumber = (number) =>
    new Intl.NumberFormat("en-LK").format(
        Number(number ?? 0)
    );

const toLocalDateString = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDefaultDates = () => {
    const today = new Date();

    const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    return {
        startDate: toLocalDateString(firstDay),
        endDate: toLocalDateString(today),
    };
};

const orderStatusColors = {
    PENDING: "#f59e0b",
    CONFIRMED: "#3b82f6",
    PROCESSING: "#8b5cf6",
    READY: "#14b8a6",
    COMPLETED: "#22c55e",
    CANCELLATION_REQUESTED: "#f97316",
    CANCELLED: "#ef4444",
    REJECTED: "#be123c",
};

const paymentMethodLabels = {
    CASH: "Cash",
    CARD: "Card",
    BANK_TRANSFER: "Bank transfer",
};

const OrderReportsPage = () => {
    const defaultDates = useMemo(
        () => getDefaultDates(),
        []
    );

    const [activeTab, setActiveTab] =
        useState("sales");

    const [startDate, setStartDate] = useState(
        defaultDates.startDate
    );

    const [endDate, setEndDate] = useState(
        defaultDates.endDate
    );

    const [salesReport, setSalesReport] =
        useState(null);

    const [paymentReport, setPaymentReport] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const validateDateRange = useCallback(() => {
        if (!startDate || !endDate) {
            setError(
                "Start date and end date are required."
            );
            return false;
        }

        if (startDate > endDate) {
            setError(
                "Start date cannot be after end date."
            );
            return false;
        }

        return true;
    }, [startDate, endDate]);

    const loadReports = useCallback(async () => {
        if (!validateDateRange()) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                salesResponse,
                paymentResponse,
            ] = await Promise.all([
                managerReportService.getSalesReport(
                    startDate,
                    endDate
                ),

                managerReportService.getPaymentReport(
                    startDate,
                    endDate
                ),
            ]);

            setSalesReport(salesResponse);
            setPaymentReport(paymentResponse);
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not generate management reports."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [
        startDate,
        endDate,
        validateDateRange,
    ]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const resetToCurrentMonth = () => {
        const dates = getDefaultDates();

        setStartDate(dates.startDate);
        setEndDate(dates.endDate);
    };

    const maximumOrderStatusCount = useMemo(() => {
        const values = Object.values(
            salesReport?.ordersByStatus ?? {}
        );

        return Math.max(...values, 1);
    }, [salesReport]);

    const maximumProductSales = useMemo(() => {
        const values =
            salesReport?.productSales?.map(
                (product) =>
                    Number(product.salesAmount ?? 0)
            ) ?? [];

        return Math.max(...values, 1);
    }, [salesReport]);

    const maximumPaymentMethodAmount =
        useMemo(() => {
            const values =
                paymentReport?.paymentsByMethod?.map(
                    (method) =>
                        Number(method.amount ?? 0)
                ) ?? [];

            return Math.max(...values, 1);
        }, [paymentReport]);

    return (
        <main className="manager-reports-page">
            <header className="manager-reports-header">
                <div>
                    <span className="page-eyebrow">
                        Business analytics
                    </span>

                    <h1>Sales & payment reports</h1>

                    <p>
                        Monitor order activity, completed
                        sales, customer payments and refunds.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    disabled={loading}
                    onClick={loadReports}
                >
                    <RefreshCcw
                        size={17}
                        className={
                            loading
                                ? "spinning-icon"
                                : ""
                        }
                    />

                    Refresh
                </button>
            </header>

            <section className="report-filter-panel">
                <div className="report-date-field">
                    <label htmlFor="reportStartDate">
                        Start date
                    </label>

                    <div>
                        <CalendarDays size={17} />

                        <input
                            id="reportStartDate"
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={(event) =>
                                setStartDate(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                <div className="report-date-field">
                    <label htmlFor="reportEndDate">
                        End date
                    </label>

                    <div>
                        <CalendarDays size={17} />

                        <input
                            id="reportEndDate"
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={toLocalDateString(
                                new Date()
                            )}
                            onChange={(event) =>
                                setEndDate(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={resetToCurrentMonth}
                >
                    Current month
                </button>

                <button
                    type="button"
                    className="primary-button"
                    disabled={loading}
                    onClick={loadReports}
                >
                    Generate reports
                </button>
            </section>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <nav className="report-tabs">
                <button
                    type="button"
                    className={
                        activeTab === "sales"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("sales")
                    }
                >
                    <TrendingUp size={18} />
                    Sales report
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "payments"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("payments")
                    }
                >
                    <WalletCards size={18} />
                    Payment report
                </button>
            </nav>

            {loading ? (
                <div className="report-loading-card">
                    <RefreshCcw
                        className="spinning-icon"
                        size={28}
                    />

                    <p>Generating reports...</p>
                </div>
            ) : activeTab === "sales" ? (
                <SalesReportSection
                    report={salesReport}
                    maximumOrderStatusCount={
                        maximumOrderStatusCount
                    }
                    maximumProductSales={
                        maximumProductSales
                    }
                />
            ) : (
                <PaymentReportSection
                    report={paymentReport}
                    maximumPaymentMethodAmount={
                        maximumPaymentMethodAmount
                    }
                />
            )}
        </main>
    );
};

const SalesReportSection = ({
                                report,
                                maximumOrderStatusCount,
                                maximumProductSales,
                            }) => {
    if (!report) {
        return (
            <div className="report-empty-card">
                Sales report is unavailable.
            </div>
        );
    }

    const orderStatusEntries = Object.entries(
        report.ordersByStatus ?? {}
    );

    return (
        <section className="report-section">
            <div className="report-period-label">
                Reporting period:{" "}
                <strong>
                    {report.startDate} – {report.endDate}
                </strong>
            </div>

            <div className="report-stat-grid">
                <ReportStatCard
                    title="Gross sales"
                    value={formatCurrency(
                        report.grossSales
                    )}
                    description="Revenue from completed orders"
                    icon={TrendingUp}
                    variant="green"
                />

                <ReportStatCard
                    title="Completed orders"
                    value={formatNumber(
                        report.completedOrders
                    )}
                    description={`${formatNumber(
                        report.totalOrders
                    )} total orders`}
                    icon={CheckCircle2}
                    variant="blue"
                />

                <ReportStatCard
                    title="Units sold"
                    value={formatNumber(
                        report.totalUnitsSold
                    )}
                    description="Units in completed sales"
                    icon={PackageCheck}
                    variant="purple"
                />

                <ReportStatCard
                    title="Average order"
                    value={formatCurrency(
                        report.averageOrderValue
                    )}
                    description="Average completed-order value"
                    icon={CircleDollarSign}
                    variant="cyan"
                />

                <ReportStatCard
                    title="Total discounts"
                    value={formatCurrency(
                        report.totalDiscounts
                    )}
                    description="Loyalty benefits provided"
                    icon={Receipt}
                    variant="orange"
                />

                <ReportStatCard
                    title="Cancelled orders"
                    value={formatNumber(
                        report.cancelledOrders
                    )}
                    description={`${formatNumber(
                        report.pendingOrders
                    )} currently active or pending`}
                    icon={XCircle}
                    variant="red"
                />
            </div>

            <div className="report-content-grid">
                <article className="report-panel">
                    <header className="report-panel-header">
                        <div>
                            <ClipboardList size={20} />
                            <h2>
                                Orders by status
                            </h2>
                        </div>
                    </header>

                    <div className="report-bar-list">
                        {orderStatusEntries.map(
                            ([status, count]) => {
                                const percentage =
                                    maximumOrderStatusCount >
                                    0
                                        ? (Number(
                                                count
                                            ) /
                                            maximumOrderStatusCount) *
                                        100
                                        : 0;

                                return (
                                    <div
                                        className="report-bar-item"
                                        key={status}
                                    >
                                        <div className="report-bar-label">
                                            <span>
                                                {status.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                            </span>

                                            <strong>
                                                {count}
                                            </strong>
                                        </div>

                                        <div className="report-bar-track">
                                            <div
                                                className="report-bar-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                    background:
                                                        orderStatusColors[
                                                            status
                                                            ] ??
                                                        "#64748b",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </article>

                <article className="report-panel">
                    <header className="report-panel-header">
                        <div>
                            <ShoppingBag size={20} />
                            <h2>
                                Top-selling products
                            </h2>
                        </div>
                    </header>

                    {!report.productSales?.length ? (
                        <p className="report-no-data">
                            No completed product sales
                            exist for this period.
                        </p>
                    ) : (
                        <div className="product-sales-ranking">
                            {report.productSales.map(
                                (product, index) => {
                                    const percentage =
                                        (Number(
                                                product.salesAmount ??
                                                0
                                            ) /
                                            maximumProductSales) *
                                        100;

                                    return (
                                        <article
                                            key={
                                                product.sparePartId
                                            }
                                        >
                                            <div className="product-rank">
                                                {index + 1}
                                            </div>

                                            <div className="product-ranking-info">
                                                <div>
                                                    <section>
                                                        <strong>
                                                            {
                                                                product.productName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                product.partNumber
                                                            }
                                                        </span>
                                                    </section>

                                                    <section>
                                                        <strong>
                                                            {formatCurrency(
                                                                product.salesAmount
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {
                                                                product.quantitySold
                                                            }{" "}
                                                            units
                                                        </span>
                                                    </section>
                                                </div>

                                                <div className="report-bar-track">
                                                    <div
                                                        className="report-bar-fill product-bar"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
                </article>
            </div>

            <article className="report-panel">
                <header className="report-panel-header">
                    <div>
                        <PackageCheck size={20} />
                        <h2>Product sales table</h2>
                    </div>
                </header>

                <div className="responsive-table">
                    <table className="report-table">
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Part number</th>
                            <th>Product</th>
                            <th>Quantity sold</th>
                            <th>Sales amount</th>
                        </tr>
                        </thead>

                        <tbody>
                        {report.productSales?.map(
                            (product, index) => (
                                <tr
                                    key={
                                        product.sparePartId
                                    }
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        {
                                            product.partNumber
                                        }
                                    </td>
                                    <td>
                                        {
                                            product.productName
                                        }
                                    </td>
                                    <td>
                                        {
                                            product.quantitySold
                                        }
                                    </td>
                                    <td>
                                        <strong>
                                            {formatCurrency(
                                                product.salesAmount
                                            )}
                                        </strong>
                                    </td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                </div>
            </article>
        </section>
    );
};

const PaymentReportSection = ({
                                  report,
                                  maximumPaymentMethodAmount,
                              }) => {
    if (!report) {
        return (
            <div className="report-empty-card">
                Payment report is unavailable.
            </div>
        );
    }

    return (
        <section className="report-section">
            <div className="report-period-label">
                Reporting period:{" "}
                <strong>
                    {report.startDate} – {report.endDate}
                </strong>
            </div>

            <div className="report-stat-grid">
                <ReportStatCard
                    title="Gross collected"
                    value={formatCurrency(
                        report.grossCollectedAmount
                    )}
                    description="Payments received before refunds"
                    icon={Banknote}
                    variant="green"
                />

                <ReportStatCard
                    title="Refunded"
                    value={formatCurrency(
                        report.refundedAmount
                    )}
                    description={`${formatNumber(
                        report.refundedPaymentRecords
                    )} refunded payment records`}
                    icon={RotateCcw}
                    variant="red"
                />

                <ReportStatCard
                    title="Net collected"
                    value={formatCurrency(
                        report.netCollectedAmount
                    )}
                    description="Gross collection minus refunds"
                    icon={TrendingUp}
                    variant="blue"
                />

                <ReportStatCard
                    title="Payment records"
                    value={formatNumber(
                        report.totalPaymentRecords
                    )}
                    description={`${formatNumber(
                        report.successfulPaymentRecords
                    )} successful records`}
                    icon={CreditCard}
                    variant="purple"
                />
            </div>

            <div className="report-content-grid">
                <article className="report-panel">
                    <header className="report-panel-header">
                        <div>
                            <WalletCards size={20} />
                            <h2>
                                Payment methods
                            </h2>
                        </div>
                    </header>

                    <div className="payment-method-list">
                        {report.paymentsByMethod?.map(
                            (method) => {
                                const percentage =
                                    (Number(
                                            method.amount ?? 0
                                        ) /
                                        maximumPaymentMethodAmount) *
                                    100;

                                return (
                                    <article
                                        key={
                                            method.paymentMethod
                                        }
                                    >
                                        <div className="payment-method-heading">
                                            <section>
                                                <strong>
                                                    {paymentMethodLabels[
                                                            method
                                                                .paymentMethod
                                                            ] ??
                                                        method.paymentMethod}
                                                </strong>

                                                <span>
                                                    {
                                                        method.transactionCount
                                                    }{" "}
                                                    transactions
                                                </span>
                                            </section>

                                            <strong>
                                                {formatCurrency(
                                                    method.amount
                                                )}
                                            </strong>
                                        </div>

                                        <div className="report-bar-track">
                                            <div
                                                className="report-bar-fill payment-bar"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                </article>

                <article className="report-panel">
                    <header className="report-panel-header">
                        <div>
                            <Receipt size={20} />
                            <h2>
                                Payment statuses
                            </h2>
                        </div>
                    </header>

                    <div className="payment-status-grid">
                        {Object.entries(
                            report.paymentsByStatus ?? {}
                        ).map(([status, count]) => (
                            <article key={status}>
                                <span>
                                    {status.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </span>

                                <strong>
                                    {formatNumber(count)}
                                </strong>
                            </article>
                        ))}
                    </div>
                </article>
            </div>

            <article className="report-panel payment-calculation-panel">
                <header className="report-panel-header">
                    <div>
                        <CircleDollarSign size={20} />
                        <h2>
                            Collection calculation
                        </h2>
                    </div>
                </header>

                <div>
                    <section>
                        <span>Gross collection</span>
                        <strong>
                            {formatCurrency(
                                report.grossCollectedAmount
                            )}
                        </strong>
                    </section>

                    <section className="refund-calculation">
                        <span>Less: refunds</span>
                        <strong>
                            −{" "}
                            {formatCurrency(
                                report.refundedAmount
                            )}
                        </strong>
                    </section>

                    <section className="net-calculation">
                        <span>Net collection</span>
                        <strong>
                            {formatCurrency(
                                report.netCollectedAmount
                            )}
                        </strong>
                    </section>
                </div>
            </article>
        </section>
    );
};

export default OrderReportsPage;