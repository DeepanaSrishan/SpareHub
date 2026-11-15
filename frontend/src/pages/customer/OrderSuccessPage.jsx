import {
    Link,
    Navigate,
    useLocation,
} from "react-router-dom";
import {
    CheckCircle2,
    PackageCheck,
} from "lucide-react";

import "../../styles/cart.css";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const OrderSuccessPage = () => {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <Navigate
                to="/customer/orders"
                replace
            />
        );
    }

    return (
        <main className="cart-page">
            <section className="order-success-card">
                <div className="success-icon">
                    <CheckCircle2 size={52} />
                </div>

                <span className="success-label">
                    Order submitted
                </span>

                <h1>Your order was placed successfully</h1>

                <p>
                    SpareHub Sales Staff will review the
                    order and verify stock availability.
                </p>

                <div className="success-order-number">
                    <span>Order number</span>
                    <strong>{order.orderNumber}</strong>
                </div>

                <div className="success-summary">
                    <div>
                        <span>Subtotal</span>
                        <strong>
                            {formatCurrency(order.subtotal)}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Loyalty discount (
                            {order.discountPercentage}%)
                        </span>
                        <strong>
                            −{" "}
                            {formatCurrency(
                                order.discountAmount
                            )}
                        </strong>
                    </div>

                    <div className="success-total">
                        <span>Final total</span>
                        <strong>
                            {formatCurrency(
                                order.totalAmount
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Order status</span>
                        <strong className="status-badge pending">
                            {order.orderStatus}
                        </strong>
                    </div>

                    <div>
                        <span>Payment status</span>
                        <strong>
                            {order.paymentStatus}
                        </strong>
                    </div>
                </div>

                <div className="success-actions">
                    <Link
                        to={`/customer/orders/${order.orderId}`}
                        className="primary-button"
                    >
                        <PackageCheck size={18} />
                        View order
                    </Link>

                    <Link
                        to="/catalog"
                        className="secondary-button"
                    >
                        Continue shopping
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default OrderSuccessPage;