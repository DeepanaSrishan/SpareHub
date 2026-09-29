import { useEffect, useState } from "react";
import {
    Ban,
    PackageCheck,
    X,
} from "lucide-react";

function PurchaseActionModal({
                                 open,
                                 mode,
                                 purchase,
                                 saving,
                                 onClose,
                                 onSubmit,
                             }) {
    const [receivedQuantity, setReceivedQuantity] =
        useState("");
<<<<<<< HEAD
    const [supplierInvoiceNumber, setSupplierInvoiceNumber] =
        useState("");
=======

>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const receiving = mode === "receive";

    useEffect(() => {
        if (open && purchase) {
            setReceivedQuantity(
                String(purchase.orderedQuantity ?? "")
            );
<<<<<<< HEAD
            setSupplierInvoiceNumber(
                purchase.supplierInvoiceNumber || (purchase.purchaseNumber ? `INV-${purchase.purchaseNumber}` : "")
            );
=======

>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
            setNotes("");
            setError("");
        }
    }, [open, purchase]);

    if (!open || !purchase) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (receiving) {
            if (
                !receivedQuantity ||
                Number(receivedQuantity) < 1
            ) {
                setError(
                    "Received quantity must be at least 1"
                );
                return;
            }

            /*
             * Step 4 backend currently accepts full receiving.
             */
            if (
                Number(receivedQuantity) !==
                Number(purchase.orderedQuantity)
            ) {
                setError(
                    `Received quantity must equal ordered quantity (${purchase.orderedQuantity}).`
                );
                return;
            }

<<<<<<< HEAD
            const invoiceNo = supplierInvoiceNumber.trim() || `INV-${purchase.purchaseNumber || Date.now()}`;

=======
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
            await onSubmit({
                receivedQuantity: Number(
                    receivedQuantity
                ),
<<<<<<< HEAD
                supplierInvoiceNumber: invoiceNo,
=======
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
                notes: notes.trim() || null,
            });
        } else {
            if (!notes.trim()) {
                setError(
                    "Cancellation reason is required"
                );
                return;
            }

            await onSubmit({
                reason: notes.trim(),
            });
        }
    };

    return (
        <div className="supplier-modal-overlay">
            <div className="supplier-modal purchase-action-modal">
                <div className="supplier-modal-header">
                    <div>
            <span
                className={`supplier-modal-icon ${
                    receiving ? "" : "danger"
                }`}
            >
              {receiving ? (
                  <PackageCheck size={21} />
              ) : (
                  <Ban size={21} />
              )}
            </span>

                        <div>
                            <h2>
                                {receiving
                                    ? "Receive Purchase"
                                    : "Cancel Purchase"}
                            </h2>

                            <p>
                                {purchase.purchaseNumber}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="supplier-icon-button"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    className="supplier-form"
                    onSubmit={handleSubmit}
                >
                    <div className="purchase-action-summary">
                        <span>Product</span>
                        <strong>
                            {getProductName(purchase)}
                        </strong>

                        <span>Ordered Quantity</span>
                        <strong>
                            {purchase.orderedQuantity}
                        </strong>
                    </div>

                    {receiving && (
<<<<<<< HEAD
                        <>
                            <div className="supplier-form-group">
                                <label>Received Quantity *</label>

                                <input
                                    type="number"
                                    min="1"
                                    max={purchase.orderedQuantity}
                                    value={receivedQuantity}
                                    onChange={(event) => {
                                        setReceivedQuantity(
                                            event.target.value
                                        );
                                        setError("");
                                    }}
                                />
                            </div>

                            <div className="supplier-form-group">
                                <label>Supplier Invoice Number *</label>

                                <input
                                    type="text"
                                    value={supplierInvoiceNumber}
                                    onChange={(event) => {
                                        setSupplierInvoiceNumber(
                                            event.target.value
                                        );
                                        setError("");
                                    }}
                                    placeholder="e.g. INV-2026-001"
                                />
                            </div>
                        </>
=======
                        <div className="supplier-form-group">
                            <label>Received Quantity *</label>

                            <input
                                type="number"
                                min="1"
                                max={purchase.orderedQuantity}
                                value={receivedQuantity}
                                onChange={(event) => {
                                    setReceivedQuantity(
                                        event.target.value
                                    );
                                    setError("");
                                }}
                            />
                        </div>
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
                    )}

                    <div className="supplier-form-group purchase-notes">
                        <label>
                            {receiving
                                ? "Receiving Notes"
                                : "Cancellation Reason *"}
                        </label>

                        <textarea
                            rows="3"
                            value={notes}
                            onChange={(event) => {
                                setNotes(event.target.value);
                                setError("");
                            }}
                            placeholder={
                                receiving
                                    ? "Optional receiving notes"
                                    : "Enter cancellation reason"
                            }
                        />
                    </div>

                    {error && (
                        <p className="supplier-field-error">
                            {error}
                        </p>
                    )}

                    <div className="supplier-modal-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            className={`supplier-button ${
                                receiving ? "primary" : "danger"
                            }`}
                            disabled={saving}
                        >
                            {receiving ? (
                                <PackageCheck size={17} />
                            ) : (
                                <Ban size={17} />
                            )}

                            {saving
                                ? "Processing..."
                                : receiving
                                    ? "Confirm Receiving"
                                    : "Confirm Cancellation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getProductName(purchase) {
    return (
        purchase?.sparePartName ||
        purchase?.productName ||
        purchase?.sparePart?.name ||
        "Product"
    );
}

export default PurchaseActionModal;