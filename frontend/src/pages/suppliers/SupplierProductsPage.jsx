import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
    ArrowLeft,
    BadgeCheck,
    Boxes,
    PackagePlus,
    Pencil,
    RefreshCw,
    Search,
    Star,
    Trash2,
    Truck,
    X,
} from "lucide-react";

import {
    assignProductToSupplier,
    getActiveSpareParts,
    getSupplierProducts,
    markPreferredSupplier,
    removeSupplierProduct,
    updateSupplierProduct,
} from "../../api/supplierProductApi";

import { getSupplierById } from "../../api/supplierApi";
import SupplierProductModal from "../../components/suppliers/SupplierProductModal";

import "../../styles/SuppliersPage.css";

function SupplierProductsPage() {
    const { supplierId } = useParams();

    const [supplier, setSupplier] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [spareParts, setSpareParts] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] =
        useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadPageData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                supplierData,
                assignmentData,
                sparePartData,
            ] = await Promise.all([
                getSupplierById(supplierId),
                getSupplierProducts(supplierId),
                getActiveSpareParts(),
            ]);

            setSupplier(supplierData);
            setAssignments(assignmentData);
            setSpareParts(sparePartData);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load supplier products."
            );
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);

    useEffect(() => {
        if (!success) return undefined;

        const timer = window.setTimeout(
            () => setSuccess(""),
            3500
        );

        return () => window.clearTimeout(timer);
    }, [success]);

    const assignedProductIds = useMemo(
        () =>
            new Set(
                assignments.map((assignment) =>
                    Number(getProductId(assignment))
                )
            ),
        [assignments]
    );

    const selectableSpareParts = useMemo(
        () =>
            spareParts.map((part) => ({
                ...part,
                alreadyAssigned: assignedProductIds.has(
                    Number(part.id)
                ),
            })),
        [spareParts, assignedProductIds]
    );

    const filteredAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return assignments;

        return assignments.filter((assignment) => {
            const searchableText = [
                getProductName(assignment),
                getPartNumber(assignment),
                assignment.supplierPartNumber,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(keyword);
        });
    }, [assignments, search]);

    const openCreateModal = () => {
        setEditingAssignment(null);
        setModalOpen(true);
    };

    const openUpdateModal = (assignment) => {
        setEditingAssignment(assignment);
        setModalOpen(true);
    };

    const handleSave = async (request) => {
        try {
            setSaving(true);
            setError("");

            if (editingAssignment?.id) {
                await updateSupplierProduct(
                    supplierId,
                    editingAssignment.id,
                    request
                );

                setSuccess(
                    "Supplier product updated successfully."
                );
            } else {
                await assignProductToSupplier(
                    supplierId,
                    request
                );

                setSuccess(
                    "Product assigned successfully."
                );
            }

            setModalOpen(false);
            setEditingAssignment(null);
            await loadPageData();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to save product assignment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePreferred = async (assignment) => {
        if (isPreferred(assignment)) {
            setSuccess(
                "This supplier is already the preferred supplier."
            );
            return;
        }

        const confirmed = window.confirm(
            `Set ${getSupplierName(supplier)} as the preferred supplier for ${getProductName(assignment)}?`
        );

        if (!confirmed) return;

        try {
            setActionId(assignment.id);
            setError("");

            await markPreferredSupplier(
                supplierId,
                assignment.id
            );

            setSuccess(
                "Preferred supplier updated successfully."
            );

            await loadPageData();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to update preferred supplier."
            );
        } finally {
            setActionId(null);
        }
    };

    const handleRemove = async (assignment) => {
        const confirmed = window.confirm(
            `Remove ${getProductName(assignment)} from this supplier?`
        );

        if (!confirmed) return;

        try {
            setActionId(assignment.id);
            setError("");

            await removeSupplierProduct(
                supplierId,
                assignment.id
            );

            setSuccess(
                "Product assignment removed successfully."
            );

            await loadPageData();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to remove product assignment."
            );
        } finally {
            setActionId(null);
        }
    };

    return (
        <main className="suppliers-page">
            <Link
                to="/suppliers"
                className="supplier-back-link"
            >
                <ArrowLeft size={18} />
                Back to Suppliers
            </Link>

            <section className="supplier-hero">
                <div>
          <span className="supplier-eyebrow">
            SUPPLIER PRODUCTS
          </span>

                    <h1>{getSupplierName(supplier)}</h1>

                    <p>
                        {supplier?.supplierCode || "Supplier"} ·{" "}
                        {supplier?.companyName || "Company not provided"}
                    </p>
                </div>

                <div className="supplier-hero-icon">
                    <Boxes size={43} />
                </div>
            </section>

            {error && (
                <Message
                    type="error"
                    message={error}
                    onClose={() => setError("")}
                />
            )}

            {success && (
                <Message
                    type="success"
                    message={success}
                    onClose={() => setSuccess("")}
                />
            )}

            <section className="supplier-summary-grid">
                <article className="supplier-summary-card">
                    <span>Supplied Products</span>
                    <strong>{assignments.length}</strong>
                    <Boxes size={22} />
                </article>

                <article className="supplier-summary-card">
                    <span>Preferred Products</span>
                    <strong>
                        {
                            assignments.filter(isPreferred)
                                .length
                        }
                    </strong>
                    <Star size={22} />
                </article>

                <article className="supplier-summary-card">
                    <span>Supplier Status</span>
                    <strong className="supplier-small-value">
                        {isSupplierActive(supplier)
                            ? "Active"
                            : "Inactive"}
                    </strong>
                    <Truck size={22} />
                </article>
            </section>

            <section className="supplier-content-card">
                <div className="supplier-toolbar">
                    <div className="supplier-search-input">
                        <Search size={18} />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search product or part number..."
                        />
                    </div>

                    <div className="supplier-toolbar-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={loadPageData}
                            disabled={loading}
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            className="supplier-button primary"
                            onClick={openCreateModal}
                            disabled={!isSupplierActive(supplier)}
                        >
                            <PackagePlus size={18} />
                            Assign Product
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="supplier-empty-state">
                        <RefreshCw className="spin" size={36} />
                        <h3>Loading supplier products...</h3>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="supplier-empty-state">
                        <Boxes size={45} />

                        <h3>No supplied products found</h3>

                        <p>
                            Assign a spare part and maintain its supplier
                            purchasing price.
                        </p>

                        <button
                            type="button"
                            className="supplier-button primary"
                            onClick={openCreateModal}
                            disabled={!isSupplierActive(supplier)}
                        >
                            <PackagePlus size={18} />
                            Assign First Product
                        </button>
                    </div>
                ) : (
                    <div className="supplier-table-wrapper">
                        <table className="supplier-table">
                            <thead>
                            <tr>
                                <th>Part Number</th>
                                <th>Product</th>
                                <th>Supplier Part No.</th>
                                <th>Purchase Price</th>
                                <th>Lead Time</th>
                                <th>Minimum Qty.</th>
                                <th>Preferred</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredAssignments.map(
                                (assignment) => (
                                    <tr key={assignment.id}>
                                        <td>
                        <span className="supplier-code">
                          {getPartNumber(assignment)}
                        </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {getProductName(assignment)}
                                            </strong>
                                        </td>

                                        <td>
                                            {assignment.supplierPartNumber ||
                                                "—"}
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                getPurchasePrice(assignment)
                                            )}
                                        </td>

                                        <td>
                                            {assignment.leadTimeDays ?? 0} days
                                        </td>

                                        <td>
                                            {assignment.minimumOrderQuantity ??
                                                1}
                                        </td>

                                        <td>
                                            {isPreferred(assignment) ? (
                                                <span className="preferred-badge">
                            <BadgeCheck size={15} />
                            Preferred
                          </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="set-preferred-button"
                                                    disabled={
                                                        actionId === assignment.id
                                                    }
                                                    onClick={() =>
                                                        handlePreferred(assignment)
                                                    }
                                                >
                                                    <Star size={15} />
                                                    Set Preferred
                                                </button>
                                            )}
                                        </td>

                                        <td>
                                            <div className="supplier-row-actions">
                                                <button
                                                    type="button"
                                                    className="supplier-action-button edit"
                                                    title="Update assignment"
                                                    onClick={() =>
                                                        openUpdateModal(assignment)
                                                    }
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="supplier-action-button deactivate"
                                                    title="Remove assignment"
                                                    disabled={
                                                        actionId === assignment.id
                                                    }
                                                    onClick={() =>
                                                        handleRemove(assignment)
                                                    }
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <SupplierProductModal
                open={modalOpen}
                assignment={editingAssignment}
                spareParts={selectableSpareParts.filter(
                    (part) =>
                        !part.alreadyAssigned ||
                        Number(part.id) ===
                        Number(
                            getProductId(
                                editingAssignment || {}
                            )
                        )
                )}
                saving={saving}
                onClose={() => {
                    if (!saving) {
                        setModalOpen(false);
                        setEditingAssignment(null);
                    }
                }}
                onSubmit={handleSave}
            />
        </main>
    );
}

