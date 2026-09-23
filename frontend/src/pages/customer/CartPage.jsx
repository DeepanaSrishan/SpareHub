import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import useCart from "../../hooks/useCart";
import loyaltyService from "../../services/loyaltyService";
import getApiError from "../../utils/getApiError";
import "../../styles/cart.css";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const CartPage = () => {
    const navigate = useNavigate();

    const {
        cart,
        loading,
        loadCart,
        updateItem,
        removeItem,
        clearCart,
    } = useCart();

    const [workingItemId, setWorkingItemId] =
        useState(null);

    const [loyalty, setLoyalty] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCart().catch((requestError) => {
            setError(
                getApiError(
                    requestError,
                    "Could not load your cart."
                )
            );
        });

        loyaltyService
            .getMyLoyalty()
            .then(setLoyalty)
            .catch(() => setLoyalty(null));
    }, [loadCart]);

    const handleQuantityChange = async (
        item,
        newQuantity
    ) => {
        if (newQuantity < 1) {
            return;
        }

        if (newQuantity > item.availableStock) {
            setError(
                `Only ${item.availableStock} units are available.`
            );
            return;
        }

        try {
            setError("");
            setWorkingItemId(item.cartItemId);

            await updateItem(
                item.cartItemId,
                newQuantity
            );
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not update the cart item."
                )
            );
        } finally {
            setWorkingItemId(null);
        }
    };

    const handleRemove = async (cartItemId) => {
        const confirmed = window.confirm(
            "Remove this spare part from your cart?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setWorkingItemId(cartItemId);

            await removeItem(cartItemId);
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not remove the cart item."
                )
            );
        } finally {
            setWorkingItemId(null);
        }
    };

    const handleClearCart = async () => {
        const confirmed = window.confirm(
            "Remove every item from your cart?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setClearing(true);

            await clearCart();
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not clear the cart."
                )
            );
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return (
            <div className="page-state">
                Loading your cart...
            </div>
        );
    }

    const items = cart?.items ?? [];
    const hasUnavailableItem = items.some(
        (item) => !item.available
    );

    if (items.length === 0) {
        return (
            <main className="cart-page">
                <section className="empty-cart-card">
                    <div className="empty-cart-icon">
                        <ShoppingBag size={42} />
                    </div>

                    <h1>Your cart is empty</h1>

                    <p>
                        Browse the SpareHub catalog and add
                        the spare parts you need.
                    </p>

                    <Link
                        to="/catalog"
                        className="primary-button"
                    >
                        Browse spare parts
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="cart-heading">
                <div>
                    <Link
                        to="/catalog"
                        className="back-link"
                    >
                        <ArrowLeft size={17} />
                        Continue shopping
                    </Link>

                    <h1>Shopping cart</h1>

                    <p>
                        {cart.totalQuantity} item
                        {cart.totalQuantity !== 1 ? "s" : ""}
                    </p>
                </div>

                <button
                    type="button"
                    className="danger-text-button"
                    onClick={handleClearCart}
                    disabled={clearing}
                >
                    <Trash2 size={17} />
                    {clearing ? "Clearing..." : "Clear cart"}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="cart-layout">
                <section className="cart-items-card">
                    {items.map((item) => {
                        const working =
                            workingItemId ===
                            item.cartItemId;

                        return (
                            <article
                                className="cart-item"
                                key={item.cartItemId}
                            >
                                <div className="cart-item-image">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                        />
                                    ) : (
                                        <ShoppingBag size={28} />
                                    )}
                                </div>

                                <div className="cart-item-info">
                                    <span className="part-number">
                                        {item.partNumber}
                                    </span>

                                    <h2>{item.productName}</h2>

                                    {item.brand && (
                                        <p>{item.brand}</p>
                                    )}

                                    <strong>
                                        {formatCurrency(
                                            item.unitPrice
                                        )}
                                    </strong>

                                    {!item.available && (
                                        <span className="stock-error">
                                            Requested quantity is
                                            currently unavailable.
                                        </span>
                                    )}

                                    <span className="stock-text">
                                        {item.availableStock} in stock
                                    </span>
                                </div>

                                <div className="cart-item-actions">
                                    <div className="quantity-selector">
                                        <button
                                            type="button"
                                            disabled={
                                                working ||
                                                item.quantity <= 1
                                            }
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item,
                                                    item.quantity - 1
                                                )
                                            }
                                        >
                                            <Minus size={16} />
                                        </button>

                                        <input
                                            type="number"
                                            value={item.quantity}
                                            min="1"
                                            max={
                                                item.availableStock
                                            }
                                            disabled={working}
                                            onChange={(event) => {
                                                const value =
                                                    Number(
                                                        event.target
                                                            .value
                                                    );

                                                if (
                                                    Number.isInteger(
                                                        value
                                                    )
                                                ) {
                                                    handleQuantityChange(
                                                        item,
                                                        value
                                                    );
                                                }
                                            }}
                                        />

                                        <button
                                            type="button"
                                            disabled={
                                                working ||
                                                item.quantity >=
                                                item.availableStock
                                            }
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <strong className="item-subtotal">
                                        {formatCurrency(
                                            item.subtotal
                                        )}
                                    </strong>

                                    <button
                                        type="button"
                                        className="remove-button"
                                        disabled={working}
                                        onClick={() =>
                                            handleRemove(
                                                item.cartItemId
                                            )
                                        }
                                    >
                                        <Trash2 size={17} />
                                        Remove
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <aside className="cart-summary-card">
                    <h2>Order summary</h2>

                    <div className="summary-row">
                        <span>Product types</span>
                        <strong>
                            {cart.totalItemTypes}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>Total quantity</span>
                        <strong>
                            {cart.totalQuantity}
                        </strong>
                    </div>

                    <div className="summary-row summary-total">
                        <span>Subtotal</span>
                        <strong>
                            {formatCurrency(cart.subtotal)}
                        </strong>
                    </div>

                    {loyalty && (
                        <div className="summary-row" style={{ color: "#166534" }}>
                            <span>
                                Loyalty Discount ({loyalty.currentTier || "Tier"} {loyalty.discountPercentage ?? 0}%)
                            </span>
                            <strong>
                                -{formatCurrency(((Number(cart.subtotal || 0)) * (Number(loyalty.discountPercentage || 0))) / 100)}
                            </strong>
                        </div>
                    )}

                    <div className="summary-row" style={{ color: "var(--text-muted, #64736B)", fontSize: "13px" }}>
                        <span>Estimated Tax (8%)</span>
                        <span>
                            +{formatCurrency((Math.max((Number(cart.subtotal || 0)) - (((Number(cart.subtotal || 0)) * (Number(loyalty?.discountPercentage || 0))) / 100), 0) * 8) / 100)}
                        </span>
                    </div>

                    <div className="summary-row" style={{ borderTop: "1px dashed var(--border, #E2E8F0)", paddingTop: "10px", marginTop: "6px" }}>
                        <span style={{ fontWeight: "700" }}>Estimated Total</span>
                        <strong style={{ fontSize: "1.2rem", color: "var(--primary-forest, #071C14)" }}>
                            {formatCurrency(
                                Math.max((Number(cart.subtotal || 0)) - (((Number(cart.subtotal || 0)) * (Number(loyalty?.discountPercentage || 0))) / 100), 0) * 1.08
                            )}
                        </strong>
                    </div>

                    <p className="summary-help">
                        {loyalty?.discountPercentage > 0
                            ? `Enjoy your ${loyalty.discountPercentage}% discount as a valued ${loyalty.currentTier} member!`
                            : "Earn reward points with this purchase to unlock higher tier discounts."}
                    </p>

                    <button
                        type="button"
                        className="primary-button checkout-button"
                        disabled={hasUnavailableItem}
                        onClick={() =>
                            navigate("/customer/checkout")
                        }
                    >
                        Proceed to checkout
                    </button>

                    {hasUnavailableItem && (
                        <p className="stock-error">
                            Update unavailable items before
                            checkout.
                        </p>
                    )}
                </aside>
            </div>
        </main>
    );
};

export default CartPage;