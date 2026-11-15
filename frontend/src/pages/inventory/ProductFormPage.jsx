import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Save,
} from "lucide-react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import inventoryService from "../../services/inventoryService";
import "../../styles/inventoryManagement.css";

const initialProduct = {
    partNumber: "",
    name: "",
    description: "",
    brand: "",
    vehicleMake: "",
    vehicleModel: "",
    manufactureYear: "",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "0",
    reorderLevel: "5",
    imageUrl: "",
    categoryId: "",
};

export default function ProductFormPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const editMode = Boolean(productId);

    const [formData, setFormData] =
        useState(initialProduct);

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(editMode);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        initializePage();
    }, [productId]);

    const initializePage = async () => {
        try {
            setLoading(true);
            setError("");

            const categoryData =
                await inventoryService
                    .getActiveCategories();

            setCategories(
                Array.isArray(categoryData)
                    ? categoryData
                    : []
            );

            if (editMode) {
                const product =
                    await inventoryService
                        .getProductById(productId);

                setFormData({
                    partNumber:
                        product.partNumber ?? "",
                    name: product.name ?? "",
                    description:
                        product.description ?? "",
                    brand: product.brand ?? "",
                    vehicleMake:
                        product.vehicleMake ?? "",
                    vehicleModel:
                        product.vehicleModel ?? "",
                    manufactureYear:
                        product.manufactureYear ?? "",
                    costPrice:
                        product.costPrice ?? "",
                    sellingPrice:
                        product.sellingPrice ?? "",
                    stockQuantity:
                        product.stockQuantity ?? 0,
                    reorderLevel:
                        product.reorderLevel ?? 0,
                    imageUrl:
                        product.imageUrl ?? "",
                    categoryId:
                        product.categoryId ?? "",
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Product form load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.partNumber.trim()) {
            return "Part number is required.";
        }

        if (!formData.name.trim()) {
            return "Product name is required.";
        }

        if (!formData.brand.trim()) {
            return "Brand is required.";
        }

        if (!formData.categoryId) {
            return "Category is required.";
        }

        if (
            Number(formData.costPrice) < 0
        ) {
            return "Cost price cannot be negative.";
        }

        if (
            Number(formData.sellingPrice) <= 0
        ) {
            return "Selling price must be greater than zero.";
        }

        if (
            Number(formData.sellingPrice) <
            Number(formData.costPrice)
        ) {
            return "Selling price cannot be lower than cost price.";
        }

        if (
            !editMode &&
            Number(formData.stockQuantity) < 0
        ) {
            return "Stock quantity cannot be negative.";
        }

        if (
            Number(formData.reorderLevel) < 0
        ) {
            return "Reorder level cannot be negative.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const commonPayload = {
            partNumber: formData.partNumber.trim(),
            name: formData.name.trim(),
            description:
                formData.description.trim(),
            brand: formData.brand.trim(),
            vehicleMake:
                formData.vehicleMake.trim(),
            vehicleModel:
                formData.vehicleModel.trim(),
            manufactureYear:
                formData.manufactureYear.trim(),
            costPrice: Number(formData.costPrice),
            sellingPrice:
                Number(formData.sellingPrice),
            reorderLevel:
                Number(formData.reorderLevel),
            imageUrl: formData.imageUrl.trim(),
            categoryId:
                Number(formData.categoryId),
        };

        try {
            setSaving(true);
            setError("");

            if (editMode) {
                await inventoryService.updateProduct(
                    productId,
                    commonPayload
                );
            } else {
                await inventoryService.createProduct({
                    ...commonPayload,
                    stockQuantity:
                        Number(formData.stockQuantity),
                });
            }

            navigate("/inventory/products", {
                replace: true,
                state: {
                    message: editMode
                        ? "Spare part updated successfully."
                        : "Spare part created successfully.",
                },
            });
        } catch (err) {
            const validationErrors =
                err.response?.data?.errors;

            if (validationErrors) {
                setError(
                    Object.values(validationErrors).join(
                        ", "
                    )
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Product save කිරීම අසාර්ථකයි."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="inventory-message">
                Loading product form...
            </div>
        );
    }

    return (
        <main className="inventory-page">
            <Link
                to="/inventory/products"
                className="inventory-back-link"
            >
                <ArrowLeft size={17} />
                Back to Products
            </Link>

            <div className="inventory-heading">
                <div>
                    <h1>
                        {editMode
                            ? "Update Spare Part"
                            : "Add New Spare Part"}
                    </h1>

                    <p>
                        {editMode
                            ? "Update product information without directly modifying stock."
                            : "Register a new spare part in the inventory."}
                    </p>
                </div>
            </div>

            {error && (
                <div className="inventory-alert error">
                    {error}
                </div>
            )}

            <form
                className="inventory-product-form"
                onSubmit={handleSubmit}
            >
                <section className="inventory-form-card">
                    <h2>Basic Information</h2>

                    <div className="inventory-form-grid">
                        <div className="inventory-form-group">
                            <label htmlFor="partNumber">
                                Part Number *
                            </label>

                            <input
                                id="partNumber"
                                name="partNumber"
                                value={formData.partNumber}
                                onChange={handleChange}
                                maxLength={80}
                                required
                            />
                        </div>

                        <div className="inventory-form-group">
                            <label htmlFor="name">
                                Product Name *
                            </label>

                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="inventory-form-group">
                            <label htmlFor="brand">
                                Brand *
                            </label>

                            <input
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="inventory-form-group">
                            <label htmlFor="categoryId">
                                Category *
                            </label>

                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Category
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="inventory-form-group full">
                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                maxLength={5000}
                            />
                        </div>
                    </div>
                </section>

                <section className="inventory-form-card">
                    <h2>Vehicle Compatibility</h2>

                    <div className="inventory-form-grid">
                        <div className="inventory-form-group">
                            <label htmlFor="vehicleMake">
                                Vehicle Make
                            </label>

                            <input
                                id="vehicleMake"
                                name="vehicleMake"
                                placeholder="Toyota"
                                value={formData.vehicleMake}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="inventory-form-group">
                            <label htmlFor="vehicleModel">
                                Vehicle Model
                            </label>

                            <input
                                id="vehicleModel"
                                name="vehicleModel"
                                placeholder="Corolla"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="inventory-form-group">
                            <label htmlFor="manufactureYear">
                                Compatible Years
                            </label>

                            <input
                                id="manufactureYear"
                                name="manufactureYear"
                                placeholder="2015-2020"
                                value={formData.manufactureYear}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                <section className="inventory-form-card">
                    <h2>Price and Stock</h2>

                    <div className="inventory-form-grid">
                        <div className="inventory-form-group">
                            <label htmlFor="costPrice">
                                Cost Price (LKR) *
                            </label>

                            <input
                                id="costPrice"
                                name="costPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.costPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="inventory-form-group">
                            <label htmlFor="sellingPrice">
                                Selling Price (LKR) *
                            </label>

                            <input
                                id="sellingPrice"
                                name="sellingPrice"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!editMode && (
                            <div className="inventory-form-group">
                                <label htmlFor="stockQuantity">
                                    Initial Stock *
                                </label>

                                <input
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.stockQuantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        {editMode && (
                            <div className="inventory-form-group">
                                <label>Current Stock</label>

                                <input
                                    value={formData.stockQuantity}
                                    disabled
                                />

                                <small>
                                    Use Stock Adjustment page to
                                    change inventory quantity.
                                </small>
                            </div>
                        )}

                        <div className="inventory-form-group">
                            <label htmlFor="reorderLevel">
                                Reorder Level *
                            </label>

                            <input
                                id="reorderLevel"
                                name="reorderLevel"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.reorderLevel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="inventory-form-card">
                    <h2>Product Image</h2>

                    <div className="inventory-form-group">
                        <label htmlFor="imageUrl">
                            Image URL
                        </label>

                        <input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/product.jpg"
                        />
                    </div>

                    {formData.imageUrl && (
                        <img
                            className="inventory-image-preview"
                            src={formData.imageUrl}
                            alt="Product preview"
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    "none";
                            }}
                        />
                    )}
                </section>

                <div className="inventory-form-actions">
                    <Link
                        to="/inventory/products"
                        className="inventory-secondary-link"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="inventory-primary-button"
                        disabled={saving}
                    >
                        <Save size={18} />

                        {saving
                            ? "Saving..."
                            : editMode
                                ? "Update Spare Part"
                                : "Create Spare Part"}
                    </button>
                </div>
            </form>
        </main>
    );
}