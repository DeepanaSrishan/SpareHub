import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    ClipboardList,
    Eye,
    RefreshCcw,
    Search,
} from "lucide-react";

import staffOrderService from "../../../services/staffOrderService";
import getApiError from "../../../utils/getApiError";
import OrderStatusBadge from "../../../components/order/OrderStatusBadge";
import "../../../styles/staff-orders.css";

const statuses = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "READY",
    "COMPLETED",
    "CANCELLATION_REQUESTED",
    "CANCELLED",
    "REJECTED",
];

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const StaffOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [searchText, setSearchText] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await staffOrderService.getOrders(
                    statusFilter === "ALL"
                        ? ""
                        : statusFilter
                );

            setOrders(response ?? []);
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not load customer orders."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadOrders();
    }, [loadOrders]);

    const displayedOrders = useMemo(() => {
        const query = searchText
            .trim()
            .toLowerCase();

        if (!query) {
            return orders;
        }

        return orders.filter(
            (order) =>
                order.orderNumber
                    ?.toLowerCase()
                    .includes(query) ||
                order.customerName
                    ?.toLowerCase()
                    .includes(query) ||
                order.customerEmail
                    ?.toLowerCase()
                    .includes(query) ||
                order.items?.some(
                    (item) =>
                        item.productName
                            ?.toLowerCase()
                            .includes(query) ||
                        item.partNumber
                            ?.toLowerCase()
                            .includes(query)
                )
        );
    }, [orders, searchText]);

    const summary = useMemo(
        () => ({
            total: orders.length,

            pending: orders.filter(
                (order) =>
                    order.orderStatus === "PENDING"
            ).length,

            active: orders.filter((order) =>
                [
                    "CONFIRMED",
                    "PROCESSING",
                    "READY",
                ].includes(order.orderStatus)
            ).length,

            cancellation: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "CANCELLATION_REQUESTED"
            ).length,
        }),
        [orders]
    );

    return (
        <main className="staff-orders-page">
            <header className="staff-orders-header">
                <div>
                    <span className="page-eyebrow">
                        Sales operations
                    </span>

                    <h1>Order management</h1>

                    <p>
                        Review customer orders, verify stock,
                        record payments and update progress.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadOrders}
                    disabled={loading}
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

            <section className="staff-order-stats">
                <article>
                    <span>Total orders</span>
                    <strong>{summary.total}</strong>
                </article>

                <article>
                    <span>Pending review</span>
                    <strong>{summary.pending}</strong>
                </article>

                <article>
                    <span>Active processing</span>
                    <strong>{summary.active}</strong>
                </article>

                <article>
                    <span>Cancellation requests</span>
                    <strong>
                        {summary.cancellation}
                    </strong>
                </article>
            </section>

            <section className="staff-order-filters">
                <div>
                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Search order, customer or product..."
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(
                                event.target.value
                            )
                        }
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >
                    {statuses.map((status) => (
                        <option
                            key={status}
                            value={status}
                        >
                            {status === "ALL"
                                ? "All order statuses"
                                : status.replaceAll(
                                    "_",
                                    " "
                                )}
                        </option>
                    ))}
                </select>
            </section>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="page-state">
                    Loading orders...
                </div>
            ) : displayedOrders.length === 0 ? (
                <section className="staff-empty-state">
                    <ClipboardList size={44} />

                    <h2>No orders found</h2>

                    <p>
                        There are no orders matching the
                        current filter.
                    </p>
                </section>
            ) : (
                <section className="staff-order-table-card">
                    <div className="responsive-table">
                        <table className="staff-order-table">
                            <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Order status</th>
                                <th>Payment</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            {displayedOrders.map(
                                (order) => (
                                    <tr
                                        key={
                                            order.orderId
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {
                                                    order.orderNumber
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="table-customer">
                                                <strong>
                                                    {
                                                        order.customerName
                                                    }
                                                </strong>

                                                <span>
                                                        {
                                                            order.customerEmail
                                                        }
                                                    </span>
                                            </div>
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                order.createdAt
                                            )}
                                        </td>

                                        <td>
                                            {
                                                order.totalQuantity
                                            }
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    order.totalAmount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <OrderStatusBadge
                                                status={
                                                    order.orderStatus
                                                }
                                            />
                                        </td>

                                        <td>
                                            <OrderStatusBadge
                                                status={
                                                    order.paymentStatus
                                                }
                                            />
                                        </td>

                                        <td>
                                            <Link
                                                to={`/sales/orders/${order.orderId}`}
                                                className="table-action-button"
                                            >
                                                <Eye
                                                    size={
                                                        16
                                                    }
                                                />
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </main>
    );
};

export default StaffOrdersPage;