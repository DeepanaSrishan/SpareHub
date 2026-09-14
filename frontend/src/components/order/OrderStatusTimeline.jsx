import {
    Check,
    Circle,
    Clock3,
} from "lucide-react";

const formatDateTime = (value) => {
    if (!value) {
        return "Time unavailable";
    }

    return new Intl.DateTimeFormat("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const OrderStatusTimeline = ({
                                 order,
                                 history = [],
                             }) => {
    const timelineItems = [
        {
            key: "ORDER_PLACED",
            label: "Order placed",
            description:
                "Your order was submitted to SpareHub.",
            date: order.createdAt,
            changedByName: "Customer",
        },

        ...history.map((item) => ({
            key: `${item.id}-${item.newStatus}`,
            label: item.newStatus
                ?.replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                ),
            description:
                item.note || "Order status updated.",
            date: item.changedAt,
            changedByName:
                item.changedByName || "SpareHub",
        })),
    ];

    return (
        <div className="order-timeline">
            {timelineItems.map((item, index) => {
                const isLast =
                    index === timelineItems.length - 1;

                return (
                    <div
                        className="timeline-item"
                        key={item.key}
                    >
                        <div className="timeline-marker-column">
                            <div
                                className={
                                    isLast
                                        ? "timeline-marker current"
                                        : "timeline-marker complete"
                                }
                            >
                                {isLast ? (
                                    <Circle size={13} />
                                ) : (
                                    <Check size={13} />
                                )}
                            </div>

                            {!isLast && (
                                <div className="timeline-line" />
                            )}
                        </div>

                        <div className="timeline-content">
                            <strong>{item.label}</strong>

                            <p>{item.description}</p>

                            <span>
                                <Clock3 size={14} />
                                {formatDateTime(item.date)}
                                {" · "}
                                {item.changedByName}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderStatusTimeline;