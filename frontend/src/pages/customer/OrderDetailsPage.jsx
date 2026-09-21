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
    AlertCircle,
    ArrowLeft,
    Ban,
    Check,
    CheckCircle2,
    Copy,
    CreditCard,
    FileText,
    Landmark,
    Lock,
    Package,
    RefreshCcw,
    RotateCcw,
    ShieldCheck,
    X,
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

const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
};

const getCardBrand = (cardNumber) => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "American Express";
    return "";
};

const bankAccounts = [
    {
        id: "combank",
        bankName: "Commercial Bank of Ceylon",
        accountName: "SpareHub Auto (Pvt) Ltd",
        accountNumber: "1000 4589 7234",
        branch: "Colombo City Branch",
    },
    {
        id: "boc",
        bankName: "Bank of Ceylon (BOC)",
        accountName: "SpareHub Auto (Pvt) Ltd",
        accountNumber: "0089 1234 5678",
        branch: "Kollupitiya Branch",
    },
    {
        id: "hnb",
        bankName: "Hatton National Bank (HNB)",
        accountName: "SpareHub Auto (Pvt) Ltd",
        accountNumber: "0450 2000 8912",
        branch: "Head Office Branch",
    },
];

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

    // Online payment modal state
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CARD");
    const [paying, setPaying] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState("");

    const [cardDetails, setCardDetails] = useState({
        cardHolderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });

    const [bankDetails, setBankDetails] = useState({
        bankName: "Commercial Bank of Ceylon",
        depositSlipReference: "",
        transferDate: new Date().toISOString().split("T")[0],
    });

    const [copiedAccount, setCopiedAccount] = useState("");

    const handleCopyAccount = (accountNumber, id) => {
        navigator.clipboard.writeText(accountNumber.replace(/\s+/g, ""));
        setCopiedAccount(id);
        setTimeout(() => setCopiedAccount(""), 2000);
    };

    const validatePaymentDetails = () => {
        if (paymentMethod === "CARD") {
            const digits = cardDetails.cardNumber.replace(/\D/g, "");
            if (digits.length !== 16) {
                return "Please enter a valid 16-digit card number.";
            }
            if (!cardDetails.cardHolderName.trim()) {
                return "Please enter the cardholder's full name.";
            }
            if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
                return "Please enter a valid expiry date in MM/YY format.";
            }
            const [month] = cardDetails.expiryDate.split("/").map(Number);
            if (!month || month < 1 || month > 12) {
                return "Invalid expiry month. Month must be between 01 and 12.";
            }
            if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
                return "Please enter a valid 3 or 4 digit CVV/CVC.";
            }
        }

        if (paymentMethod === "BANK_TRANSFER") {
            if (!bankDetails.depositSlipReference.trim()) {
                return "Please enter the deposit slip reference or transaction ID.";
            }
        }

        return null;
    };

    const handleProcessPayment = async (event) => {
        event.preventDefault();
        const validationError = validatePaymentDetails();
        if (validationError) {
            setPaymentError(validationError);
            return;
        }

        try {
            setPaying(true);
            setPaymentError("");

            let paymentData = null;
            if (paymentMethod === "CARD") {
                paymentData = {
                    paymentMethod: "CARD",
                    cardNumber: cardDetails.cardNumber.replace(/\s+/g, ""),
                    cardHolderName: cardDetails.cardHolderName.trim(),
                    expiryDate: cardDetails.expiryDate.trim(),
                    cvv: cardDetails.cvv.trim(),
                    note: "Online card payment by " + cardDetails.cardHolderName.trim(),
                };
            } else if (paymentMethod === "BANK_TRANSFER") {
                paymentData = {
                    paymentMethod: "BANK_TRANSFER",
                    bankName: bankDetails.bankName,
                    depositSlipReference: bankDetails.depositSlipReference.trim(),
                    transferDate: bankDetails.transferDate,
                    note: "Direct bank deposit to " + bankDetails.bankName,
                };
            }

            await orderService.payOrder(orderId, paymentData);
            setPaymentSuccess("Payment processed successfully! Your order is now paid.");
            setTimeout(async () => {
                setPaymentModalOpen(false);
                setPaymentSuccess("");
                await loadOrderDetails(false);
            }, 1200);
        } catch (err) {
            setPaymentError(getApiError(err, "Payment failed. Please check your payment details."));
        } finally {
            setPaying(false);
        }
    };

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

                        {order.paymentStatus === "PENDING" &&
                            order.orderStatus !== "CANCELLED" &&
                            remainingAmount > 0 && (
                                <div className="pending-payment-alert">
                                    <div className="pending-payment-info">
                                        <div className="pending-payment-title">
                                            <CreditCard size={18} />
                                            <strong>Online Payment Available</strong>
                                        </div>
                                        <p>
                                            This order is pending payment. Pay securely with Credit/Debit Card or Direct Bank Transfer to process your order faster.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="primary-button pay-alert-btn"
                                        onClick={() => {
                                            setPaymentModalOpen(true);
                                            setPaymentError("");
                                            setPaymentSuccess("");
                                        }}
                                    >
                                        <CreditCard size={16} />
                                        Pay Now ({formatCurrency(remainingAmount)})
                                    </button>
                                </div>
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

                        {Number(order.taxAmount || 0) > 0 && (
                            <div className="price-summary-row tax">
                                <span>
                                    Tax (
                                    {order.taxRate ?? 0}
                                    %)
                                </span>

                                <strong>
                                    +{" "}
                                    {formatCurrency(
                                        order.taxAmount
                                    )}
                                </strong>
                            </div>
                        )}

                        <div className="price-summary-row total">
                            <span>Total</span>

                            <strong>
                                {formatCurrency(
                                    order.totalAmount
                                )}
                            </strong>
                        </div>

                        {order.paymentStatus === "PENDING" &&
                            order.orderStatus !== "CANCELLED" &&
                            remainingAmount > 0 && (
                                <div className="order-pay-sidebar-action">
                                    <button
                                        type="button"
                                        className="primary-button full-width-button pay-sidebar-btn"
                                        onClick={() => {
                                            setPaymentModalOpen(true);
                                            setPaymentError("");
                                            setPaymentSuccess("");
                                        }}
                                    >
                                        <CreditCard size={18} />
                                        Pay Now ({formatCurrency(remainingAmount)})
                                    </button>
                                </div>
                            )}
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

            {paymentModalOpen && (
                <div
                    className="modal-backdrop"
                    onClick={() => {
                        if (!paying) {
                            setPaymentModalOpen(false);
                            setPaymentError("");
                        }
                    }}
                >
                    <div
                        className="payment-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="payment-modal-header">
                            <div>
                                <h2>Pay for Order</h2>
                                <p>
                                    Order #{order.orderNumber} · Balance:{" "}
                                    <strong>{formatCurrency(remainingAmount)}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                disabled={paying}
                                onClick={() => {
                                    setPaymentModalOpen(false);
                                    setPaymentError("");
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {paymentError && (
                            <div className="alert alert-error">
                                <AlertCircle size={16} />
                                <span>{paymentError}</span>
                            </div>
                        )}

                        {paymentSuccess && (
                            <div className="alert alert-success">
                                <CheckCircle2 size={16} />
                                <span>{paymentSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleProcessPayment}>
                            {/* Payment Method Selector Tabs */}
                            <div className="modal-payment-methods">
                                <button
                                    type="button"
                                    className={`modal-method-btn ${
                                        paymentMethod === "CARD" ? "active" : ""
                                    }`}
                                    onClick={() => setPaymentMethod("CARD")}
                                >
                                    <CreditCard size={18} />
                                    <span>Credit / Debit Card</span>
                                </button>
                                <button
                                    type="button"
                                    className={`modal-method-btn ${
                                        paymentMethod === "BANK_TRANSFER" ? "active" : ""
                                    }`}
                                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                                >
                                    <Landmark size={18} />
                                    <span>Direct Bank Transfer</span>
                                </button>
                            </div>

                            {/* Card Form */}
                            {paymentMethod === "CARD" && (
                                <div className="payment-modal-section">
                                    <div className="form-group">
                                        <label htmlFor="modalCardHolder">
                                            Cardholder Name *
                                        </label>
                                        <input
                                            id="modalCardHolder"
                                            type="text"
                                            placeholder="e.g. S. A. Perera"
                                            value={cardDetails.cardHolderName}
                                            onChange={(e) =>
                                                setCardDetails((prev) => ({
                                                    ...prev,
                                                    cardHolderName: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="modalCardNumber">
                                            Card Number *
                                        </label>
                                        <div className="card-input-wrapper">
                                            <input
                                                id="modalCardNumber"
                                                type="text"
                                                placeholder="4000 1234 5678 9010"
                                                maxLength={19}
                                                value={cardDetails.cardNumber}
                                                onChange={(e) =>
                                                    setCardDetails((prev) => ({
                                                        ...prev,
                                                        cardNumber: formatCardNumber(
                                                            e.target.value
                                                        ),
                                                    }))
                                                }
                                            />
                                            {getCardBrand(cardDetails.cardNumber) && (
                                                <span className="card-brand-badge">
                                                    {getCardBrand(cardDetails.cardNumber)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-fields-row">
                                        <div className="form-group">
                                            <label htmlFor="modalExpiry">
                                                Expiry Date *
                                            </label>
                                            <input
                                                id="modalExpiry"
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardDetails.expiryDate}
                                                onChange={(e) =>
                                                    setCardDetails((prev) => ({
                                                        ...prev,
                                                        expiryDate: formatExpiry(
                                                            e.target.value
                                                        ),
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="modalCvv">
                                                CVV / CVC *
                                            </label>
                                            <div className="card-input-wrapper">
                                                <input
                                                    id="modalCvv"
                                                    type="password"
                                                    placeholder="123"
                                                    maxLength={4}
                                                    value={cardDetails.cvv}
                                                    onChange={(e) =>
                                                        setCardDetails((prev) => ({
                                                            ...prev,
                                                            cvv: e.target.value.replace(
                                                                /\D/g,
                                                                ""
                                                            ),
                                                        }))
                                                    }
                                                />
                                                <Lock
                                                    size={15}
                                                    style={{
                                                        position: "absolute",
                                                        right: "12px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        color: "#64748b",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="security-notice">
                                        <ShieldCheck size={16} />
                                        <span>
                                            Payments are simulated with 256-bit encryption for demo & testing.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Bank Transfer Form */}
                            {paymentMethod === "BANK_TRANSFER" && (
                                <div className="payment-modal-section">
                                    <p className="bank-instructions">
                                        Transfer <strong>{formatCurrency(remainingAmount)}</strong> to one of our corporate bank accounts below and enter your deposit slip number or reference:
                                    </p>

                                    <div className="bank-accounts-list">
                                        {bankAccounts.map((acc) => (
                                            <div
                                                key={acc.id}
                                                className="bank-account-item"
                                            >
                                                <div className="bank-account-header">
                                                    <div>
                                                        <span className="bank-badge">
                                                            {acc.bankName}
                                                        </span>
                                                        <p className="account-holder">
                                                            {acc.accountName} ·{" "}
                                                            {acc.branch}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="bank-copy-btn"
                                                        onClick={() =>
                                                            handleCopyAccount(
                                                                acc.accountNumber,
                                                                acc.id
                                                            )
                                                        }
                                                    >
                                                        {copiedAccount === acc.id ? (
                                                            <>
                                                                <Check size={14} />
                                                                Copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy size={14} />
                                                                Copy No
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bank-account-details">
                                                    <code>{acc.accountNumber}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="form-group" style={{ marginTop: "14px" }}>
                                        <label htmlFor="modalTransferBank">
                                            Transfer Deposited To *
                                        </label>
                                        <select
                                            id="modalTransferBank"
                                            value={bankDetails.bankName}
                                            onChange={(e) =>
                                                setBankDetails((prev) => ({
                                                    ...prev,
                                                    bankName: e.target.value,
                                                }))
                                            }
                                        >
                                            {bankAccounts.map((acc) => (
                                                <option
                                                    key={acc.id}
                                                    value={acc.bankName}
                                                >
                                                    {acc.bankName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="modalDepositSlip">
                                            Deposit Slip Number / Transaction ID *
                                        </label>
                                        <input
                                            id="modalDepositSlip"
                                            type="text"
                                            placeholder="e.g. SLIP-892341 or TXN10293847"
                                            value={bankDetails.depositSlipReference}
                                            onChange={(e) =>
                                                setBankDetails((prev) => ({
                                                    ...prev,
                                                    depositSlipReference: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="modalTransferDate">
                                            Transfer Date
                                        </label>
                                        <input
                                            id="modalTransferDate"
                                            type="date"
                                            value={bankDetails.transferDate}
                                            onChange={(e) =>
                                                setBankDetails((prev) => ({
                                                    ...prev,
                                                    transferDate: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    disabled={paying}
                                    onClick={() => {
                                        setPaymentModalOpen(false);
                                        setPaymentError("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={paying}
                                >
                                    {paying
                                        ? "Processing..."
                                        : paymentMethod === "CARD"
                                        ? `Pay ${formatCurrency(remainingAmount)}`
                                        : "Confirm Bank Transfer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default OrderDetailsPage;