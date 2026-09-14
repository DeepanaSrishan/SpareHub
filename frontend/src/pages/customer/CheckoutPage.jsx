import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    LockKeyhole,
    ShoppingBag,
} from "lucide-react";

import useCart from "../../hooks/useCart";
import orderService from "../../services/orderService";
import getApiError from "../../utils/getApiError";
import "../../styles/cart.css";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const CheckoutPage = () => {
    const navigate = useNavigate();

    const {
        cart,
        loading,
        loadCart,
        resetCart,
    } = useCart();

    const [customerNote, setCustomerNote] =
        useState("");

    const [placingOrder, setPlacingOrder] =
        useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        loadCart().catch((requestError) => {
            setError(
                getApiError(
                    requestError,
                    "Could not load checkout information."
                )
            );
        });
    }, [loadCart]);

    const handlePlaceOrder = async () => {
        if (!cart?.items?.length) {
            setError(
                "Your cart is empty. Add spare parts before checkout."
            );
            return;
        }

        const unavailableItem = cart.items.find(
            (item) => !item.available
        );

        if (unavailableItem) {
            setError(
                `${unavailableItem.productName} is currently unavailable.`
            );
            return;
        }

        try {
            setError("");
            setPlacingOrder(true);

            const order = await orderService.placeOrder(
                customerNote
            );

            resetCart();

            navigate("/customer/order-success", {
                replace: true,
                state: { order },
            });
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not place your order."
                )
            );

            /*
             * Checkout වෙලාවේ stock වෙනස් වී තිබිය හැකි නිසා
             * latest cart availability එක නැවත load කරනවා.
             */
            await loadCart().catch(() => {});
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="page-state">
                Loading checkout...
            </div>
        );
    }

    if (!cart?.items?.length) {
        return (
            <main className="cart-page">
                <section className="empty-cart-card">
                    <ShoppingBag size={42} />

                    <h1>No items to checkout</h1>

                    <p>
                        Add at least one spare part before
                        placing an order.
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
            <div className="checkout-heading">
                <Link
                    to="/customer/cart"
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to cart
                </Link>

                <h1>Checkout</h1>

                <p>
                    Review your items before placing the
                    order.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="checkout-layout">
                <section className="checkout-main-card">
                    <h2>Order items</h2>

                    <div className="checkout-items">
                        {cart.items.map((item) => (
                            <div
                                className="checkout-item"
                                key={item.cartItemId}
                            >
                                <div>
                                    <strong>
                                        {item.productName}
                                    </strong>

                                    <span>
                                        {item.partNumber} · Qty{" "}
                                        {item.quantity}
                                    </span>
                                </div>

                                <strong>
                                    {formatCurrency(
                                        item.subtotal
                                    )}
                                </strong>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-note">
                        <label htmlFor="customerNote">
                            Order note
                        </label>

                        <textarea
                            id="customerNote"
                            rows="5"
                            maxLength="500"
                            value={customerNote}
                            placeholder="Optional message for sales staff..."
                            onChange={(event) =>
                                setCustomerNote(
                                    event.target.value
                                )
                            }
                        />

                        <span>
                            {customerNote.length}/500
                        </span>
                    </div>
                </section>

                <aside className="cart-summary-card">
                    <h2>Checkout summary</h2>

                    <div className="summary-row">
                        <span>Total quantity</span>
                        <strong>
                            {cart.totalQuantity}
                        </strong>
                    </div>

                    <div className="summary-row summary-total">
                        <span>Cart subtotal</span>
                        <strong>
                            {formatCurrency(cart.subtotal)}
                        </strong>
                    </div>

                    <div className="checkout-information">
                        <CheckCircle2 size={19} />

                        <p>
                            Product prices, stock and your
                            loyalty discount will be checked
                            again by the backend.
                        </p>
                    </div>

                    <div className="checkout-information">
                        <LockKeyhole size={19} />

                        <p>
                            The total sent by the browser is
                            never trusted. The final amount is
                            calculated by SpareHub.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="primary-button checkout-button"
                        disabled={placingOrder}
                        onClick={handlePlaceOrder}
                    >
                        {placingOrder
                            ? "Placing order..."
                            : "Place order"}
                    </button>
                </aside>
            </div>
        </main>
    );
};

export default CheckoutPage;