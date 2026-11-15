import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    CarFront,
    CheckCircle2,
    Package,
    PackageX,
    Tag,
    Truck,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import AddToCartButton from
        "../../components/cart/AddToCartButton";

import catalogService from
        "../../services/catalogService";

import "../../styles/catalog.css";

export default function ProductDetailsPage() {
    const { productId } = useParams();

    const [product, setProduct] =
        useState(null);

    const [availability, setAvailability] =
        useState(null);

    const [quantity, setQuantity] =
        useState(1);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        let componentActive = true;

        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    productData,
                    availabilityData,
                ] = await Promise.all([
                    catalogService.getProductById(
                        productId
                    ),
                    catalogService.getAvailability(
                        productId
                    ),
                ]);

                if (!componentActive) {
                    return;
                }

                setProduct(productData);
                setAvailability(
                    availabilityData
                );
                setQuantity(1);
            } catch (requestError) {
                if (!componentActive) {
                    return;
                }

                setError(
                    requestError.response
                        ?.data?.message ||
                    "Product details load කිරීම අසාර්ථකයි."
                );
            } finally {
                if (componentActive) {
                    setLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            componentActive = false;
        };
    }, [productId]);

    const formatPrice = (value) =>
        new Intl.NumberFormat(
            "en-LK",
            {
                style: "currency",
                currency: "LKR",
                minimumFractionDigits: 2,
            }
        ).format(value ?? 0);

    if (loading) {
        return (
            <main className="catalog-page">
                <div className="catalog-details-loading">
                    Loading product details...
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="catalog-page">
                <div className="catalog-alert-error">
                    {error ||
                        "Product not found."}
                </div>

                <Link
                    to="/products"
                    className="catalog-back-link"
                >
                    <ArrowLeft size={17} />
                    Back to Products
                </Link>
            </main>
        );
    }

    const productAvailable =
        availability?.available ??
        product.available ??
        false;

    const availableQuantity =
        availability
            ?.availableQuantity ??
        product.stockQuantity ??
        0;

    const maximumQuantity =
        Math.max(1, availableQuantity);

    const decreaseQuantity = () => {
        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    };

    const increaseQuantity = () => {
        setQuantity((current) =>
            Math.min(
                maximumQuantity,
                current + 1
            )
        );
    };

    const handleQuantityChange = (
        event
    ) => {
        const enteredQuantity =
            Number(event.target.value);

        const safeQuantity = Number.isFinite(
            enteredQuantity
        )
            ? enteredQuantity
            : 1;

        setQuantity(
            Math.max(
                1,
                Math.min(
                    maximumQuantity,
                    safeQuantity
                )
            )
        );
    };

    return (
        <main className="catalog-page">
            <Link
                to="/products"
                className="catalog-back-link"
            >
                <ArrowLeft size={17} />
                Back to Products
            </Link>

            <section className="catalog-product-details">
                <div className="catalog-details-image-panel">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="catalog-details-image"
                            onError={(event) => {
                                event.currentTarget
                                    .style.display =
                                    "none";

                                event.currentTarget
                                    .nextElementSibling
                                    ?.classList.remove(
                                    "hidden"
                                );
                            }}
                        />
                    ) : null}

                    <div
                        className={
                            `catalog-details-placeholder ${
                                product.imageUrl
                                    ? "hidden"
                                    : ""
                            }`
                        }
                    >
                        <CarFront size={85} />

                        <span>
                            No product image
                            available
                        </span>
                    </div>
                </div>

                <div className="catalog-details-content">
                    <span className="catalog-details-category">
                        {product.categoryName}
                    </span>

                    <h1>{product.name}</h1>

                    <div className="catalog-details-reference">
                        <span>
                            <Tag size={17} />
                            Part No:{" "}
                            {product.partNumber}
                        </span>

                        <span>
                            <Package size={17} />
                            Brand:{" "}
                            {product.brand}
                        </span>
                    </div>

                    <div className="catalog-details-price">
                        {formatPrice(
                            product.sellingPrice
                        )}
                    </div>

                    <div
                        className={
                            `catalog-details-availability ${
                                productAvailable
                                    ? "available"
                                    : "unavailable"
                            }`
                        }
                    >
                        {productAvailable ? (
                            <CheckCircle2
                                size={21}
                            />
                        ) : (
                            <PackageX
                                size={21}
                            />
                        )}

                        <div>
                            <strong>
                                {productAvailable
                                    ? "Currently Available"
                                    : "Currently Out of Stock"}
                            </strong>

                            <span>
                                {availability
                                        ?.message ||
                                    product
                                        .availabilityMessage ||
                                    (productAvailable
                                        ? "Product is available."
                                        : "Product is currently unavailable.")}
                            </span>
                        </div>
                    </div>

                    {productAvailable && (
                        <p className="catalog-quantity-message">
                            {availableQuantity}{" "}
                            item(s) currently in
                            stock
                        </p>
                    )}
                </div>
            </section>

            <section className="catalog-details-sections">
                <article className="catalog-information-card">
                    <h2>
                        Product Description
                    </h2>

                    <p>
                        {product.description ||
                            "No product description is currently available."}
                    </p>
                </article>

                <article className="catalog-information-card">
                    <h2>
                        Vehicle Compatibility
                    </h2>

                    <dl className="catalog-specification-list">
                        <div>
                            <dt>
                                Vehicle Make
                            </dt>

                            <dd>
                                {product
                                        .vehicleMake ||
                                    "Not specified"}
                            </dd>
                        </div>

                        <div>
                            <dt>
                                Vehicle Model
                            </dt>

                            <dd>
                                {product
                                        .vehicleModel ||
                                    "Not specified"}
                            </dd>
                        </div>

                        <div>
                            <dt>
                                Manufacture Year
                            </dt>

                            <dd>
                                {product
                                        .manufactureYear ||
                                    "Not specified"}
                            </dd>
                        </div>
                    </dl>
                </article>

                <div className="product-purchase-section">
                    <div className="quantity-selector">
                        <button
                            type="button"
                            onClick={
                                decreaseQuantity
                            }
                            disabled={
                                !productAvailable ||
                                quantity <= 1
                            }
                            aria-label={
                                "Decrease quantity"
                            }
                        >
                            −
                        </button>

                        <input
                            type="number"
                            min="1"
                            max={
                                maximumQuantity
                            }
                            value={quantity}
                            onChange={
                                handleQuantityChange
                            }
                            disabled={
                                !productAvailable
                            }
                            aria-label={
                                "Product quantity"
                            }
                        />

                        <button
                            type="button"
                            onClick={
                                increaseQuantity
                            }
                            disabled={
                                !productAvailable ||
                                quantity >=
                                maximumQuantity
                            }
                            aria-label={
                                "Increase quantity"
                            }
                        >
                            +
                        </button>
                    </div>

                    <AddToCartButton
                        sparePartId={
                            product.id
                        }
                        quantity={quantity}
                        disabled={
                            !productAvailable ||
                            availableQuantity <= 0
                        }
                    />
                </div>

                <article className="catalog-information-card">
                    <h2>
                        Purchase Information
                    </h2>

                    <div className="catalog-delivery-item">
                        <Truck size={24} />

                        <div>
                            <strong>
                                Order processing
                            </strong>

                            <p>
                                Stock will be
                                verified again
                                during order
                                confirmation.
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    );
}