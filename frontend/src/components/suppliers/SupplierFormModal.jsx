import { useEffect, useState } from "react";
import { Building2, Save, X } from "lucide-react";

const initialForm = {
    name: "",
    companyName: "",
    email: "",
    contactNumber: "",
    address: "",
};

function SupplierFormModal({
                               open,
                               supplier,
                               loading,
                               onClose,
                               onSubmit,
                           }) {
    const [form, setForm] = useState(initialForm);
    const [validationErrors, setValidationErrors] =
        useState({});

    const editing = Boolean(supplier?.id);

    useEffect(() => {
        if (supplier) {
            setForm({
                name:
                    supplier.name ??
                    supplier.supplierName ??
                    supplier.contactPerson ??
                    "",
                companyName: supplier.companyName ?? "",
                email: supplier.email ?? "",
                contactNumber: supplier.contactNumber ?? "",
                address: supplier.address ?? "",
            });
        } else {
            setForm(initialForm);
        }

        setValidationErrors({});
    }, [supplier, open]);

    if (!open) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setValidationErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const validate = () => {
        const errors = {};

        if (!form.name.trim()) {
            errors.name = "Supplier name is required";
        }

        if (!form.companyName.trim()) {
            errors.companyName = "Company name is required";
        }

        if (!form.contactNumber.trim()) {
            errors.contactNumber =
                "Contact number is required";
        }

        if (
            form.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ) {
            errors.email = "Enter a valid email address";
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        await onSubmit({
            name: form.name.trim(),
            companyName: form.companyName.trim(),
            email: form.email.trim(),
            contactNumber: form.contactNumber.trim(),
            address: form.address.trim(),
        });
    };

    return (
        <div className="supplier-modal-overlay">
            <div className="supplier-modal">
                <div className="supplier-modal-header">
                    <div>
            <span className="supplier-modal-icon">
              <Building2 size={21} />
            </span>

                        <div>
                            <h2>
                                {editing
                                    ? "Update Supplier"
                                    : "Add New Supplier"}
                            </h2>

                            <p>
                                {editing
                                    ? "Update supplier contact information."
                                    : "Create a new supplier record."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="supplier-icon-button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    className="supplier-form"
                    onSubmit={handleSubmit}
                >
                    <div className="supplier-form-grid">
                        <div className="supplier-form-group">
                            <label htmlFor="supplier-name">
                                Supplier Name *
                            </label>

                            <input
                                id="supplier-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Example: Kamal Perera"
                            />

                            {validationErrors.name && (
                                <small className="supplier-field-error">
                                    {validationErrors.name}
                                </small>
                            )}
                        </div>

                        <div className="supplier-form-group">
                            <label htmlFor="company-name">
                                Company Name *
                            </label>

                            <input
                                id="company-name"
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                                placeholder="Example: Auto Parts Lanka"
                            />

                            {validationErrors.companyName && (
                                <small className="supplier-field-error">
                                    {validationErrors.companyName}
                                </small>
                            )}
                        </div>

                        <div className="supplier-form-group">
                            <label htmlFor="supplier-email">
                                Email
                            </label>

                            <input
                                id="supplier-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="supplier@example.com"
                            />

                            {validationErrors.email && (
                                <small className="supplier-field-error">
                                    {validationErrors.email}
                                </small>
                            )}
                        </div>

                        <div className="supplier-form-group">
                            <label htmlFor="contact-number">
                                Contact Number *
                            </label>

                            <input
                                id="contact-number"
                                name="contactNumber"
                                value={form.contactNumber}
                                onChange={handleChange}
                                placeholder="0771234567"
                            />

                            {validationErrors.contactNumber && (
                                <small className="supplier-field-error">
                                    {validationErrors.contactNumber}
                                </small>
                            )}
                        </div>

                        <div className="supplier-form-group supplier-full-width">
                            <label htmlFor="supplier-address">
                                Address
                            </label>

                            <textarea
                                id="supplier-address"
                                name="address"
                                rows="3"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter supplier address"
                            />
                        </div>
                    </div>

                    <div className="supplier-modal-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="supplier-button primary"
                            disabled={loading}
                        >
                            <Save size={17} />

                            {loading
                                ? "Saving..."
                                : editing
                                    ? "Update Supplier"
                                    : "Add Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SupplierFormModal;