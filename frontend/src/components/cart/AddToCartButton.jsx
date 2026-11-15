import { useState } from "react";
import { ShoppingCart } from "lucide-react";

import useCart from "../../hooks/useCart";
import getApiError from "../../utils/getApiError";

const AddToCartButton = ({
                             sparePartId,
                             disabled = false,
                             quantity = 1,
                             className = "",
                         }) => {
    const { addItem } = useCart();

    const [adding, setAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleAddToCart = async () => {
        try {
            setAdding(true);
            setMessage("");
            setError("");

            await addItem(sparePartId, quantity);

            setMessage("Added to cart successfully.");

            window.setTimeout(() => {
                setMessage("");
            }, 2500);
        } catch (requestError) {
            setError(
                getApiError(
                    requestError,
                    "Could not add this item to the cart."
                )
            );
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="add-to-cart-wrapper">
            <button
                type="button"
                className={`primary-button ${className}`}
                disabled={disabled || adding}
                onClick={handleAddToCart}
            >
                <ShoppingCart size={18} />

                {adding ? "Adding..." : "Add to cart"}
            </button>

            {message && (
                <small className="success-text">
                    {message}
                </small>
            )}

            {error && (
                <small className="error-text">
                    {error}
                </small>
            )}
        </div>
    );
};

export default AddToCartButton;