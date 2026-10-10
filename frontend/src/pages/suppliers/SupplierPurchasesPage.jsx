import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Ban,
    ClipboardList,
    PackageCheck,
    Plus,
    RefreshCw,
    Search,
    Truck,
    X,
} from "lucide-react";

import {
    cancelSupplierPurchase,
    createSupplierPurchase,
    getSupplierPurchases,
    receiveSupplierPurchase,
} from "../../api/supplierPurchaseApi";

import {
    getSuppliers,
} from "../../api/supplierApi";

import {
    getSupplierProducts,
} from "../../api/supplierProductApi";

import SupplierPurchaseModal from "../../components/suppliers/SupplierPurchaseModal";
import PurchaseActionModal from "../../components/suppliers/PurchaseActionModal";

import "../../styles/SuppliersPage.css";

function SupplierPurchasesPage() {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierProducts, setSupplierProducts] =
        useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [supplierId, setSupplierId] = useState("");

    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] =
        useState(false);
    const [saving, setSaving] = useState(false);

    const [createOpen, setCreateOpen] =
        useState(false);

    const [action, setAction] = useState({
        open: false,
        mode: "",
        purchase: null,
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadPurchases = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSupplierPurchases({
                status,
                supplierId,
            });

            setPurchases(data);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load supplier purchases."
            );
        } finally {
            setLoading(false);
        }
    }, [status, supplierId]);

    const loadSuppliers = useCallback(async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to load suppliers."
            );
        }
    }, []);

    useEffect(() => {
        loadPurchases();
    }, [loadPurchases]);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    useEffect(() => {
        if (!success) return undefined;

        const timer = window.setTimeout(
            () => setSuccess(""),
            3500
        );

        return () => window.clearTimeout(timer);
    }, [success]);

    const handleSupplierChange = async (
        selectedSupplierId
    ) => {
        if (!selectedSupplierId) {
            setSupplierProducts([]);
            return;
        }

        try {
            setProductsLoading(true);
            setError("");

            const data = await getSupplierProducts(
                selectedSupplierId
            );

            setSupplierProducts(data);
        } catch (requestError) {
            setSupplierProducts([]);

            setError(
                requestError.response?.data?.message ||
                "Unable to load supplied products."
            );
        } finally {
            setProductsLoading(false);
        }
    };

    const handleCreate = async (request) => {
        try {
            setSaving(true);
            setError("");

            await createSupplierPurchase(request);

            setCreateOpen(false);
            setSupplierProducts([]);
            setSuccess(
                "Supplier purchase created successfully."
            );

            await loadPurchases();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to create supplier purchase."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleActionSubmit = async (request) => {
        const purchase = action.purchase;

        try {
            setSaving(true);
            setError("");

            const pId = purchase?.purchaseId ?? purchase?.id;

            if (action.mode === "receive") {
                await receiveSupplierPurchase(
                    pId,
                    request
                );

                setSuccess(
                    "Purchase received and inventory stock updated successfully."
                );
            } else {
                await cancelSupplierPurchase(
                    pId,
                    request
                );

                setSuccess(
                    "Supplier purchase cancelled successfully."
                );
            }

            closeAction();
            await loadPurchases();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                `Unable to ${action.mode} purchase.`
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredPurchases = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return purchases;

        return purchases.filter((purchase) =>
            [
                purchase.purchaseNumber,
                purchase.supplierCode,
                purchase.supplierName,
                purchase.sparePartName,
                purchase.productName,
                purchase.partNumber,
                purchase.supplierInvoiceNumber,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }, [purchases, search]);

    const orderedCount = purchases.filter(
        (purchase) =>
            normalizeStatus(purchase.status) === "ORDERED"
    ).length;

    const receivedCount = purchases.filter(
        (purchase) =>
            normalizeStatus(purchase.status) === "RECEIVED"
    ).length;

    const cancelledCount = purchases.filter(
        (purchase) =>
            normalizeStatus(purchase.status) ===
            "CANCELLED"
    ).length;

    const openAction = (mode, purchase) => {
        setAction({
            open: true,
            mode,
            purchase,
        });
    };

    const closeAction = () => {
        setAction({
            open: false,
            mode: "",
            purchase: null,
        });
    };

    return (
        <main className="suppliers-page">
            <section className="supplier-hero">
                <div>
          <span className="supplier-eyebrow">
            PROCUREMENT & RECEIVING
          </span>

                    <h1>Supplier Purchases</h1>

                    <p>
                        Create purchase orders and receive supplied
                        spare parts into inventory.
                    </p>
                </div>

                <div className="supplier-hero-icon">
                    <Truck size={43} />
                </div>
            </section>

            <section className="supplier-summary-grid purchase-summary-grid">
                <SummaryCard
                    title="Ordered"
                    value={orderedCount}
                    icon={<ClipboardList size={22} />}
                />

                <SummaryCard
                    title="Received"
                    value={receivedCount}
                    icon={<PackageCheck size={22} />}
                />

                <SummaryCard
                    title="Cancelled"
                    value={cancelledCount}
                    icon={<Ban size={22} />}
                />
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

            <section className="supplier-content-card">
                <div className="supplier-toolbar purchase-toolbar">
                    <div className="purchase-filters">
                        <div className="supplier-search-input">
                            <Search size={18} />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search purchase, supplier or product..."
                            />
                        </div>

                        <select
                            className="purchase-filter-select"
                            value={supplierId}
                            onChange={(event) =>
                                setSupplierId(event.target.value)
                            }
                        >
                            <option value="">All Suppliers</option>

                            {suppliers.map((supplier) => (
                                <option
                                    key={supplier.id}
                                    value={supplier.id}
                                >
                                    {getSupplierName(supplier)}
                                </option>
                            ))}
                        </select>

                        <select
                            className="purchase-filter-select"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                        >
                            <option value="">All Statuses</option>
                            <option value="ORDERED">Ordered</option>
                            <option value="RECEIVED">
                                Received
                            </option>
                            <option value="CANCELLED">
                                Cancelled
                            </option>
                        </select>
                    </div>

                    <div className="supplier-toolbar-actions">
                        <button
                            type="button"
                            className="supplier-button secondary"
                            onClick={loadPurchases}
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
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus size={18} />
                            New Purchase
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="supplier-empty-state">
                        <RefreshCw className="spin" size={36} />
                        <h3>Loading purchases...</h3>
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="supplier-empty-state">
                        <ClipboardList size={44} />
                        <h3>No purchases found</h3>
                        <p>
                            Create a new supplier purchase order.
                        </p>

                        <button
                            type="button"
                            className="supplier-button primary"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus size={18} />
                            Create First Purchase
                        </button>
                    </div>
                ) : (
                    <div className="supplier-table-wrapper">
                        <table className="supplier-table purchase-table">
                            <thead>
                            <tr>
                                <th>Purchase No.</th>
                                <th>Supplier</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th>Expected</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredPurchases.map(
                                (purchase) => {
                                    const purchaseStatus =
                                        normalizeStatus(
                                            purchase.status
                                        );

                                    const pKey = purchase?.purchaseId ?? purchase?.id ?? purchase?.purchaseNumber;

                                    return (
                                        <tr key={pKey}>
                                            <td>
                          <span className="supplier-code">
                            {purchase.purchaseNumber}
                          </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {getPurchaseSupplierName(
                                                        purchase
                                                    )}
                                                </strong>

                                                <small className="purchase-cell-note">
                                                    {purchase.supplierCode}
                                                </small>
                                            </td>

                                            <td>
                                                <strong>
                                                    {getProductName(purchase)}
                                                </strong>

                                                <small className="purchase-cell-note">
                                                    {purchase.partNumber}
                                                </small>
                                            </td>

                                            <td>
                                                {purchase.receivedQuantity ??
                                                    0}
                                                /{purchase.orderedQuantity}
                                            </td>

                                            <td>
                                                {formatCurrency(
                                                    purchase.unitPurchasePrice ??
                                                    purchase.purchasePrice
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        purchase.totalAmount
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    purchase.expectedDeliveryDate
                                                )}
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={purchaseStatus}
                                                />
                                            </td>

                                            <td>
                                                {purchaseStatus ===
                                                "ORDERED" ? (
                                                    <div className="purchase-actions">
                                                        <button
                                                            type="button"
                                                            className="purchase-receive-button"
                                                            onClick={() =>
                                                                openAction(
                                                                    "receive",
                                                                    purchase
                                                                )
                                                            }
                                                        >
                                                            <PackageCheck size={15} />
                                                            Receive
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="purchase-cancel-button"
                                                            onClick={() =>
                                                                openAction(
                                                                    "cancel",
                                                                    purchase
                                                                )
                                                            }
                                                        >
                                                            <Ban size={15} />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="purchase-completed-label">
                              No actions
                            </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <SupplierPurchaseModal
                open={createOpen}
                suppliers={suppliers}
                supplierProducts={supplierProducts}
                productsLoading={productsLoading}
                saving={saving}
                onSupplierChange={handleSupplierChange}
                onClose={() => {
                    if (!saving) {
                        setCreateOpen(false);
                        setSupplierProducts([]);
                    }
                }}
                onSubmit={handleCreate}
            />

            <PurchaseActionModal
                open={action.open}
                mode={action.mode}
                purchase={action.purchase}
                saving={saving}
                onClose={closeAction}
                onSubmit={handleActionSubmit}
            />
        </main>
    );
}

function SummaryCard({ title, value, icon }) {
    return (
        <article className="supplier-summary-card">
            <span>{title}</span>
            <strong>{value}</strong>
            {icon}
        </article>
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

function StatusBadge({ status }) {
    const s = normalizeStatus(status);
    return (
        <span
            className={`purchase-status ${s.toLowerCase()}`}
        >
      {s}
    </span>
    );
}

function normalizeStatus(status) {
    return status?.toString().toUpperCase() || "UNKNOWN";
}

function getSupplierName(supplier) {
    return (
        supplier?.name ||
        supplier?.supplierName ||
        supplier?.contactPerson ||
        "Supplier"
    );
}

function getPurchaseSupplierName(purchase) {
    return (
        purchase?.supplierCompanyName ||
        purchase?.supplierName ||
        purchase?.supplier?.name ||
        purchase?.supplier?.supplierName ||
        "Supplier"
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

function formatCurrency(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-LK", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(new Date(value));
}

export default SupplierPurchasesPage;