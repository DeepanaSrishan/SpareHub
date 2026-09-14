import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    History,
    PackageMinus,
    PackagePlus,
    Save,
    Settings2,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import inventoryStockService from "../../services/inventoryStockService";
import "../../styles/inventoryOperations.css";

const initialAdjustment = {
    adjustmentType: "STOCK_IN",
    quantity: "",
    reason: "",
    referenceNumber: "",
};

export default function StockAdjustmentPage() {
    const { productId } = useParams();

    const [product, setProduct] = useState(null);
    const [transactions, setTransactions] =
        useState([]);

    const [adjustment, setAdjustment] =
        useState(initialAdjustment);

    const [reorderLevel, setReorderLevel] =
        useState("");

    const [historyPage, setHistoryPage] =
        useState(0);
    const [historyTotalPages, setHistoryTotalPages] =
        useState(0);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] =
        useState(true);
    const [adjusting, setAdjusting] =
        useState(false);
    const [reorderSaving, setReorderSaving] =
        useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadProduct();
    }, [productId]);

    useEffect(() => {
        loadTransactions();
    }, [productId, historyPage]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryStockService
                    .getProductById(productId);

            setProduct(data);
            setReorderLevel(
                data?.reorderLevel ?? 0
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product details load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            setHistoryLoading(true);

            const data =
                await inventoryStockService
                    .getProductTransactions(
                        productId,
                        historyPage,
                        10
                    );

            if (Array.isArray(data)) {
                setTransactions(data);
                setHistoryTotalPages(
                    data.length ? 1 : 0
                );
            } else {
                setTransactions(data?.content ?? []);
                setHistoryTotalPages(
                    data?.totalPages ?? 0
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Transaction history load කිරීම අසාර්ථකයි."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleAdjustmentChange = (event) => {
        const { name, value } = event.target;

        setAdjustment((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const isDecreaseType = (type) =>
        [
            "DAMAGED",
            "MISSING",
            "CORRECTION_DECREASE",
        ].includes(type);

    const getExpectedStock = () => {
        if (!product || !adjustment.quantity) {
            return product?.stockQuantity ?? 0;
        }

        const quantity = Number(
            adjustment.quantity
        );

        if (
            isDecreaseType(
                adjustment.adjustmentType
            )
        ) {
            return product.stockQuantity - quantity;
        }

        return product.stockQuantity + quantity;
    };

    const handleAdjustmentSubmit = async (
        event
    ) => {
        event.preventDefault();

        const quantity = Number(
            adjustment.quantity
        );

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError(
                "Quantity එක positive whole number එකක් විය යුතුයි."
            );
            return;
        }

        if (adjustment.reason.trim().length < 3) {
            setError(
                "Adjustment reason එක අවම characters 3ක් විය යුතුයි."
            );
            return;
        }

        if (
            isDecreaseType(
                adjustment.adjustmentType
            ) &&
            quantity > product.stockQuantity
        ) {
            setError(
                `Current stock quantity ${product.stockQuantity} පමණයි.`
            );
            return;
        }

        const confirmed = window.confirm(
            `Current stock ${product.stockQuantity} සිට ${getExpectedStock()} දක්වා වෙනස් කරන්නද?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setAdjusting(true);
            setError("");
            setMessage("");

            const data =
                await inventoryStockService.adjustStock(
                    productId,
                    {
                        adjustmentType:
                        adjustment.adjustmentType,
                        quantity,
                        reason: adjustment.reason.trim(),
                        referenceNumber:
                            adjustment.referenceNumber.trim(),
                    }
                );

            setProduct((current) => ({
                ...current,
                stockQuantity: data.stockQuantity,
                reorderLevel: data.reorderLevel,
                available: data.available,
                lowStock: data.lowStock,
            }));

            setAdjustment(initialAdjustment);
            setHistoryPage(0);

            await loadTransactions();

            setMessage(
                "Stock adjustment එක සාර්ථකව record කළා."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                Object.values(
                    err.response?.data?.errors ?? {}
                ).join(", ") ||
                "Stock adjustment කිරීම අසාර්ථකයි."
            );
        } finally {
            setAdjusting(false);
        }
    };

    const handleReorderSubmit = async (
        event
    ) => {
        event.preventDefault();

        const newReorderLevel =
            Number(reorderLevel);

        if (
            !Number.isInteger(newReorderLevel) ||
            newReorderLevel < 0
        ) {
            setError(
                "Reorder level එක zero හෝ positive whole number එකක් විය යුතුයි."
            );
            return;
        }

        try {
            setReorderSaving(true);
            setError("");
            setMessage("");

            const data =
                await inventoryStockService
                    .updateReorderLevel(
                        productId,
                        newReorderLevel
                    );

            setProduct((current) => ({
                ...current,
                reorderLevel: data.reorderLevel,
                lowStock: data.lowStock,
            }));

            setReorderLevel(data.reorderLevel);

            setMessage(
                "Reorder level එක සාර්ථකව update කළා."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Reorder level update කිරීම අසාර්ථකයි."
            );
        } finally {
            setReorderSaving(false);
        }
    };

    const getTransactionClass = (quantity) =>
        quantity > 0 ? "increase" : "decrease";

    const formatDate = (value) =>
        value
            ? new Date(value).toLocaleString()
            : "—";

    if (loading) {
        return (
            <div className="stock-page-message">
                Loading stock information...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="stock-alert error">
                Product එක හමු වුණේ නැහැ.
            </div>
        );
    }

    return (
        <main className="stock-page">
            <Link
                to="/inventory/products"
                className="stock-back-link"
            >
                <ArrowLeft size={17} />
                Back to Inventory
            </Link>

            <div className="stock-heading">
                <div>
                    <h1>Stock Management</h1>
                    <p>
                        {product.name} · {product.partNumber}
                    </p>
                </div>

                <span
                    className={`stock-product-status ${
                        product.status?.toLowerCase()
                    }`}
                >
          {product.status}
        </span>
            </div>

            {error && (
                <div className="stock-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="stock-alert success">
                    {message}
                </div>
            )}

            <section className="stock-stat-grid">
                <article
                    className={`stock-stat-card ${
                        product.lowStock ? "warning" : ""
                    }`}
                >
                    <span>Current Stock</span>
                    <strong>{product.stockQuantity}</strong>

                    {product.lowStock && (
                        <small>
                            <AlertTriangle size={14} />
                            Low stock
                        </small>
                    )}
                </article>

                <article className="stock-stat-card">
                    <span>Reorder Level</span>
                    <strong>{product.reorderLevel}</strong>
                </article>

                <article className="stock-stat-card">
                    <span>Availability</span>
                    <strong>
                        {product.available
                            ? "Available"
                            : "Unavailable"}
                    </strong>
                </article>

                <article className="stock-stat-card">
                    <span>Expected New Stock</span>
                    <strong
                        className={
                            getExpectedStock() < 0
                                ? "negative-value"
                                : ""
                        }
                    >
                        {getExpectedStock()}
                    </strong>
                </article>
            </section>

            <div className="stock-operation-grid">
                <section className="stock-card">
                    <div className="stock-card-title">
                        <PackagePlus size={21} />
                        <h2>Record Stock Adjustment</h2>
                    </div>

                    <form
                        className="stock-form"
                        onSubmit={handleAdjustmentSubmit}
                    >
                        <div className="stock-form-group">
                            <label htmlFor="adjustmentType">
                                Adjustment Type
                            </label>

                            <select
                                id="adjustmentType"
                                name="adjustmentType"
                                value={
                                    adjustment.adjustmentType
                                }
                                onChange={
                                    handleAdjustmentChange
                                }
                            >
                                <option value="STOCK_IN">
                                    Stock In
                                </option>

                                <option value="DAMAGED">
                                    Damaged Items
                                </option>

                                <option value="MISSING">
                                    Missing Items
                                </option>

                                <option value="CORRECTION_INCREASE">
                                    Correction Increase
                                </option>

                                <option value="CORRECTION_DECREASE">
                                    Correction Decrease
                                </option>
                            </select>
                        </div>

                        <div className="stock-form-group">
                            <label htmlFor="quantity">
                                Quantity
                            </label>

                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                step="1"
                                value={adjustment.quantity}
                                onChange={
                                    handleAdjustmentChange
                                }
                                required
                            />
                        </div>

                        <div className="stock-preview">
                            <span>Stock change</span>

                            <strong>
                                {isDecreaseType(
                                    adjustment.adjustmentType
                                )
                                    ? "-"
                                    : "+"}
                                {adjustment.quantity || 0}
                            </strong>
                        </div>

                        <div className="stock-form-group">
                            <label htmlFor="reason">
                                Reason
                            </label>

                            <textarea
                                id="reason"
                                name="reason"
                                rows={4}
                                value={adjustment.reason}
                                onChange={
                                    handleAdjustmentChange
                                }
                                maxLength={500}
                                required
                            />
                        </div>

                        <div className="stock-form-group">
                            <label htmlFor="referenceNumber">
                                Reference Number
                            </label>

                            <input
                                id="referenceNumber"
                                name="referenceNumber"
                                value={
                                    adjustment.referenceNumber
                                }
                                onChange={
                                    handleAdjustmentChange
                                }
                                placeholder="DEL-2026-001"
                                maxLength={100}
                            />
                        </div>

                        <button
                            type="submit"
                            className="stock-primary-button"
                            disabled={adjusting}
                        >
                            {isDecreaseType(
                                adjustment.adjustmentType
                            ) ? (
                                <PackageMinus size={18} />
                            ) : (
                                <PackagePlus size={18} />
                            )}

                            {adjusting
                                ? "Recording..."
                                : "Record Adjustment"}
                        </button>
                    </form>
                </section>

                <section className="stock-card">
                    <div className="stock-card-title">
                        <Settings2 size={21} />
                        <h2>Reorder Level</h2>
                    </div>

                    <p className="stock-card-description">
                        Low-stock alert එක trigger විය යුතු
                        minimum quantity එක define කරන්න.
                    </p>

                    <form
                        className="stock-form"
                        onSubmit={handleReorderSubmit}
                    >
                        <div className="stock-form-group">
                            <label htmlFor="reorderLevel">
                                Reorder Level
                            </label>

                            <input
                                id="reorderLevel"
                                type="number"
                                min="0"
                                step="1"
                                value={reorderLevel}
                                onChange={(event) =>
                                    setReorderLevel(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="stock-secondary-button"
                            disabled={reorderSaving}
                        >
                            <Save size={18} />

                            {reorderSaving
                                ? "Saving..."
                                : "Update Reorder Level"}
                        </button>
                    </form>

                    <div className="stock-rule-box">
                        <strong>Low-stock rule</strong>

                        <span>
              Current stock ≤ Reorder level
            </span>
                    </div>
                </section>
            </div>

            <section className="stock-card">
                <div className="stock-card-title">
                    <History size={21} />
                    <h2>Inventory Transaction History</h2>
                </div>

                {historyLoading ? (
                    <div className="stock-page-message">
                        Loading transaction history...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="stock-empty">
                        No inventory transactions found.
                    </div>
                ) : (
                    <div className="stock-table-wrapper">
                        <table className="stock-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Change</th>
                                <th>Before</th>
                                <th>After</th>
                                <th>Reason</th>
                                <th>Reference</th>
                                <th>Performed By</th>
                            </tr>
                            </thead>

                            <tbody>
                            {transactions.map(
                                (transaction) => (
                                    <tr key={transaction.id}>
                                        <td>
                                            {formatDate(
                                                transaction.createdAt
                                            )}
                                        </td>

                                        <td>
                        <span className="stock-type">
                          {
                              transaction.transactionType
                          }
                        </span>
                                        </td>

                                        <td>
                                            <strong
                                                className={`stock-change ${getTransactionClass(
                                                    transaction.quantityChange
                                                )}`}
                                            >
                                                {transaction.quantityChange >
                                                0
                                                    ? "+"
                                                    : ""}
                                                {
                                                    transaction.quantityChange
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                transaction.quantityBefore
                                            }
                                        </td>

                                        <td>
                                            {
                                                transaction.quantityAfter
                                            }
                                        </td>

                                        <td>
                                            {transaction.reason}
                                        </td>

                                        <td>
                                            {transaction.referenceNumber ||
                                                "—"}
                                        </td>

                                        <td>
                                            {
                                                transaction.performedByEmail
                                            }
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {historyTotalPages > 1 && (
                    <div className="stock-pagination">
                        <button
                            disabled={historyPage === 0}
                            onClick={() =>
                                setHistoryPage(
                                    (current) => current - 1
                                )
                            }
                        >
                            Previous
                        </button>

                        <span>
              Page {historyPage + 1} of{" "}
                            {historyTotalPages}
            </span>

                        <button
                            disabled={
                                historyPage + 1 >=
                                historyTotalPages
                            }
                            onClick={() =>
                                setHistoryPage(
                                    (current) => current + 1
                                )
                            }
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}