import {
    AlertTriangle,
    CheckCircle2,
    PackageCheck,
} from "lucide-react";

const StockVerificationPanel = ({
                                    verification,
                                }) => {
    if (!verification) {
        return null;
    }

    return (
        <section
            className={`stock-verification-panel ${
                verification.allItemsAvailable
                    ? "stock-success"
                    : "stock-failed"
            }`}
        >
            <header>
                {verification.allItemsAvailable ? (
                    <CheckCircle2 size={22} />
                ) : (
                    <AlertTriangle size={22} />
                )}

                <div>
                    <h3>Stock verification</h3>

                    <p>
                        {verification.allItemsAvailable
                            ? "All ordered items are currently available."
                            : "One or more items cannot be supplied."}
                    </p>
                </div>
            </header>

            <div className="stock-verification-items">
                {verification.items?.map((item) => (
                    <article
                        key={
                            item.sparePartId ??
                            item.partNumber
                        }
                    >
                        <div>
                            <PackageCheck size={18} />

                            <section>
                                <strong>
                                    {item.productName}
                                </strong>

                                <span>
                                    {item.partNumber}
                                </span>
                            </section>
                        </div>

                        <div className="stock-values">
                            <span>
                                Requested:{" "}
                                {item.requestedQuantity}
                            </span>

                            <span>
                                Available:{" "}
                                {item.availableQuantity}
                            </span>

                            <strong
                                className={
                                    item.sufficientStock
                                        ? "text-success"
                                        : "text-danger"
                                }
                            >
                                {item.message}
                            </strong>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default StockVerificationPanel;