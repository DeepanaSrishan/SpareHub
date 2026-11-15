import { useEffect, useState } from "react";
import {
    CirclePlus,
    Edit3,
    Power,
    RotateCcw,
    Save,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import inventoryService from "../../services/inventoryService";
import "../../styles/inventoryManagement.css";

const emptyForm = {
    name: "",
    description: "",
};

export default function CategoriesPage() {
    const [categories, setCategories] =
        useState([]);

    const [formData, setFormData] =
        useState(emptyForm);

    const [editingId, setEditingId] =
        useState(null);

    const [searchInput, setSearchInput] =
        useState("");
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] =
        useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadCategories();
    }, [search, activeFilter]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryService.getCategories({
                    search,
                    active: activeFilter,
                    page: 0,
                    size: 100,
                });

            setCategories(
                Array.isArray(data)
                    ? data
                    : data?.content ?? []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Categories load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
    };

    const handleEdit = (category) => {
        setEditingId(category.id);

        setFormData({
            name: category.name ?? "",
            description:
                category.description ?? "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.name.trim().length < 2) {
            setError(
                "Category name එක අවම වශයෙන් characters 2ක් විය යුතුයි."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const payload = {
                name: formData.name.trim(),
                description:
                    formData.description.trim(),
            };

            if (editingId) {
                await inventoryService.updateCategory(
                    editingId,
                    payload
                );

                setMessage(
                    "Category updated successfully."
                );
            } else {
                await inventoryService.createCategory(
                    payload
                );

                setMessage(
                    "Category created successfully."
                );
            }

            resetForm();
            await loadCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                Object.values(
                    err.response?.data?.errors ?? {}
                ).join(", ") ||
                "Category save කිරීම අසාර්ථකයි."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatus = async (category) => {
        const newStatus = !category.active;

        const confirmed = window.confirm(
            `${newStatus ? "Activate" : "Deactivate"} ${category.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(category.id);
            setError("");
            setMessage("");

            const updated =
                await inventoryService
                    .updateCategoryStatus(
                        category.id,
                        newStatus
                    );

            setCategories((current) =>
                current.map((item) =>
                    item.id === category.id
                        ? { ...item, ...updated }
                        : item
                )
            );

            setMessage(
                `Category ${
                    newStatus
                        ? "activated"
                        : "deactivated"
                } successfully.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Category status update කිරීම අසාර්ථකයි."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Permanently delete ${category.name}? This works only when no spare parts are assigned.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(category.id);
            setError("");
            setMessage("");

            await inventoryService.deleteCategory(
                category.id
            );

            setCategories((current) =>
                current.filter(
                    (item) => item.id !== category.id
                )
            );

            setMessage(
                "Category deleted successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Category delete කිරීම අසාර්ථකයි."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setSearch(searchInput.trim());
    };

    const handleResetSearch = () => {
        setSearchInput("");
        setSearch("");
        setActiveFilter("");
    };

    return (
        <main className="inventory-page">
            <div className="inventory-heading">
                <div>
                    <h1>Category Management</h1>
                    <p>
                        Create and maintain spare-part
                        categories.
                    </p>
                </div>

                <Link
                    to="/inventory/products"
                    className="inventory-secondary-link"
                >
                    Back to Products
                </Link>
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

            <section className="inventory-form-card">
                <div className="inventory-form-title">
                    <h2>
                        {editingId
                            ? "Update Category"
                            : "Add Category"}
                    </h2>

                    {editingId && (
                        <button
                            className="inventory-icon-button"
                            onClick={resetForm}
                            type="button"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <form
                    className="inventory-category-form"
                    onSubmit={handleSubmit}
                >
                    <div className="inventory-form-group">
                        <label htmlFor="categoryName">
                            Category Name *
                        </label>

                        <input
                            id="categoryName"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            minLength={2}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="inventory-form-group">
                        <label htmlFor="categoryDescription">
                            Description
                        </label>

                        <textarea
                            id="categoryDescription"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleFormChange}
                            maxLength={500}
                        />
                    </div>

                    <button
                        type="submit"
                        className="inventory-primary-button"
                        disabled={saving}
                    >
                        {editingId ? (
                            <Save size={18} />
                        ) : (
                            <CirclePlus size={18} />
                        )}

                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update Category"
                                : "Create Category"}
                    </button>
                </form>
            </section>

            <section className="inventory-filter-card">
                <form
                    className="inventory-category-search"
                    onSubmit={handleSearch}
                >
                    <div className="inventory-search-input">
                        <Search size={18} />

                        <input
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Search categories..."
                        />
                    </div>

                    <select
                        value={activeFilter}
                        onChange={(event) =>
                            setActiveFilter(event.target.value)
                        }
                    >
                        <option value="">
                            All Statuses
                        </option>
                        <option value="true">Active</option>
                        <option value="false">
                            Inactive
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
                        onClick={handleResetSearch}
                        className="inventory-secondary-button"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </form>
            </section>

            <section className="inventory-table-card">
                {loading ? (
                    <div className="inventory-message">
                        Loading categories...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="inventory-empty">
                        No categories found.
                    </div>
                ) : (
                    <div className="inventory-table-wrapper">
                        <table className="inventory-table">
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Products</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        <strong>{category.name}</strong>
                                    </td>

                                    <td>
                                        {category.description || "—"}
                                    </td>

                                    <td>
                                        {category.sparePartCount ?? 0}
                                    </td>

                                    <td>
                      <span
                          className={`inventory-status ${
                              category.active
                                  ? "active"
                                  : "inactive"
                          }`}
                      >
                        {category.active
                            ? "ACTIVE"
                            : "INACTIVE"}
                      </span>
                                    </td>

                                    <td>
                                        <div className="inventory-row-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                            >
                                                <Edit3 size={15} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingId === category.id
                                                }
                                                onClick={() =>
                                                    handleStatus(category)
                                                }
                                            >
                                                <Power size={15} />

                                                {category.active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>

                                            <button
                                                type="button"
                                                className="inventory-danger-button"
                                                disabled={
                                                    updatingId === category.id
                                                }
                                                onClick={() =>
                                                    handleDelete(category)
                                                }
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}