function Message({ type, message, onClose }) {
    return (
        <div className={`supplier-alert ${type}`}>
            <span>{message}</span>

            <button type="button" onClick={onClose}>
                <X size={17} />
            </button>
        </div>
    );
}

function getSupplierName(supplier) {
    return (
        supplier?.name ||
        supplier?.supplierName ||
        supplier?.contactPerson ||
        "Supplier Products"
    );
}

function getProductId(assignment) {
    return (
        assignment?.sparePartId ??
        assignment?.productId ??
        assignment?.sparePart?.id
    );
}

function getProductName(assignment) {
    return (
        assignment?.sparePartName ||
        assignment?.productName ||
        assignment?.sparePart?.name ||
        "Unknown Product"
    );
}

function getPartNumber(assignment) {
    return (
        assignment?.partNumber ||
        assignment?.sparePart?.partNumber ||
        "—"
    );
}

function getPurchasePrice(assignment) {
    return (
        assignment?.purchasePrice ??
        assignment?.supplierPrice ??
        0
    );
}

function isPreferred(assignment) {
    return Boolean(
        assignment?.preferred ??
        assignment?.preferredSupplier
    );
}

function isSupplierActive(supplier) {
    if (!supplier) return false;

    if (typeof supplier.active === "boolean") {
        return supplier.active;
    }

    return (
        supplier.status?.toUpperCase() === "ACTIVE"
    );
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

export default SupplierProductsPage;