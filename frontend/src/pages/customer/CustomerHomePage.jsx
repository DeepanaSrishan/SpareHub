import { Link } from "react-router-dom";

import {
    PackageSearch,
    ShoppingCart,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

export default function CustomerHomePage() {
    const { user } = useAuth();

    const customerName =
        user?.fullName ||
        user?.name ||
        "Customer";

    return (
        <main className="dashboard-page">
            <span className="brand-label">
                CUSTOMER
            </span>

            <h1>
                Welcome, {customerName}
            </h1>

            <p>
                Browse available spare parts,
                manage your shopping cart and
                track your orders.
            </p>

            <div className="dashboard-actions">
                <Link
                    to="/products"
                    className="dashboard-action-card"
                >
                    <PackageSearch size={24} />

                    <div>
                        <h3>Browse Spare Parts</h3>

                        <p>
                            Find available products
                            and add them to your cart.
                        </p>
                    </div>
                </Link>

                <Link
                    to="/customer/orders"
                    className="dashboard-action-card"
                >
                    <PackageSearch size={24} />

                    <div>
                        <h3>My Orders</h3>

                        <p>
                            Track orders, payments
                            and invoices.
                        </p>
                    </div>
                </Link>

                <Link
                    to="/customer/cart"
                    className="dashboard-action-card"
                >
                    <ShoppingCart size={24} />

                    <div>
                        <h3>Shopping Cart</h3>

                        <p>
                            Review items and proceed
                            to checkout.
                        </p>
                    </div>
                </Link>
            </div>
        </main>
    );
}