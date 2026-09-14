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
    Check,
    CheckCircle2,
    CreditCard,
    FilePlus2,
    PackageCheck,
    Printer,
    RefreshCcw,
    RotateCcw,
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
        amount: "",
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

        const amount = Number(paymentForm.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError(
                "Enter a valid payment amount."
            );
            return;
        }

        executeAction(
            () =>
                staffOrderService.recordPayment(
                    orderId,
                    {
                        amount,
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
            "Payment recorded successfully."
        );

        setPaymentForm({
            amount: "",
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
        .filter((payment) =>
            ["PAID", "REFUNDED"].includes(
                payment.status
            )
        )
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
                    <span>Order number</span>
                    <h1>{order.orderNumber}</h1>

                    <p>
                        {order.customerName}
                        {" · "}
                        {order.customerEmail}
                        {" · "}
                        {formatDateTime(order.createdAt)}
                    </p>
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
                                <h2>Payments</h2>
                            </div>
                        </div>

                        <div className="staff-payment-summary">
                            <div>
                                <span>Order total</span>
                                <strong>
                                    {formatCurrency(
                                        order.totalAmount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Recorded</span>
                                <strong>
                                    {formatCurrency(
                                        totalPaid
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Remaining</span>
                                <strong>
                                    {formatCurrency(
                                        remainingAmount
                                    )}
                                </strong>
                            </div>
                        </div>

                        {canRecordPayment &&
                            order.paymentStatus !==
                            "PAID" && (
                                <form
                                    className="staff-payment-form"
                                    onSubmit={
                                        handlePaymentSubmit
                                    }
                                >
                                    <label>
                                        Payment amount
                                    </label>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        max={
                                            remainingAmount
                                        }
                                        required
                                        value={
                                            paymentForm.amount
                                        }
                                        onChange={(event) =>
                                            setPaymentForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    amount:
                                                    event
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                    />

                                    <label>
                                        Payment method
                                    </label>

                                    <select
                                        value={
                                            paymentForm.paymentMethod
                                        }
                                        onChange={(event) =>
                                            setPaymentForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    paymentMethod:
                                                    event
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                    >
                                        <option value="CASH">
                                            Cash
                                        </option>

                                        <option value="CARD">
                                            Card
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank transfer
                                        </option>
                                    </select>

                                    <label>
                                        External reference
                                    </label>

                                    <input
                                        type="text"
                                        maxLength="100"
                                        value={
                                            paymentForm.externalReference
                                        }
                                        onChange={(event) =>
                                            setPaymentForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    externalReference:
                                                    event
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                    />

                                    <label>
                                        Note
                                    </label>

                                    <textarea
                                        rows="3"
                                        maxLength="500"
                                        value={
                                            paymentForm.note
                                        }
                                        onChange={(event) =>
                                            setPaymentForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    note: event
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="primary-button full-width-button"
                                        disabled={working}
                                    >
                                        Record payment
                                    </button>
                                </form>
                            )}

                        <div className="staff-payment-history">
                            {payments.map((payment) => (
                                <article
                                    key={
                                        payment.paymentId
                                    }
                                >
                                    <div>
                                        <strong>
                                            {formatCurrency(
                                                payment.amount
                                            )}
                                        </strong>

                                        <span>
                                            {
                                                payment.paymentMethod
                                            }
                                        </span>
                                    </div>

                                    <OrderStatusBadge
                                        status={
                                            payment.status
                                        }
                                    />
                                </article>
                            ))}
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