import { Link } from "react-router-dom";

import {
    CarFront,
    PackageCheck,
    PackageX,
} from "lucide-react";

import AddToCartButton from
        "../cart/AddToCartButton";

export default function ProductCard({
                                        product,
                                    }) {
    const formatPrice = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 2,
        }).format(value ?? 0);

    const availableQuantity =
        Number(product?.stockQuantity ?? 0);

    const productAvailable =
        product?.available === true &&
        availableQuantity > 0;

    return (
        <article className="catalog-product-card">
            <Link
                className="catalog-product-image-link"
                to={`/products/${product.id}`}
            >
                {product.imageUrl ? (
                    <img
                        className="catalog-product-image"
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.style.display =
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
                    className={`catalog-image-placeholder ${
                        product.imageUrl
                            ? "hidden"
                            : ""
                    }`}
                >
                    <CarFront size={48} />

                    <span>
                        No image available
                    </span>
                </div>

                <span className="catalog-category-badge">
                    {product.categoryName}
                </span>
            </Link>

            <div className="catalog-product-content">
                <div className="catalog-product-brand">
                    {product.brand}
                </div>

                <Link
                    to={`/products/${product.id}`}
                    className="catalog-product-name"
                >
                    {product.name}
                </Link>

                <div className="catalog-part-number">
                    Part No: {product.partNumber}
                </div>

                {(product.vehicleMake ||
                    product.vehicleModel) && (
                    <div className="catalog-compatibility">
                        {product.vehicleMake}

                        {product.vehicleMake &&
                            product.vehicleModel &&
                            " · "}

                        {product.vehicleModel}
                    </div>
                )}

                <div className="catalog-card-footer">
                    <strong className="catalog-product-price">
                        {formatPrice(
                            product.sellingPrice
                        )}
                    </strong>

                    <span
                        className={`catalog-stock-badge ${
                            productAvailable
                                ? "available"
                                : "unavailable"
                        }`}
                    >
                        {productAvailable ? (
                            <PackageCheck
                                size={15}
                            />
                        ) : (
                            <PackageX
                                size={15}
                            />
                        )}

                        {product.availabilityMessage ||
                            (productAvailable
                                ? "In Stock"
                                : "Out of Stock")}
                    </span>
                </div>

                <AddToCartButton
                    sparePartId={product.id}
                    quantity={1}
                    disabled={!productAvailable}
                />

                <Link
                    className="catalog-view-button"
                    to={`/products/${product.id}`}
                >
                    View Details
                </Link>
            </div>
        </article>
    );
}