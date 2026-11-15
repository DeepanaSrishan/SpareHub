import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    CalendarDays,
    ChevronRight,
    PackageSearch,
    Search,
    ShoppingBag,
} from "lucide-react";

import orderService from "../../services/orderService";
import getApiError from "../../utils/getApiError";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";

import "../../styles/orders.css";

const statusOptions = [
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

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [searchText, setSearchText] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await orderService.getMyOrders();

            setOrders(response ?? []);
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not load your orders."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const query = searchText
            .trim()
            .toLowerCase();

        return orders.filter((order) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                order.orderStatus === statusFilter;

            const matchesSearch =
                !query ||
                order.orderNumber
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
                );

            return (
                matchesStatus &&
                matchesSearch
            );
        });
    }, [
        orders,
        searchText,
        statusFilter,
    ]);

    if (loading) {
        return (
            <div className="page-state">
                Loading your orders...
            </div>
        );
    }

    return (
        <main className="orders-page">
            <header className="orders-header">
                <div>
                    <span className="page-eyebrow">
                        Customer account
                    </span>

                    <h1>My orders</h1>

                    <p>
                        Review orders, payment details,
                        invoices and order progress.
                    </p>
                </div>

                <Link
                    to="/products"
                    className="primary-button"
                >
                    <ShoppingBag size={18} />
                    Shop spare parts
                </Link>
            </header>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <section className="order-filter-card">
                <div className="order-search-box">
                    <Search size={18} />

                    <input
                        type="search"
                        value={searchText}
                        placeholder="Search order number or product..."
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
                    {statusOptions.map(
                        (status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {status === "ALL"
                                    ? "All statuses"
                                    : status.replaceAll(
                                        "_",
                                        " "
                                    )}
                            </option>
                        )
                    )}
                </select>
            </section>

            {filteredOrders.length === 0 ? (
                <section className="empty-orders-card">
                    <PackageSearch size={44} />

                    <h2>No orders found</h2>

                    <p>
                        No orders match the selected
                        filter or search term.
                    </p>

                    {orders.length === 0 && (
                        <Link
                            to="/products"
                            className="primary-button"
                        >
                            Browse spare parts
                        </Link>
                    )}
                </section>
            ) : (
                <section className="orders-list">
                    {filteredOrders.map(
                        (order) => (
                            <article
                                className="order-list-card"
                                key={order.orderId}
                            >
                                <div className="order-list-top">
                                    <div>
                                        <span>
                                            Order number
                                        </span>

                                        <h2>
                                            {
                                                order.orderNumber
                                            }
                                        </h2>
                                    </div>

                                    <OrderStatusBadge
                                        status={
                                            order.orderStatus
                                        }
                                    />
                                </div>

                                <div className="order-list-details">
                                    <div>
                                        <CalendarDays
                                            size={17}
                                        />

                                        <span>
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </span>
                                    </div>

                                    <div>
                                        <span>
                                            Items
                                        </span>

                                        <strong>
                                            {
                                                order.totalQuantity
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Payment
                                        </span>

                                        <OrderStatusBadge
                                            status={
                                                order.paymentStatus
                                            }
                                        />
                                    </div>

                                    <div>
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                order.totalAmount
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className="order-product-preview">
                                    {order.items
                                        ?.slice(0, 3)
                                        .map(
                                            (item) => (
                                                <span
                                                    key={
                                                        item.orderItemId
                                                    }
                                                >
                                                    {
                                                        item.productName
                                                    }
                                                    {" × "}
                                                    {
                                                        item.quantity
                                                    }
                                                </span>
                                            )
                                        )}

                                    {order.items?.length >
                                        3 && (
                                            <span>
                                            +
                                                {order.items
                                                        .length -
                                                    3}{" "}
                                                more
                                        </span>
                                        )}
                                </div>

                                <Link
                                    to={`/customer/orders/${order.orderId}`}
                                    className="order-details-link"
                                >
                                    View order details
                                    <ChevronRight
                                        size={18}
                                    />
                                </Link>
                            </article>
                        )
                    )}
                </section>
            )}
        </main>
    );
};

export default OrdersPage;