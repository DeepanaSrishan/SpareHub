import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import cartService from "../services/cartService";
import useAuth from "../hooks/useAuth";

export const CartContext = createContext(null);

const emptyCart = {
    cartId: null,
    items: [],
    totalItemTypes: 0,
    totalQuantity: 0,
    subtotal: 0,
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    const [cart, setCart] = useState(emptyCart);
    const [loading, setLoading] = useState(false);

    const loadCart = useCallback(async () => {
        if (!user) {
            setCart(emptyCart);
            return;
        }

        try {
            setLoading(true);

            const response = await cartService.getCart();

            setCart({
                ...emptyCart,
                ...response,
                items: response?.items ?? [],
            });
        } catch (error) {
            /*
             * Staff accounts වලට /api/cart access නැති නිසා
             * 401/403 errors මෙතැන UI එකට throw කරන්නේ නැහැ.
             */
            if (
                error?.response?.status === 401 ||
                error?.response?.status === 403
            ) {
                setCart(emptyCart);
                return;
            }

            throw error;
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadCart().catch(() => {
            setCart(emptyCart);
        });
    }, [loadCart]);

    const addItem = async (sparePartId, quantity = 1) => {
        const updatedCart = await cartService.addItem(
            sparePartId,
            quantity
        );

        setCart({
            ...emptyCart,
            ...updatedCart,
            items: updatedCart?.items ?? [],
        });

        return updatedCart;
    };

    const updateItem = async (cartItemId, quantity) => {
        const updatedCart = await cartService.updateItem(
            cartItemId,
            quantity
        );

        setCart({
            ...emptyCart,
            ...updatedCart,
            items: updatedCart?.items ?? [],
        });

        return updatedCart;
    };

    const removeItem = async (cartItemId) => {
        const updatedCart = await cartService.removeItem(
            cartItemId
        );

        setCart({
            ...emptyCart,
            ...updatedCart,
            items: updatedCart?.items ?? [],
        });

        return updatedCart;
    };

    const clearCart = async () => {
        const updatedCart = await cartService.clearCart();

        setCart({
            ...emptyCart,
            ...updatedCart,
            items: updatedCart?.items ?? [],
        });

        return updatedCart;
    };

    const resetCart = () => {
        setCart(emptyCart);
    };

    const contextValue = useMemo(
        () => ({
            cart,
            loading,
            loadCart,
            addItem,
            updateItem,
            removeItem,
            clearCart,
            resetCart,
        }),
        [cart, loading, loadCart]
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;