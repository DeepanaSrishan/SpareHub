import { useEffect, useMemo, useState } from "react";
import { PackagePlus, Save, X } from "lucide-react";

const initialForm = {
    sparePartId: "",
    supplierPartNumber: "",
    purchasePrice: "",
    leadTimeDays: "",
    minimumOrderQuantity: "1",
    preferred: false,
};

function SupplierProductModal({
                                  open,
                                  assignment,
                                  spareParts,
                                  saving,
                                  onClose,
                                  onSubmit,
                              }) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    const editing = Boolean(assignment?.id);

    useEffect(() => {
        if (assignment) {
            setForm({
                sparePartId: String(
                    assignment.sparePartId ??
                    assignment.productId ??
                    assignment.sparePart?.id ??
                    ""
                ),
                supplierPartNumber:
                    assignment.supplierPartNumber ?? "",
                purchasePrice: String(
                    assignment.purchasePrice ??
                    assignment.supplierPrice ??
                    ""
                ),
                leadTimeDays: String(
                    assignment.leadTimeDays ?? ""
                ),
                minimumOrderQuantity: String(
                    assignment.minimumOrderQuantity ?? 1
                ),
                preferred:
                    assignment.preferred ??
                    assignment.preferredSupplier ??
                    false,
            });
        } else {
            setForm(initialForm);
        }

        setErrors({});
    }, [assignment, open]);

    const availableParts = useMemo(() => {
        if (!editing) {
            return spareParts;
        }

        const selectedId = Number(form.sparePartId);

        return spareParts.filter(
            (part) =>
                Number(part.id) === selectedId ||
                !part.alreadyAssigned
        );
    }, [spareParts, editing, form.sparePartId]);

    if (!open) return null;

    const handleChange = (event) => {
        const { name, value, type, checked } =
            event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.sparePartId) {
            nextErrors.sparePartId =
                "Spare part is required";
        }

        if (
            !form.purchasePrice ||
            Number(form.purchasePrice) <= 0
        ) {
            nextErrors.purchasePrice =
                "Purchase price must be greater than zero";
        }

        if (
            form.leadTimeDays &&
            Number(form.leadTimeDays) < 0
        ) {
            nextErrors.leadTimeDays =
                "Lead time cannot be negative";
        }

        if (
            !form.minimumOrderQuantity ||
            Number(form.minimumOrderQuantity) < 1
        ) {
            nextErrors.minimumOrderQuantity =
                "Minimum order quantity must be at least 1";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        await onSubmit({
            sparePartId: Number(form.sparePartId),
            supplierPartNumber:
                form.supplierPartNumber.trim() || null,
            purchasePrice: Number(form.purchasePrice),
            leadTimeDays: form.leadTimeDays
                ? Number(form.leadTimeDays)
                : 0,
            minimumOrderQuantity: Number(
                form.minimumOrderQuantity
            ),
            preferred: form.preferred,
        });
    };

    return (
        <div className="supplier-modal-overlay">
            <div className="supplier-modal">
                <div className="supplier-modal-header">
                    <div>
            <span className="supplier-modal-icon">
              <PackagePlus size={21} />
            </span>

                        <div>
                            <h2>
                                {editing
                                    ? "Update Supplied Product"
                                    : "Assign Product"}
                            </h2>

                            <p>
                                Maintain supplier pricing and purchasing
                                information.
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
                            label="Spare Part *"
                            error={errors.sparePartId}
                        >
                            <select
                                name="sparePartId"
                                value={form.sparePartId}
                                onChange={handleChange}
                                disabled={editing}
                            >
                                <option value="">
                                    Select a spare part
                                </option>

                                {availableParts.map((part) => (
                                    <option
                                        key={part.id}
                                        value={part.id}
                                    >
                                        {part.partNumber} - {part.name}
                                    </option>
                                ))}
                            </select>
                        </FormGroup>

                        <FormGroup label="Supplier Part Number">
                            <input
                                name="supplierPartNumber"
                                value={form.supplierPartNumber}
                                onChange={handleChange}
                                placeholder="Example: SUP-BP-001"
                            />
                        </FormGroup>

                        <FormGroup
                            label="Purchase Price (LKR) *"
                            error={errors.purchasePrice}
                        >
                            <input
                                name="purchasePrice"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.purchasePrice}
                                onChange={handleChange}
                                placeholder="2500.00"
                            />
                        </FormGroup>

                        <FormGroup
                            label="Lead Time (Days)"
                            error={errors.leadTimeDays}
                        >
                            <input
                                name="leadTimeDays"
                                type="number"
                                min="0"
                                value={form.leadTimeDays}
                                onChange={handleChange}
                                placeholder="5"
                            />
                        </FormGroup>

                        <FormGroup
                            label="Minimum Order Quantity"
                            error={errors.minimumOrderQuantity}
                        >
                            <input
                                name="minimumOrderQuantity"
                                type="number"
                                min="1"
                                value={form.minimumOrderQuantity}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        <div className="supplier-checkbox-group">
                            <label>
                                <input
                                    name="preferred"
                                    type="checkbox"
                                    checked={form.preferred}
                                    onChange={handleChange}
                                />

                                <span>
                  Set as preferred supplier for this product
                </span>
                            </label>

                            <small>
                                Selecting this will replace the existing
                                preferred supplier for the spare part.
                            </small>
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
                                ? "Saving..."
                                : editing
                                    ? "Update Assignment"
                                    : "Assign Product"}
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

export default SupplierProductModal;