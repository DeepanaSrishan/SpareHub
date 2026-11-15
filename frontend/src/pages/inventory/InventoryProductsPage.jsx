import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useLocation,
} from "react-router-dom";

import {
    Boxes,
    CirclePlus,
    Edit3,
    PackageCheck,
    PackageOpen,
    PackageX,
    RotateCcw,
    Search,
} from "lucide-react";

import inventoryService from
        "../../services/inventoryService";

import "../../styles/inventoryManagement.css";

export default function InventoryProductsPage() {
    const location = useLocation();

    const [products, setProducts] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [searchInput, setSearchInput] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [categoryId, setCategoryId] =
        useState("");

    const [page, setPage] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [updatingId, setUpdatingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const loadCategories = async () => {
        try {
            const data =
                await inventoryService
                    .getCategories({
                        page: 0,
                        size: 100,
                    });

            setCategories(
                Array.isArray(data)
                    ? data
                    : data?.content ?? []
            );
        } catch {
            setCategories([]);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryService
                    .getProducts({
                        search,
                        status,
                        categoryId,
                        page,
                        size: 10,
                    });

            if (Array.isArray(data)) {
                setProducts(data);

                setTotalElements(
                    data.length
                );

                setTotalPages(
                    data.length > 0 ? 1 : 0
                );
            } else {
                setProducts(
                    data?.content ?? []
                );

                setTotalElements(
                    data?.totalElements ?? 0
                );

                setTotalPages(
                    data?.totalPages ?? 0
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Spare parts load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [
        search,
        status,
        categoryId,
        page,
    ]);

    useEffect(() => {
        if (location.state?.message) {
            setMessage(
                location.state.message
            );

            window.history.replaceState(
                {},
                document.title
            );
        }
    }, [location.state]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(0);
        setSearch(searchInput.trim());
    };

    const handleReset = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setCategoryId("");
        setPage(0);
    };

    const handleStatusChange = async (
        product,
        newStatus
    ) => {
        const confirmed = window.confirm(
            `Change ${product.name} status to ${newStatus}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(product.id);
            setError("");
            setMessage("");

            const updated =
                await inventoryService
                    .updateProductStatus(
                        product.id,
                        newStatus
                    );

            setProducts((currentProducts) =>
                currentProducts.map(
                    (currentProduct) =>
                        currentProduct.id ===
                        product.id
                            ? {
                                ...currentProduct,
                                ...updated,
                            }
                            : currentProduct
                )
            );

            setMessage(
                `${product.name} status updated to ${newStatus}.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product status update කිරීම අසාර්ථකයි."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDiscontinue = async (
        product
    ) => {
        const confirmed = window.confirm(
            `Discontinue ${product.name}? The database record will be preserved.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(product.id);
            setError("");
            setMessage("");

            const updated =
                await inventoryService
                    .discontinueProduct(
                        product.id
                    );

            setProducts((currentProducts) =>
                currentProducts.map(
                    (currentProduct) =>
                        currentProduct.id ===
                        product.id
                            ? {
                                ...currentProduct,
                                ...updated,
                            }
                            : currentProduct
                )
            );

            setMessage(
                `${product.name} was discontinued successfully.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product discontinue කිරීම අසාර්ථකයි."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatMoney = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
        }).format(value ?? 0);

    return (
        <main className="inventory-page">
            <div className="inventory-heading">
                <div>
                    <span className="page-eyebrow">
                        Inventory Management
                    </span>

                    <h1>Manage Products</h1>

                    <p>
                        Add, update, manage stock and
                        deactivate spare parts.
                    </p>
                </div>

                <div className="inventory-heading-actions">
                    <Link
                        to="/inventory/categories"
                        className="inventory-secondary-link"
                    >
                        <Boxes size={18} />
                        Categories
                    </Link>

                    <Link
                        to="/inventory/products/new"
                        className="inventory-primary-link"
                    >
                        <CirclePlus size={18} />
                        Add New Product
                    </Link>
                </div>
            </div>

            {error && (
                <div className="inventory-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="inventory-alert success">
                    {message}
                </div>
            )}

            <section className="inventory-filter-card">
                <form
                    className="inventory-filter-form"
                    onSubmit={handleSearch}
                >
                    <div className="inventory-search-input">
                        <Search size={18} />

                        <input
                            type="search"
                            value={searchInput}
                            placeholder="Search name, part number, brand..."
                            onChange={(event) =>
                                setSearchInput(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <select
                        value={categoryId}
                        onChange={(event) => {
                            setCategoryId(
                                event.target.value
                            );

                            setPage(0);
                        }}
                    >
                        <option value="">
                            All Categories
                        </option>

                        {categories.map(
                            (category) => (
                                <option
                                    key={
                                        category.id
                                    }
                                    value={
                                        category.id
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(
                                event.target.value
                            );

                            setPage(0);
                        }}
                    >
                        <option value="">
                            All Statuses
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                        <option value="DISCONTINUED">
                            Discontinued
                        </option>
                    </select>

                    <button
                        type="submit"
                        className="inventory-primary-button"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        className="inventory-secondary-button"
                        onClick={handleReset}
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </form>
            </section>

            <section className="inventory-table-card">
                <div className="inventory-table-heading">
                    <h2>Products</h2>

                    <span>
                        {totalElements} record(s)
                    </span>
                </div>

                {loading ? (
                    <div className="inventory-message">
                        Loading spare parts...
                    </div>
                ) : products.length === 0 ? (
                    <div className="inventory-empty">
                        No spare parts found.
                    </div>
                ) : (
                    <div className="inventory-table-wrapper">
                        <table className="inventory-table">
                            <thead>
                            <tr>
                                <th>Part</th>
                                <th>Category</th>
                                <th>Cost Price</th>
                                <th>
                                    Selling Price
                                </th>
                                <th>Stock</th>
                                <th>
                                    Reorder Level
                                </th>
                                <th>Status</th>
                                <th>
                                    Availability
                                </th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {products.map(
                                (product) => (
                                    <tr
                                        key={
                                            product.id
                                        }
                                    >
                                        <td>
                                            <div className="inventory-product-cell">
                                                <strong>
                                                    {
                                                        product.name
                                                    }
                                                </strong>

                                                <span>
                                                        {
                                                            product.partNumber
                                                        }
                                                    {" · "}
                                                    {
                                                        product.brand
                                                    }
                                                    </span>
                                            </div>
                                        </td>

                                        <td>
                                            {
                                                product.categoryName
                                            }
                                        </td>

                                        <td>
                                            {formatMoney(
                                                product.costPrice
                                            )}
                                        </td>

                                        <td>
                                            {formatMoney(
                                                product.sellingPrice
                                            )}
                                        </td>

                                        <td>
                                                <span
                                                    className={
                                                        product.lowStock
                                                            ? "inventory-low-stock"
                                                            : ""
                                                    }
                                                >
                                                    {
                                                        product.stockQuantity
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            {
                                                product.reorderLevel
                                            }
                                        </td>

                                        <td>
                                                <span
                                                    className={`inventory-status ${
                                                        product.status
                                                            ?.toLowerCase() ??
                                                        ""
                                                    }`}
                                                >
                                                    {
                                                        product.status
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`inventory-availability ${
                                                        product.available
                                                            ? "available"
                                                            : "unavailable"
                                                    }`}
                                                >
                                                    {product.available ? (
                                                        <PackageCheck
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    ) : (
                                                        <PackageX
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    )}

                                                    {product.available
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="inventory-row-actions">
                                                <Link
                                                    to={`/inventory/products/${product.id}/edit`}
                                                    className="inventory-icon-button"
                                                    title="Edit product"
                                                >
                                                    <Edit3
                                                        size={
                                                            17
                                                        }
                                                    />

                                                    <span>
                                                            Edit
                                                        </span>
                                                </Link>

                                                <Link
                                                    to={`/inventory/products/${product.id}/stock`}
                                                    className="inventory-icon-button"
                                                    title="Manage stock"
                                                >
                                                    <PackageOpen
                                                        size={
                                                            17
                                                        }
                                                    />

                                                    <span>
                                                            Stock
                                                        </span>
                                                </Link>

                                                {product.status ===
                                                    "ACTIVE" && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingId ===
                                                                product.id
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    product,
                                                                    "INACTIVE"
                                                                )
                                                            }
                                                        >
                                                            Inactivate
                                                        </button>
                                                    )}

                                                {product.status ===
                                                    "INACTIVE" && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingId ===
                                                                product.id
                                                            }
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    product,
                                                                    "ACTIVE"
                                                                )
                                                            }
                                                        >
                                                            Activate
                                                        </button>
                                                    )}

                                                {product.status !==
                                                    "DISCONTINUED" && (
                                                        <button
                                                            type="button"
                                                            className="inventory-danger-button"
                                                            disabled={
                                                                updatingId ===
                                                                product.id
                                                            }
                                                            onClick={() =>
                                                                handleDiscontinue(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            Discontinue
                                                        </button>
                                                    )}
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

            {totalPages > 1 && (
                <div className="inventory-pagination">
                    <button
                        type="button"
                        disabled={
                            page === 0 ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                (currentPage) =>
                                    currentPage - 1
                            )
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {page + 1} of{" "}
                        {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={
                            page + 1 >=
                            totalPages ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                (currentPage) =>
                                    currentPage + 1
                            )
                        }
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    );
}