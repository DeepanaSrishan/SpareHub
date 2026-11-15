const statusLabels = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    READY: "Ready",
    COMPLETED: "Completed",
    CANCELLATION_REQUESTED:
        "Cancellation requested",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",

    PARTIALLY_PAID: "Partially paid",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
};

const OrderStatusBadge = ({ status }) => {
    const normalizedStatus =
        status || "UNKNOWN";

    const className = normalizedStatus
        .toLowerCase()
        .replaceAll("_", "-");

    return (
        <span
            className={`order-status-badge status-${className}`}
        >
            {statusLabels[normalizedStatus] ??
                normalizedStatus}
        </span>
    );
};

export default OrderStatusBadge;