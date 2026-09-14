import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Ban,
    CreditCard,
    FileText,
    Package,
    RefreshCcw,
    RotateCcw,
} from "lucide-react";

import orderService from "../../services/orderService";
import getApiError from "../../utils/getApiError";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderStatusTimeline from "../../components/order/OrderStatusTimeline";

import "../../styles/orders.css";

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

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);

    const [statusHistory, setStatusHistory] =
        useState([]);

    const [paymentStatus, setPaymentStatus] =
        useState(null);

    const [payments, setPayments] =
        useState([]);

    const [invoice, setInvoice] =
        useState(null);

    const [refund, setRefund] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        cancellationOpen,
        setCancellationOpen,
    ] = useState(false);

    const [
        cancellationReason,
        setCancellationReason,
    ] = useState("");

    const [cancelling, setCancelling] =
        useState(false);

    const loadOrderDetails = useCallback(
        async (showMainLoader = true) => {
            try {
                if (showMainLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");

                const orderResponse =
                    await orderService.getOrderById(
                        orderId
                    );

                setOrder(orderResponse);

                /*
                 * Invoice සහ refund තවම නොතිබිය හැකි
                 * නිසා Promise.allSettled භාවිත කරයි.
                 */
                const results =
                    await Promise.allSettled([
                        orderService.getStatusHistory(
                            orderId
                        ),
                        orderService.getPaymentStatus(
                            orderId
                        ),
                        orderService.getPayments(
                            orderId
                        ),
                        orderService.getInvoice(
                            orderId
                        ),
                        orderService.getRefund(
                            orderId
                        ),
                    ]);

                setStatusHistory(
                    results[0].status === "fulfilled"
                        ? results[0].value ?? []
                        : []
                );

                setPaymentStatus(
                    results[1].status === "fulfilled"
                        ? results[1].value
                        : null
                );

                setPayments(
                    results[2].status === "fulfilled"
                        ? results[2].value ?? []
                        : []
                );

                setInvoice(
                    results[3].status === "fulfilled"
                        ? results[3].value
                        : null
                );

                setRefund(
                    results[4].status === "fulfilled"
                        ? results[4].value
                        : null
                );
            } catch (requestError) {
                if (
                    requestError?.response?.status ===
                    404
                ) {
                    navigate(
                        "/customer/orders",
                        {
                            replace: true,
                        }
                    );

                    return;
                }

                setError(
                    getApiError(
                        requestError,
                        "Could not load order details."
                    )
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [navigate, orderId]
    );

    useEffect(() => {
        loadOrderDetails();
    }, [loadOrderDetails]);

    const canRequestCancellation =
        order?.orderStatus === "PENDING" ||
        order?.orderStatus === "CONFIRMED";

    const handleCancellationRequest =
        async (event) => {
            event.preventDefault();

            const reason =
                cancellationReason.trim();

            if (reason.length < 5) {
                setError(
                    "Cancellation reason must contain at least 5 characters."
                );

                return;
            }

            try {
                setCancelling(true);
                setError("");

                const updatedOrder =
                    await orderService
                        .requestCancellation(
                            orderId,
                            reason
                        );

                setOrder(updatedOrder);
                setCancellationReason("");
                setCancellationOpen(false);

                await loadOrderDetails(false);
            } catch (requestError) {
                setError(
                    getApiError(
                        requestError,
                        "Could not submit the cancellation request."
                    )
                );
            } finally {
                setCancelling(false);
            }
        };

    if (loading) {
        return (
            <div className="page-state">
                Loading order details...
            </div>
        );
    }

    if (!order) {
        return (
            <main className="orders-page">
                <div className="alert alert-error">
                    Order details are unavailable.
                </div>
            </main>
        );
    }

    /*
     * PAID payments පමණක් current paid amount
     * එකට ගනී. REFUNDED payment එකක් paid
     * amount එකට නැවත එකතු නොකරයි.
     */
    const totalPaid = payments
        .filter(
            (payment) =>
                payment.status === "PAID"
        )
        .reduce(
            (total, payment) =>
                total +
                Number(payment.amount ?? 0),
            0
        );

    /*
     * Refunded order එකකට outstanding balance
     * එකක් නොපෙන්වයි.
     */
    const remainingAmount =
        order.paymentStatus === "REFUNDED"
            ? 0
            : Math.max(
                0,
                Number(
                    order.totalAmount ?? 0
                ) - totalPaid
            );

    return (
        <main className="orders-page">
            <div className="order-details-toolbar">
                <Link
                    to="/customer/orders"
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to orders
                </Link>

                <button
                    type="button"
                    className="secondary-button"
                    disabled={refreshing}
                    onClick={() =>
                        loadOrderDetails(false)
                    }
                >
                    <RefreshCcw
                        size={17}
                        className={
                            refreshing
                                ? "spinning-icon"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <header className="order-detail-header">
                <div>
                    <span>Order number</span>

                    <h1>
                        {order.orderNumber}
                    </h1>

                    <p>
                        Placed on{" "}
                        {formatDateTime(
                            order.createdAt
                        )}
                    </p>
                </div>

                <div className="order-header-statuses">
                    <div>
                        <span>Order</span>

                        <OrderStatusBadge
                            status={
                                order.orderStatus
                            }
                        />
                    </div>

                    <div>
                        <span>Payment</span>

                        <OrderStatusBadge
                            status={
                                order.paymentStatus
                            }
                        />
                    </div>
                </div>
            </header>

            <div className="order-details-grid">
                <div className="order-detail-main">
                    <section className="order-panel">
                        <div className="panel-heading">
                            <div>
                                <Package size={20} />
                                <h2>Order items</h2>
                            </div>

                            <span>
                                {order.totalQuantity}{" "}
                                items
                            </span>
                        </div>

                        <div className="order-detail-items">
                            {order.items?.map(
                                (item) => (
                                    <article
                                        className="order-detail-item"
                                        key={
                                            item.orderItemId
                                        }
                                    >
                                        <div>
                                            <span className="part-number">
                                                {
                                                    item.partNumber
                                                }
                                            </span>

                                            <h3>
                                                {
                                                    item.productName
                                                }
                                            </h3>

                                            <p>
                                                {formatCurrency(
                                                    item.unitPrice
                                                )}
                                                {" × "}
                                                {
                                                    item.quantity
                                                }
                                            </p>
                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                item.subtotal
                                            )}
                                        </strong>
                                    </article>
                                )
                            )}
                        </div>
                    </section>

                    <section className="order-panel">
                        <div className="panel-heading">
                            <div>
                                <CreditCard
                                    size={20}
                                />

                                <h2>
                                    Payment information
                                </h2>
                            </div>
                        </div>

                        <div className="payment-summary-grid">
                            <div>
                                <span>
                                    Order total
                                </span>

                                <strong>
                                    {formatCurrency(
                                        paymentStatus
                                            ?.totalAmount ??
                                        order.totalAmount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Paid amount
                                </span>

                                <strong>
                                    {formatCurrency(
                                        totalPaid
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Remaining amount
                                </span>

                                <strong>
                                    {formatCurrency(
                                        remainingAmount
                                    )}
                                </strong>
                            </div>
                        </div>

                        {payments.length > 0 ? (
                            <div className="payment-history-list">
                                {payments.map(
                                    (payment) => (
                                        <article
                                            key={
                                                payment.paymentId
                                            }
                                        >
                                            <div>
                                                <strong>
                                                    {
                                                        payment.paymentReference
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        payment.paymentMethod
                                                    }
                                                    {" · "}
                                                    {formatDateTime(
                                                        payment.paidAt
                                                    )}
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {formatCurrency(
                                                        payment.amount
                                                    )}
                                                </strong>

                                                <OrderStatusBadge
                                                    status={
                                                        payment.status
                                                    }
                                                />
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="empty-panel-text">
                                No payments have been
                                recorded for this order.
                            </p>
                        )}

                        {refund && (
                            <div className="refund-information">
                                <RotateCcw
                                    size={19}
                                />

                                <div>
                                    <strong>
                                        Refund completed
                                    </strong>

                                    <span>
                                        {
                                            refund.refundReference
                                        }
                                        {" · "}
                                        {formatCurrency(
                                            refund.amount
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="order-panel">
                        <div className="panel-heading">
                            <div>
                                <RefreshCcw
                                    size={20}
                                />

                                <h2>
                                    Order progress
                                </h2>
                            </div>
                        </div>

                        <OrderStatusTimeline
                            order={order}
                            history={
                                statusHistory
                            }
                        />
                    </section>
                </div>

                <aside className="order-detail-sidebar">
                    <section className="order-panel">
                        <h2>Price summary</h2>

                        <div className="price-summary-row">
                            <span>Subtotal</span>

                            <strong>
                                {formatCurrency(
                                    order.subtotal
                                )}
                            </strong>
                        </div>

                        <div className="price-summary-row discount">
                            <span>
                                Loyalty discount (
                                {
                                    order.discountPercentage
                                }
                                %)
                            </span>

                            <strong>
                                −{" "}
                                {formatCurrency(
                                    order.discountAmount
                                )}
                            </strong>
                        </div>

                        <div className="price-summary-row total">
                            <span>Total</span>

                            <strong>
                                {formatCurrency(
                                    order.totalAmount
                                )}
                            </strong>
                        </div>
                    </section>

                    <section className="order-panel">
                        <h2>Order documents</h2>

                        {invoice ? (
                            <Link
                                to={`/customer/orders/${order.orderId}/invoice`}
                                className="primary-button full-width-button"
                            >
                                <FileText
                                    size={18}
                                />

                                View invoice
                            </Link>
                        ) : (
                            <p className="empty-panel-text">
                                Invoice has not been
                                generated yet.
                            </p>
                        )}
                    </section>

                    {order.customerNote && (
                        <section className="order-panel">
                            <h2>Your note</h2>

                            <p className="order-note">
                                {
                                    order.customerNote
                                }
                            </p>
                        </section>
                    )}

                    {order.staffNote && (
                        <section className="order-panel">
                            <h2>Staff note</h2>

                            <p className="order-note">
                                {order.staffNote}
                            </p>
                        </section>
                    )}

                    {order.cancellationReason && (
                        <section className="order-panel cancellation-panel">
                            <h2>
                                Cancellation
                            </h2>

                            <p>
                                <strong>
                                    Your reason:
                                </strong>
                            </p>

                            <p className="order-note">
                                {
                                    order.cancellationReason
                                }
                            </p>

                            {order
                                .cancellationDecisionNote && (
                                <>
                                    <p>
                                        <strong>
                                            Staff decision:
                                        </strong>
                                    </p>

                                    <p className="order-note">
                                        {
                                            order.cancellationDecisionNote
                                        }
                                    </p>
                                </>
                            )}
                        </section>
                    )}

                    {canRequestCancellation && (
                        <section className="order-panel">
                            {!cancellationOpen ? (
                                <button
                                    type="button"
                                    className="danger-outline-button full-width-button"
                                    onClick={() =>
                                        setCancellationOpen(
                                            true
                                        )
                                    }
                                >
                                    <Ban size={17} />
                                    Request cancellation
                                </button>
                            ) : (
                                <form
                                    className="cancellation-form"
                                    onSubmit={
                                        handleCancellationRequest
                                    }
                                >
                                    <label htmlFor="cancellationReason">
                                        Why do you want
                                        to cancel?
                                    </label>

                                    <textarea
                                        id="cancellationReason"
                                        rows="5"
                                        maxLength="500"
                                        required
                                        value={
                                            cancellationReason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCancellationReason(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                    <span>
                                        {
                                            cancellationReason.length
                                        }
                                        /500
                                    </span>

                                    <div>
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            disabled={
                                                cancelling
                                            }
                                            onClick={() => {
                                                setCancellationOpen(
                                                    false
                                                );

                                                setCancellationReason(
                                                    ""
                                                );
                                            }}
                                        >
                                            Keep order
                                        </button>

                                        <button
                                            type="submit"
                                            className="danger-button"
                                            disabled={
                                                cancelling
                                            }
                                        >
                                            {cancelling
                                                ? "Submitting..."
                                                : "Submit request"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    )}
                </aside>
            </div>
        </main>
    );
};

export default OrderDetailsPage;