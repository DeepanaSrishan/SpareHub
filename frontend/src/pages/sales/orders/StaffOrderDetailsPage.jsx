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
    Banknote,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    FilePlus2,
    Landmark,
    Lock,
    Mail,
    PackageCheck,
    Printer,
    Receipt,
    RefreshCcw,
    RotateCcw,
    ShieldCheck,
    UserCheck,
    X,
} from "lucide-react";

import staffOrderService from "../../../services/staffOrderService";
import getApiError from "../../../utils/getApiError";
import OrderStatusBadge from "../../../components/order/OrderStatusBadge";
import OrderStatusTimeline from "../../../components/order/OrderStatusTimeline";
import StockVerificationPanel from "../../../components/order/StockVerificationPanel";
import "../../../styles/staff-orders.css";

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

const nextStatuses = {
    CONFIRMED: "PROCESSING",
    PROCESSING: "READY",
    READY: "COMPLETED",
};

const statusButtonLabels = {
    PROCESSING: "Start processing",
    READY: "Mark as ready",
    COMPLETED: "Complete sale",
};

const StaffOrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [history, setHistory] = useState([]);
    const [payments, setPayments] = useState([]);
    const [invoice, setInvoice] = useState(null);
    const [refund, setRefund] = useState(null);
    const [verification, setVerification] =
        useState(null);

    const [staffNote, setStaffNote] = useState("");
    const [rejectionReason, setRejectionReason] =
        useState("");

    const [decisionNote, setDecisionNote] =
        useState("");

    const [paymentForm, setPaymentForm] = useState({
        paymentMethod: "CASH",
        externalReference: "",
        note: "",
    });

    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadOrder = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const orderResponse =
                await staffOrderService.getOrder(
                    orderId
                );

            setOrder(orderResponse);
            setStaffNote(
                orderResponse.staffNote ?? ""
            );

            const results =
                await Promise.allSettled([
                    staffOrderService.getStatusHistory(
                        orderId
                    ),
                    staffOrderService.getPayments(
                        orderId
                    ),
                    staffOrderService.getInvoice(
                        orderId
                    ),
                    staffOrderService.getRefund(
                        orderId
                    ),
                ]);

            setHistory(
                results[0].status === "fulfilled"
                    ? results[0].value ?? []
                    : []
            );

            setPayments(
                results[1].status === "fulfilled"
                    ? results[1].value ?? []
                    : []
            );

            setInvoice(
                results[2].status === "fulfilled"
                    ? results[2].value
                    : null
            );

            setRefund(
                results[3].status === "fulfilled"
                    ? results[3].value
                    : null
            );
        } catch (requestError) {
            if (
                requestError?.response?.status === 404
            ) {
                navigate("/sales/orders", {
                    replace: true,
                });

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
        }
    }, [navigate, orderId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadOrder();
    }, [loadOrder]);

    const executeAction = async (
        action,
        successMessage
    ) => {
        try {
            setWorking(true);
            setError("");
            setSuccess("");

            await action();

            setSuccess(successMessage);
            await loadOrder();
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "The order action could not be completed."
                )
            );
        } finally {
            setWorking(false);
        }
    };

    const handleVerifyStock = async () => {
        try {
            setWorking(true);
            setError("");
            setSuccess("");

            const response =
                await staffOrderService.verifyStock(
                    orderId
                );

            setVerification(response);

            if (response.allItemsAvailable) {
                setSuccess(
                    "All order items are currently available."
                );
            }
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not verify order stock."
                )
            );
        } finally {
            setWorking(false);
        }
    };

    const handleConfirm = () => {
        if (!verification?.allItemsAvailable) {
            setError(
                "Verify stock successfully before confirming the order."
            );
            return;
        }

        executeAction(
            () =>
                staffOrderService.confirmOrder(
                    orderId,
                    staffNote
                ),
            "Order confirmed successfully."
        );
    };

    const handleReject = () => {
        const reason = rejectionReason.trim();

        if (reason.length < 5) {
            setError(
                "Enter a rejection reason containing at least 5 characters."
            );
            return;
        }

        if (
            !window.confirm(
                "Are you sure you want to reject this order?"
            )
        ) {
            return;
        }

        executeAction(
            () =>
                staffOrderService.rejectOrder(
                    orderId,
                    reason
                ),
            "Order rejected successfully."
        );
    };

    const handleNextStatus = () => {
        const nextStatus =
            nextStatuses[order.orderStatus];

        if (!nextStatus) {
            return;
        }

        if (
            nextStatus === "COMPLETED" &&
            order.paymentStatus !== "PAID"
        ) {
            setError(
                "Full payment must be recorded before completing the sale."
            );
            return;
        }

        if (
            nextStatus === "COMPLETED" &&
            !window.confirm(
                "Complete this sale and deduct stock?"
            )
        ) {
            return;
        }

        executeAction(
            () =>
                staffOrderService.updateStatus(
                    orderId,
                    nextStatus,
                    staffNote
                ),
            `Order updated to ${nextStatus}.`
        );
    };

    const handleGenerateInvoice = () => {
        executeAction(
            () =>
                staffOrderService.generateInvoice(
                    orderId
                ),
            "Invoice generated successfully."
        );
    };

    const handlePaymentSubmit = (event) => {
        event.preventDefault();

        if (remainingAmount <= 0 || order.paymentStatus === "PAID") {
            setError("This order has already been fully paid.");
            return;
        }

        if (["CANCELLED", "REJECTED"].includes(order.orderStatus)) {
            setError("Payment cannot be recorded for this order status.");
            return;
        }

        executeAction(
            () =>
                staffOrderService.recordPayment(
                    orderId,
                    {
                        paymentMethod:
                        paymentForm.paymentMethod,
                        externalReference:
                            paymentForm.externalReference
                                .trim() || null,
                        note:
                            paymentForm.note.trim() ||
                            null,
                    }
                ),
            "Full payment recorded successfully."
        );

        setPaymentForm({
            paymentMethod: "CASH",
            externalReference: "",
            note: "",
        });
    };

    const handleApproveCancellation = () => {
        if (
            !window.confirm(
                "Approve this cancellation request?"
            )
        ) {
            return;
        }

        executeAction(
            () =>
                staffOrderService.approveCancellation(
                    orderId,
                    decisionNote
                ),
            "Cancellation approved successfully."
        );
    };

    const handleRejectCancellation = () => {
        if (decisionNote.trim().length < 5) {
            setError(
                "Enter a cancellation decision note containing at least 5 characters."
            );
            return;
        }

        executeAction(
            () =>
                staffOrderService.rejectCancellation(
                    orderId,
                    decisionNote.trim()
                ),
            "Cancellation request rejected."
        );
    };

    if (loading) {
        return (
            <div className="page-state">
                Loading order...
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const nextStatus =
        nextStatuses[order.orderStatus];

    const canGenerateInvoice = [
        "CONFIRMED",
        "PROCESSING",
        "READY",
        "COMPLETED",
    ].includes(order.orderStatus);

    const canRecordPayment = ![
        "PENDING",
        "CANCELLATION_REQUESTED",
        "CANCELLED",
        "REJECTED",
    ].includes(order.orderStatus);

    const totalPaid = payments
        .filter((payment) => payment.status === "PAID")
        .reduce(
            (total, payment) =>
                total + Number(payment.amount ?? 0),
            0
        );

    const remainingAmount = Math.max(
        0,
        Number(order.totalAmount ?? 0) - totalPaid
    );

    return (
        <main className="staff-orders-page">
            <div className="staff-details-toolbar">
                <Link
                    to="/sales/orders"
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to orders
                </Link>

                <button
                    type="button"
                    className="secondary-button"
                    disabled={working}
                    onClick={loadOrder}
                >
                    <RefreshCcw size={17} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            <header className="staff-order-detail-header">
                <div>
                    <span>Order management</span>
                    <h1>{order.orderNumber}</h1>

                    <div className="staff-header-meta">
                        <span className="staff-meta-pill">
                            <UserCheck size={14} />
                            {order.customerName}
                        </span>
                        <span className="staff-meta-pill">
                            <Mail size={14} />
                            {order.customerEmail}
                        </span>
                        <span className="staff-meta-pill">
                            <Calendar size={14} />
                            {formatDateTime(order.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="staff-header-statuses">
                    <OrderStatusBadge
                        status={order.orderStatus}
                    />

                    <OrderStatusBadge
                        status={order.paymentStatus}
                    />
                </div>
            </header>

            <div className="staff-order-detail-grid">
                <div className="staff-order-main">
                    <section className="staff-order-panel">
                        <div className="staff-panel-title">
                            <div>
                                <PackageCheck size={20} />
                                <h2>Order items</h2>
                            </div>

                            <strong>
                                {order.totalQuantity} units
                            </strong>
                        </div>

                        <div className="staff-order-items">
                            {order.items?.map((item) => (
                                <article
                                    key={item.orderItemId}
                                >
                                    <div>
                                        <span>
                                            {item.partNumber}
                                        </span>

                                        <h3>
                                            {item.productName}
                                        </h3>

                                        <p>
                                            {formatCurrency(
                                                item.unitPrice
                                            )}
                                            {" × "}
                                            {item.quantity}
                                        </p>
                                    </div>

                                    <strong>
                                        {formatCurrency(
                                            item.subtotal
                                        )}
                                    </strong>
                                </article>
                            ))}
                        </div>

                        <div className="staff-price-summary">
                            <div>
                                <span>Subtotal</span>
                                <strong>
                                    {formatCurrency(
                                        order.subtotal
                                    )}
                                </strong>
                            </div>

                            <div>
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
                                <div>
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

                            <div className="grand-total">
                                <span>Total</span>
                                <strong>
                                    {formatCurrency(
                                        order.totalAmount
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {order.orderStatus ===
                        "PENDING" && (
                            <>
                                <section className="staff-order-panel">
                                    <h2>Review pending order</h2>

                                    <label htmlFor="staffNote">
                                        Staff note
                                    </label>

                                    <textarea
                                        id="staffNote"
                                        rows="4"
                                        maxLength="500"
                                        value={staffNote}
                                        onChange={(event) =>
                                            setStaffNote(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="staff-action-row">
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            disabled={working}
                                            onClick={
                                                handleVerifyStock
                                            }
                                        >
                                            <PackageCheck
                                                size={17}
                                            />
                                            Verify stock
                                        </button>

                                        <button
                                            type="button"
                                            className="primary-button"
                                            disabled={
                                                working ||
                                                !verification?.allItemsAvailable
                                            }
                                            onClick={
                                                handleConfirm
                                            }
                                        >
                                            <Check size={17} />
                                            Confirm order
                                        </button>
                                    </div>
                                </section>

                                <StockVerificationPanel
                                    verification={
                                        verification
                                    }
                                />

                                <section className="staff-order-panel danger-panel">
                                    <h2>Reject order</h2>

                                    <textarea
                                        rows="4"
                                        maxLength="500"
                                        placeholder="Required rejection reason..."
                                        value={rejectionReason}
                                        onChange={(event) =>
                                            setRejectionReason(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="danger-button"
                                        disabled={working}
                                        onClick={handleReject}
                                    >
                                        <X size={17} />
                                        Reject order
                                    </button>
                                </section>
                            </>
                        )}

                    {order.orderStatus ===
                        "CANCELLATION_REQUESTED" && (
                            <section className="staff-order-panel cancellation-decision-panel">
                                <h2>
                                    Cancellation request
                                </h2>

                                <div className="customer-request-reason">
                                <span>
                                    Customer reason
                                </span>

                                    <p>
                                        {
                                            order.cancellationReason
                                        }
                                    </p>
                                </div>

                                <label htmlFor="decisionNote">
                                    Decision note
                                </label>

                                <textarea
                                    id="decisionNote"
                                    rows="4"
                                    maxLength="500"
                                    value={decisionNote}
                                    onChange={(event) =>
                                        setDecisionNote(
                                            event.target.value
                                        )
                                    }
                                />

                                <div className="staff-action-row">
                                    <button
                                        type="button"
                                        className="danger-button"
                                        disabled={working}
                                        onClick={
                                            handleApproveCancellation
                                        }
                                    >
                                        <CheckCircle2
                                            size={17}
                                        />
                                        Approve cancellation
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        disabled={working}
                                        onClick={
                                            handleRejectCancellation
                                        }
                                    >
                                        Reject request
                                    </button>
                                </div>
                            </section>
                        )}

                    {nextStatus && (
                        <section className="staff-order-panel">
                            <h2>Update order progress</h2>

                            <label htmlFor="progressNote">
                                Progress note
                            </label>

                            <textarea
                                id="progressNote"
                                rows="3"
                                maxLength="500"
                                value={staffNote}
                                onChange={(event) =>
                                    setStaffNote(
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                className="primary-button"
                                disabled={working}
                                onClick={handleNextStatus}
                            >
                                {statusButtonLabels[
                                    nextStatus
                                    ]}
                            </button>

                            {nextStatus ===
                                "COMPLETED" &&
                                order.paymentStatus !==
                                "PAID" && (
                                    <p className="action-warning">
                                        Full payment is
                                        required before the
                                        sale can be completed.
                                    </p>
                                )}
                        </section>
                    )}

                    <section className="staff-order-panel">
                        <h2>Order status history</h2>

                        <OrderStatusTimeline
                            order={order}
                            history={history}
                        />
                    </section>
                </div>

                <aside className="staff-order-sidebar">
                    <section className="staff-order-panel">
                        <h2>Customer notes</h2>

                        <p className="staff-note-text">
                            {order.customerNote ||
                                "No customer note provided."}
                        </p>
                    </section>

                    <section className="staff-order-panel">
                        <div className="staff-panel-title">
                            <div>
                                <FilePlus2 size={19} />
                                <h2>Invoice</h2>
                            </div>
                        </div>

                        {invoice ? (
                            <div className="generated-invoice">
                                <span>
                                    Invoice number
                                </span>

                                <strong>
                                    {
                                        invoice.invoiceNumber
                                    }
                                </strong>

                                <span>
                                    {formatDateTime(
                                        invoice.generatedAt
                                    )}
                                </span>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        window.print()
                                    }
                                >
                                    <Printer size={17} />
                                    Print page
                                </button>
                            </div>
                        ) : canGenerateInvoice ? (
                            <button
                                type="button"
                                className="primary-button full-width-button"
                                disabled={working}
                                onClick={
                                    handleGenerateInvoice
                                }
                            >
                                <FilePlus2 size={17} />
                                Generate invoice
                            </button>
                        ) : (
                            <p className="empty-panel-text">
                                Confirm the order before
                                generating an invoice.
                            </p>
                        )}
                    </section>

                    <section className="staff-order-panel">
                        <div className="staff-panel-title">
                            <div>
                                <CreditCard size={19} />
                                <h2>Payment Details</h2>
                            </div>
                            <OrderStatusBadge
                                status={order.paymentStatus}
                            />
                        </div>

                        <div className="staff-payment-cards-grid">
                            <div className="payment-stat-tile">
                                <div className="payment-stat-tile-top">
                                    <span className="tile-label">Order Total</span>
                                    <Receipt size={15} className="tile-icon-dim" />
                                </div>
                                <strong className="tile-value">
                                    {formatCurrency(order.totalAmount)}
                                </strong>
                            </div>

                            <div className="payment-stat-tile">
                                <div className="payment-stat-tile-top">
                                    <span className="tile-label">Recorded Paid</span>
                                    <CheckCircle2 size={15} className="tile-icon-emerald" />
                                </div>
                                <strong
                                    className="tile-value"
                                    style={{
                                        color:
                                            totalPaid > 0
                                                ? "#4ade80"
                                                : "#94a3b8",
                                    }}
                                >
                                    {formatCurrency(totalPaid)}
                                </strong>
                            </div>

                            <div
                                className={`payment-stat-tile ${
                                    order.paymentStatus === "PAID"
                                        ? "paid-tile"
                                        : "highlight-tile"
                                }`}
                            >
                                <div className="payment-stat-tile-top">
                                    <span className="tile-label">
                                        {order.paymentStatus === "PAID"
                                            ? "Balance Due"
                                            : "Amount to Pay"}
                                    </span>
                                    <ShieldCheck
                                        size={15}
                                        className={
                                            order.paymentStatus === "PAID"
                                                ? "tile-icon-emerald"
                                                : "tile-icon-blue"
                                        }
                                    />
                                </div>
                                <strong className="tile-value">
                                    {formatCurrency(remainingAmount)}
                                </strong>
                            </div>
                        </div>

                        {order.paymentStatus === "PAID" && (
                            <div className="payment-status-notice success">
                                <CheckCircle2
                                    size={20}
                                    style={{ flexShrink: 0, marginTop: 2 }}
                                />
                                <div>
                                    <strong
                                        style={{
                                            display: "block",
                                            marginBottom: 2,
                                        }}
                                    >
                                        Order Fully Paid
                                    </strong>
                                    <span>
                                        All dues for this order have been cleared in full.
                                        No additional payment is required.
                                    </span>
                                </div>
                            </div>
                        )}

                        {order.orderStatus === "PENDING" &&
                            order.paymentStatus !== "PAID" && (
                                <div className="payment-status-notice info">
                                    <AlertCircle
                                        size={20}
                                        style={{
                                            flexShrink: 0,
                                            marginTop: 2,
                                        }}
                                    />
                                    <div>
                                        <strong
                                            style={{
                                                display: "block",
                                                marginBottom: 2,
                                            }}
                                        >
                                            Pending Order Confirmation
                                        </strong>
                                        <span>
                                            Verify stock and confirm the order before recording customer payment.
                                        </span>
                                    </div>
                                </div>
                            )}

                        {["CANCELLED", "REJECTED"].includes(
                            order.orderStatus
                        ) &&
                            order.paymentStatus !== "PAID" && (
                                <div className="payment-status-notice warning">
                                    <AlertCircle
                                        size={20}
                                        style={{
                                            flexShrink: 0,
                                            marginTop: 2,
                                        }}
                                    />
                                    <div>
                                        <strong
                                            style={{
                                                display: "block",
                                                marginBottom: 2,
                                            }}
                                        >
                                            Order Inactive
                                        </strong>
                                        <span>
                                            Payment cannot be recorded because this order has been {order.orderStatus.toLowerCase()}.
                                        </span>
                                    </div>
                                </div>
                            )}

                        {canRecordPayment &&
                            order.paymentStatus !== "PAID" &&
                            remainingAmount > 0 && (
                                <form
                                    className="staff-payment-form"
                                    onSubmit={handlePaymentSubmit}
                                >
                                    <div className="payment-amount-hero-card">
                                        <div className="payment-amount-hero-top">
                                            <span
                                                style={{
                                                    fontSize: "0.82rem",
                                                    fontWeight: 600,
                                                    color: "#94a3b8",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.04em",
                                                }}
                                            >
                                                Amount to Pay (Full Payment)
                                            </span>
                                            <span className="payment-amount-badge">
                                                <Lock size={12} />
                                                Auto-Calculated Balance
                                            </span>
                                        </div>
                                        <div className="payment-amount-hero-value">
                                            {formatCurrency(remainingAmount)}
                                        </div>
                                        <p className="payment-amount-hero-caption">
                                            Sales Staff cannot edit the payment amount manually. System automatically records the full outstanding balance ({formatCurrency(order.totalAmount)} total − {formatCurrency(totalPaid)} paid).
                                        </p>
                                    </div>

                                    <label className="payment-section-label">
                                        Select Payment Method
                                    </label>
                                    <div className="payment-method-selector">
                                        <button
                                            type="button"
                                            className={`payment-method-option ${
                                                paymentForm.paymentMethod ===
                                                "CASH"
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setPaymentForm((current) => ({
                                                    ...current,
                                                    paymentMethod: "CASH",
                                                }))
                                            }
                                        >
                                            <div className="method-icon-wrap">
                                                <Banknote size={20} />
                                            </div>
                                            <span>Cash</span>
                                            {paymentForm.paymentMethod === "CASH" && (
                                                <span className="payment-method-selected-check">
                                                    <Check size={11} />
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            className={`payment-method-option ${
                                                paymentForm.paymentMethod ===
                                                "CARD"
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setPaymentForm((current) => ({
                                                    ...current,
                                                    paymentMethod: "CARD",
                                                }))
                                            }
                                        >
                                            <div className="method-icon-wrap">
                                                <CreditCard size={20} />
                                            </div>
                                            <span>Card</span>
                                            {paymentForm.paymentMethod === "CARD" && (
                                                <span className="payment-method-selected-check">
                                                    <Check size={11} />
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            className={`payment-method-option ${
                                                paymentForm.paymentMethod ===
                                                "BANK_TRANSFER"
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setPaymentForm((current) => ({
                                                    ...current,
                                                    paymentMethod:
                                                        "BANK_TRANSFER",
                                                }))
                                            }
                                        >
                                            <div className="method-icon-wrap">
                                                <Landmark size={20} />
                                            </div>
                                            <span>Bank Transfer</span>
                                            {paymentForm.paymentMethod === "BANK_TRANSFER" && (
                                                <span className="payment-method-selected-check">
                                                    <Check size={11} />
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    <label htmlFor="paymentExternalRef">
                                        External Reference / Slip No.
                                    </label>
                                    <input
                                        id="paymentExternalRef"
                                        type="text"
                                        maxLength="100"
                                        placeholder={
                                            paymentForm.paymentMethod === "CASH"
                                                ? "Optional cash register receipt / drawer reference"
                                                : paymentForm.paymentMethod ===
                                                  "CARD"
                                                ? "POS approval code / transaction reference"
                                                : "Bank deposit slip number / reference"
                                        }
                                        value={paymentForm.externalReference}
                                        onChange={(event) =>
                                            setPaymentForm((current) => ({
                                                ...current,
                                                externalReference:
                                                    event.target.value,
                                            }))
                                        }
                                    />

                                    <label htmlFor="paymentNote">
                                        Payment Note
                                    </label>
                                    <textarea
                                        id="paymentNote"
                                        rows="2"
                                        maxLength="500"
                                        placeholder="Optional note (e.g. Counter payment received in full)"
                                        value={paymentForm.note}
                                        onChange={(event) =>
                                            setPaymentForm((current) => ({
                                                ...current,
                                                note: event.target.value,
                                            }))
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="primary-button full-width-button"
                                        disabled={
                                            working ||
                                            remainingAmount <= 0 ||
                                            order.paymentStatus === "PAID" ||
                                            [
                                                "CANCELLED",
                                                "REJECTED",
                                            ].includes(order.orderStatus)
                                        }
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            padding: "13px",
                                            fontSize: "0.95rem",
                                            fontWeight: "700",
                                        }}
                                    >
                                        {working ? (
                                            <>
                                                <RefreshCcw
                                                    size={16}
                                                    className="spinning-icon"
                                                />
                                                <span>
                                                    Recording Payment...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={18} />
                                                <span>
                                                    Record Full Payment •{" "}
                                                    {formatCurrency(
                                                        remainingAmount
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                        <div style={{ marginTop: "24px" }}>
                            <h3
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <Receipt size={16} />
                                Payment History ({payments.length})
                            </h3>

                            {payments.length === 0 ? (
                                <p className="empty-panel-text">
                                    No payment records found for this order.
                                </p>
                            ) : (
                                <div className="staff-payment-history-list">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.paymentId}
                                            className="payment-history-card"
                                        >
                                            <div className="payment-history-header">
                                                <div>
                                                    <span className="payment-history-amount">
                                                        {formatCurrency(
                                                            payment.amount
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`payment-history-method-tag method-tag-${(
                                                            payment.paymentMethod ||
                                                            ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {payment.paymentMethod ===
                                                            "CASH" && (
                                                            <Banknote size={12} />
                                                        )}
                                                        {payment.paymentMethod ===
                                                            "CARD" && (
                                                            <CreditCard
                                                                size={12}
                                                            />
                                                        )}
                                                        {payment.paymentMethod ===
                                                            "BANK_TRANSFER" && (
                                                            <Landmark
                                                                size={12}
                                                            />
                                                        )}
                                                        {payment.paymentMethod}
                                                    </span>
                                                </div>
                                                <OrderStatusBadge
                                                    status={payment.status}
                                                />
                                            </div>

                                            <div className="payment-history-meta">
                                                <span>
                                                    <Receipt size={13} />
                                                    {payment.paymentReference}
                                                </span>
                                                <span>
                                                    <Clock size={13} />
                                                    {formatDateTime(
                                                        payment.paidAt ||
                                                            payment.createdAt
                                                    )}
                                                </span>
                                                {payment.recordedByName && (
                                                    <span>
                                                        <UserCheck size={13} />
                                                        {payment.recordedByName}
                                                    </span>
                                                )}
                                                {payment.externalReference && (
                                                    <span>
                                                        Ref:{" "}
                                                        {
                                                            payment.externalReference
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            {payment.note && (
                                                <p className="payment-history-note">
                                                    &ldquo;{payment.note}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {refund && (
                        <section className="staff-order-panel refund-panel">
                            <RotateCcw size={20} />

                            <h2>Refund recorded</h2>

                            <strong>
                                {formatCurrency(
                                    refund.amount
                                )}
                            </strong>

                            <span>
                                {refund.refundReference}
                            </span>
                        </section>
                    )}
                </aside>
            </div>
        </main>
    );
};

export default StaffOrderDetailsPage;