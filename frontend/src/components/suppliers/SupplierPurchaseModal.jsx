import { useEffect, useMemo, useState } from "react";
import {
    ClipboardPlus,
    Save,
    X,
} from "lucide-react";

const initialForm = {
    supplierId: "",
    supplierProductId: "",
    orderedQuantity: "",
    expectedDeliveryDate: "",
    supplierInvoiceNumber: "",
    notes: "",
};

function SupplierPurchaseModal({
                                   open,
                                   suppliers,
                                   supplierProducts,
                                   productsLoading,
                                   saving,
                                   onSupplierChange,
                                   onClose,
                                   onSubmit,
                               }) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setForm(initialForm);
            setErrors({});
        }
    }, [open]);

    const selectedSupplierProduct = useMemo(
        () =>
            supplierProducts.find(
                (item) =>
<<<<<<< HEAD
                    Number(item.supplierProductId ?? item.id) ===
=======
                    Number(item.id) ===
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
                    Number(form.supplierProductId)
            ),
        [supplierProducts, form.supplierProductId]
    );

    const estimatedTotal =
        Number(form.orderedQuantity || 0) *
        Number(getPurchasePrice(selectedSupplierProduct));

    if (!open) return null;

    const handleChange = async (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        if (name === "supplierId") {
            setForm((previous) => ({
                ...previous,
                supplierId: value,
                supplierProductId: "",
            }));

            await onSupplierChange(value);
        }
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.supplierId) {
            nextErrors.supplierId =
                "Supplier is required";
        }

        if (!form.supplierProductId) {
            nextErrors.supplierProductId =
                "Supplied product is required";
        }

        if (
            !form.orderedQuantity ||
            Number(form.orderedQuantity) < 1
        ) {
            nextErrors.orderedQuantity =
                "Quantity must be at least 1";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        await onSubmit({
<<<<<<< HEAD
            supplierId: Number(form.supplierId),
            supplierProductId: Number(
                form.supplierProductId
            ),
            quantity: Number(
                form.orderedQuantity
            ),
=======
            supplierProductId: Number(
                form.supplierProductId
            ),
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
            orderedQuantity: Number(
                form.orderedQuantity
            ),
            expectedDeliveryDate:
                form.expectedDeliveryDate || null,
            supplierInvoiceNumber:
                form.supplierInvoiceNumber.trim() || null,
            notes: form.notes.trim() || null,
        });
    };

    return (
        <div className="supplier-modal-overlay">
            <div className="supplier-modal">
                <div className="supplier-modal-header">
                    <div>
            <span className="supplier-modal-icon">
              <ClipboardPlus size={21} />
            </span>

                        <div>
                            <h2>Create Supplier Purchase</h2>
                            <p>
                                Record a new purchase order from a supplier.
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
                    <div className="supplier-form-grid">
                        <FormGroup
                            label="Supplier *"
                            error={errors.supplierId}
                        >
                            <select
                                name="supplierId"
                                value={form.supplierId}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select supplier
                                </option>

                                {suppliers
                                    .filter(isSupplierActive)
                                    .map((supplier) => (
                                        <option
                                            key={supplier.id}
                                            value={supplier.id}
                                        >
                                            {supplier.supplierCode} -{" "}
                                            {getSupplierName(supplier)}
                                        </option>
                                    ))}
                            </select>
                        </FormGroup>

                        <FormGroup
                            label="Supplied Product *"
                            error={errors.supplierProductId}
                        >
                            <select
                                name="supplierProductId"
                                value={form.supplierProductId}
                                onChange={handleChange}
                                disabled={
                                    !form.supplierId ||
                                    productsLoading
                                }
                            >
                                <option value="">
                                    {productsLoading
                                        ? "Loading products..."
                                        : "Select product"}
                                </option>

<<<<<<< HEAD
                                {supplierProducts.map((item) => {
                                    const spId = item.supplierProductId ?? item.id;
                                    return (
                                        <option
                                            key={spId}
                                            value={spId}
                                        >
                                            {getPartNumber(item)} -{" "}
                                            {getProductName(item)} (
                                            {formatCurrency(
                                                getPurchasePrice(item)
                                            )}
                                            )
                                        </option>
                                    );
                                })}
=======
                                {supplierProducts.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {getPartNumber(item)} -{" "}
                                        {getProductName(item)} (
                                        {formatCurrency(
                                            getPurchasePrice(item)
                                        )}
                                        )
                                    </option>
                                ))}
>>>>>>> af34a2e48a082232e60f2d1309ac7472f906ec99
                            </select>
                        </FormGroup>

                        <FormGroup
                            label="Ordered Quantity *"
                            error={errors.orderedQuantity}
                        >
                            <input
                                name="orderedQuantity"
                                type="number"
                                min="1"
                                value={form.orderedQuantity}
                                onChange={handleChange}
                                placeholder="10"
                            />
                        </FormGroup>

                        <FormGroup label="Expected Delivery Date">
                            <input
                                name="expectedDeliveryDate"
                                type="date"
                                min={new Date()
                                    .toISOString()
                                    .split("T")[0]}
                                value={form.expectedDeliveryDate}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        <FormGroup label="Supplier Invoice Number">
                            <input
                                name="supplierInvoiceNumber"
                                value={form.supplierInvoiceNumber}
                                onChange={handleChange}
                                placeholder="Example: INV-SUP-1001"
                            />
                        </FormGroup>

                        <div className="purchase-total-preview">
                            <span>Estimated Total</span>
                            <strong>
                                {formatCurrency(estimatedTotal)}
                            </strong>

                            <small>
                                Purchase price × ordered quantity
                            </small>
                        </div>

                        <div className="supplier-form-group supplier-full-width">
                            <label>Notes</label>

                            <textarea
                                name="notes"
                                rows="3"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Optional purchase notes"
                            />
                        </div>
                    </div>

                    <div className="supplier-modal-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="supplier-button primary"
                            disabled={saving}
                        >
                            <Save size={17} />
                            {saving
                                ? "Creating..."
                                : "Create Purchase"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FormGroup({ label, error, children }) {
    return (
        <div className="supplier-form-group">
            <label>{label}</label>
            {children}

            {error && (
                <small className="supplier-field-error">
                    {error}
                </small>
            )}
        </div>
    );
}

function getSupplierName(supplier) {
    return (
        supplier?.name ||
        supplier?.supplierName ||
        supplier?.contactPerson ||
        "Supplier"
    );
}

function getProductName(item) {
    return (
        item?.sparePartName ||
        item?.productName ||
        item?.sparePart?.name ||
        "Product"
    );
}

function getPartNumber(item) {
    return (
        item?.partNumber ||
        item?.sparePart?.partNumber ||
        "No part number"
    );
}

function getPurchasePrice(item) {
    return (
        item?.purchasePrice ??
        item?.unitPurchasePrice ??
        item?.supplierPrice ??
        0
    );
}

function isSupplierActive(supplier) {
    if (typeof supplier?.active === "boolean") {
        return supplier.active;
    }

    return (
        supplier?.status?.toUpperCase() === "ACTIVE"
    );
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
    }).format(Number(value || 0));
}

export default SupplierPurchaseModal;