import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Check,
    CheckCircle2,
    Copy,
    CreditCard,
    Info,
    Landmark,
    Lock,
    LockKeyhole,
    ShieldCheck,
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

const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
};

const getCardBrand = (cardNumber) => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "American Express";
    return "";
};

const bankAccounts = [
    {
        id: "combank",
        bankName: "Commercial Bank of Ceylon",
        accountName: "SpareHub Auto (Pvt) Ltd",
        accountNumber: "1000 4589 7234",
        branch: "Colombo City Branch",
    },
    {
        id: "boc",
        bankName: "Bank of Ceylon (BOC)",
        accountName: "SpareHub Auto (Pvt) Ltd",
        accountNumber: "0089 1234 5678",
        branch: "Kollupitiya Branch",
    },
    {
        id: "hnb",
        bankName: "Hatton National Bank (HNB)",
        accountName: "SpareHub Auto (Pvt) Ltd",
        accountNumber: "0450 2000 8912",
        branch: "Head Office Branch",
    },
];

const CheckoutPage = () => {
    const navigate = useNavigate();

    const {
        cart,
        loading,
        loadCart,
        resetCart,
    } = useCart();

    const [customerNote, setCustomerNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    // Card details
    const [cardDetails, setCardDetails] = useState({
        cardHolderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });

    // Bank transfer details
    const [bankDetails, setBankDetails] = useState({
        bankName: "Commercial Bank of Ceylon",
        depositSlipReference: "",
        transferDate: new Date().toISOString().split("T")[0],
    });

    const [copiedAccount, setCopiedAccount] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
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

    const handleCopyAccount = (accountNumber, id) => {
        navigator.clipboard.writeText(accountNumber.replace(/\s+/g, ""));
        setCopiedAccount(id);
        setTimeout(() => setCopiedAccount(""), 2000);
    };

    const validatePaymentDetails = () => {
        if (paymentMethod === "CARD") {
            const digits = cardDetails.cardNumber.replace(/\D/g, "");
            if (digits.length !== 16) {
                return "Please enter a valid 16-digit credit/debit card number.";
            }
            if (!cardDetails.cardHolderName.trim()) {
                return "Please enter the cardholder's full name.";
            }
            if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
                return "Please enter a valid expiry date in MM/YY format.";
            }
            const [month, year] = cardDetails.expiryDate.split("/").map(Number);
            if (!month || month < 1 || month > 12) {
                return "Invalid expiry month. Month must be between 01 and 12.";
            }
            if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
                return "Please enter a valid 3 or 4 digit CVV/CVC.";
            }
        }

        if (paymentMethod === "BANK_TRANSFER") {
            if (!bankDetails.depositSlipReference.trim()) {
                return "Please enter the deposit slip number or online transfer reference.";
            }
        }

        return null;
    };

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

        const validationError = validatePaymentDetails();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setError("");
            setPlacingOrder(true);

            let paymentData = null;
            if (paymentMethod === "CARD") {
                paymentData = {
                    paymentMethod: "CARD",
                    cardNumber: cardDetails.cardNumber.replace(/\s+/g, ""),
                    cardHolderName: cardDetails.cardHolderName.trim(),
                    expiryDate: cardDetails.expiryDate.trim(),
                    cvv: cardDetails.cvv.trim(),
                    note: "Online Card Payment by " + cardDetails.cardHolderName.trim(),
                };
            } else if (paymentMethod === "BANK_TRANSFER") {
                paymentData = {
                    paymentMethod: "BANK_TRANSFER",
                    bankName: bankDetails.bankName,
                    depositSlipReference: bankDetails.depositSlipReference.trim(),
                    transferDate: bankDetails.transferDate,
                    note: "Direct Deposit to " + bankDetails.bankName,
                };
            }

            const order = await orderService.placeOrder(
                customerNote,
                paymentMethod,
                paymentData
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
                        to="/products"
                        className="primary-button"
                    >
                        Browse spare parts
                    </Link>
                </section>
            </main>
        );
    }

    const cardBrand = getCardBrand(cardDetails.cardNumber);

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
                    Review your items, select your payment method, and complete your order.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
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

                    {/* Payment Method Selector */}
                    <div className="checkout-payment-section">
                        <h2>Select Payment Method</h2>
                        <p className="payment-section-subtitle">
                            Choose how you would like to pay for your spare parts.
                        </p>

                        <div className="payment-methods-grid">
                            <button
                                type="button"
                                className={`payment-method-card ${
                                    paymentMethod === "CASH" ? "active" : ""
                                }`}
                                onClick={() => setPaymentMethod("CASH")}
                            >
                                <div className="payment-card-icon">
                                    <Banknote size={24} />
                                </div>
                                <div className="payment-card-content">
                                    <strong>Cash on Delivery / Pickup</strong>
                                    <span>Pay with cash at store or upon receiving items</span>
                                </div>
                                {paymentMethod === "CASH" && (
                                    <div className="payment-check-badge">
                                        <Check size={14} />
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                className={`payment-method-card ${
                                    paymentMethod === "CARD" ? "active" : ""
                                }`}
                                onClick={() => setPaymentMethod("CARD")}
                            >
                                <div className="payment-card-icon">
                                    <CreditCard size={24} />
                                </div>
                                <div className="payment-card-content">
                                    <strong>Credit / Debit Card</strong>
                                    <span>Instant payment via Visa, Mastercard, AMEX</span>
                                </div>
                                {paymentMethod === "CARD" && (
                                    <div className="payment-check-badge">
                                        <Check size={14} />
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                className={`payment-method-card ${
                                    paymentMethod === "BANK_TRANSFER" ? "active" : ""
                                }`}
                                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                            >
                                <div className="payment-card-icon">
                                    <Landmark size={24} />
                                </div>
                                <div className="payment-card-content">
                                    <strong>Direct Bank Transfer</strong>
                                    <span>Deposit to corporate account & enter slip reference</span>
                                </div>
                                {paymentMethod === "BANK_TRANSFER" && (
                                    <div className="payment-check-badge">
                                        <Check size={14} />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Cash Payment Details */}
                        {paymentMethod === "CASH" && (
                            <div className="payment-details-box cash-box">
                                <div className="payment-info-banner">
                                    <Info size={19} />
                                    <div>
                                        <strong>Cash Payment Guidelines</strong>
                                        <p>
                                            You can pay with cash when collecting your spare parts at SpareHub Colombo Main Warehouse, or hand over payment to the courier upon delivery.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Credit / Debit Card Form */}
                        {paymentMethod === "CARD" && (
                            <div className="payment-details-box card-box">
                                <div className="card-security-header">
                                    <ShieldCheck size={20} className="shield-icon" />
                                    <div>
                                        <strong>256-Bit SSL Secured Payment</strong>
                                        <span>Your card details are processed safely</span>
                                    </div>
                                    {cardBrand && (
                                        <span className="card-brand-tag">{cardBrand}</span>
                                    )}
                                </div>

                                <div className="card-form-grid">
                                    <div className="form-group full-width">
                                        <label htmlFor="cardHolderName">
                                            Cardholder Name
                                        </label>
                                        <input
                                            id="cardHolderName"
                                            type="text"
                                            placeholder="e.g. D. S. PERERA"
                                            value={cardDetails.cardHolderName}
                                            onChange={(e) =>
                                                setCardDetails({
                                                    ...cardDetails,
                                                    cardHolderName: e.target.value.toUpperCase(),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="cardNumber">
                                            Card Number
                                        </label>
                                        <div className="input-with-icon">
                                            <input
                                                id="cardNumber"
                                                type="text"
                                                maxLength="19"
                                                placeholder="4532 0000 1234 5678"
                                                value={cardDetails.cardNumber}
                                                onChange={(e) =>
                                                    setCardDetails({
                                                        ...cardDetails,
                                                        cardNumber: formatCardNumber(e.target.value),
                                                    })
                                                }
                                            />
                                            <CreditCard size={18} className="input-inner-icon" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="expiryDate">
                                            Expiry Date (MM/YY)
                                        </label>
                                        <input
                                            id="expiryDate"
                                            type="text"
                                            maxLength="5"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiryDate}
                                            onChange={(e) =>
                                                setCardDetails({
                                                    ...cardDetails,
                                                    expiryDate: formatExpiry(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="cvv">
                                            CVV / CVC
                                        </label>
                                        <div className="input-with-icon">
                                            <input
                                                id="cvv"
                                                type="password"
                                                maxLength="4"
                                                placeholder="•••"
                                                value={cardDetails.cvv}
                                                onChange={(e) =>
                                                    setCardDetails({
                                                        ...cardDetails,
                                                        cvv: e.target.value.replace(/\D/g, ""),
                                                    })
                                                }
                                            />
                                            <Lock size={16} className="input-inner-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Direct Bank Transfer Form */}
                        {paymentMethod === "BANK_TRANSFER" && (
                            <div className="payment-details-box bank-box">
                                <div className="bank-instructions-header">
                                    <Landmark size={20} />
                                    <div>
                                        <strong>SpareHub Corporate Bank Accounts</strong>
                                        <span>Deposit the total amount into one of the accounts below:</span>
                                    </div>
                                </div>

                                <div className="bank-accounts-list">
                                    {bankAccounts.map((acc) => (
                                        <div className="bank-account-item" key={acc.id}>
                                            <div className="bank-account-details">
                                                <strong>{acc.bankName}</strong>
                                                <span className="account-number-line">
                                                    Acc No: <code>{acc.accountNumber}</code>
                                                </span>
                                                <span className="account-sub-line">
                                                    {acc.accountName} · {acc.branch}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="copy-account-btn"
                                                onClick={() => handleCopyAccount(acc.accountNumber, acc.id)}
                                            >
                                                {copiedAccount === acc.id ? (
                                                    <>
                                                        <Check size={14} />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={14} />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="bank-transfer-inputs">
                                    <div className="form-group">
                                        <label htmlFor="bankSelect">Deposited Bank</label>
                                        <select
                                            id="bankSelect"
                                            value={bankDetails.bankName}
                                            onChange={(e) =>
                                                setBankDetails({
                                                    ...bankDetails,
                                                    bankName: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                                            <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                                            <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                                            <option value="Sampath Bank">Sampath Bank</option>
                                            <option value="Other Bank">Other Bank</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="slipReference">
                                            Deposit Slip No. / Transaction Ref <span className="req">*</span>
                                        </label>
                                        <input
                                            id="slipReference"
                                            type="text"
                                            placeholder="e.g. REF-983421 / Slip #4892"
                                            value={bankDetails.depositSlipReference}
                                            onChange={(e) =>
                                                setBankDetails({
                                                    ...bankDetails,
                                                    depositSlipReference: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="checkout-note">
                        <label htmlFor="customerNote">
                            Order note
                        </label>

                        <textarea
                            id="customerNote"
                            rows="4"
                            maxLength="500"
                            value={customerNote}
                            placeholder="Optional delivery instructions or notes for sales staff..."
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

                    <div className="summary-row summary-method">
                        <span>Payment method</span>
                        <span className="selected-method-pill">
                            {paymentMethod === "CARD" && "Credit / Debit Card"}
                            {paymentMethod === "BANK_TRANSFER" && "Bank Transfer"}
                            {paymentMethod === "CASH" && "Cash on Delivery"}
                        </span>
                    </div>

                    <div className="checkout-information">
                        <CheckCircle2 size={19} />

                        <p>
                            Product prices, stock, loyalty discount
                            and tax (8%) will be calculated
                            by SpareHub upon placing your order.
                        </p>
                    </div>

                    <div className="checkout-information">
                        <LockKeyhole size={19} />

                        <p>
                            The total sent by the browser is
                            never trusted. The final amount is
                            calculated securely by SpareHub.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="primary-button checkout-button"
                        disabled={placingOrder}
                        onClick={handlePlaceOrder}
                    >
                        {placingOrder
                            ? "Processing order..."
                            : paymentMethod === "CARD"
                            ? "Pay with Card & Place Order"
                            : paymentMethod === "BANK_TRANSFER"
                            ? "Submit Order & Transfer Details"
                            : "Place Order (Cash)"}
                    </button>
                </aside>
            </div>
        </main>
    );
};

export default CheckoutPage;