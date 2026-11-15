import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Printer,
    ReceiptText,
} from "lucide-react";

import orderService from "../../services/orderService";
import getApiError from "../../utils/getApiError";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import "../../styles/orders.css";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
    }).format(Number(amount ?? 0));

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-LK", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(value));
};

const InvoicePage = () => {
    const { orderId } = useParams();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await orderService.getInvoice(
                        orderId
                    );

                setInvoice(response);
            } catch (requestError) {
                setError(
                    getApiError(
                        requestError,
                        "Could not load this invoice."
                    )
                );
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [orderId]);

    if (loading) {
        return (
            <div className="page-state">
                Loading invoice...
            </div>
        );
    }

    if (!invoice) {
        return (
            <main className="orders-page">
                <Link
                    to={`/customer/orders/${orderId}`}
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to order
                </Link>

                <div className="alert alert-error invoice-error">
                    {error ||
                        "Invoice is currently unavailable."}
                </div>
            </main>
        );
    }

    return (
        <main className="invoice-page">
            <div className="invoice-toolbar no-print">
                <Link
                    to={`/customer/orders/${orderId}`}
                    className="back-link"
                >
                    <ArrowLeft size={17} />
                    Back to order
                </Link>

                <button
                    type="button"
                    className="primary-button"
                    onClick={() => window.print()}
                >
                    <Printer size={18} />
                    Print invoice
                </button>
            </div>

            <article className="invoice-document">
                <header className="invoice-header">
                    <div className="invoice-brand">
                        <div>
                            <ReceiptText size={30} />
                        </div>

                        <section>
                            <h1>SpareHub</h1>
                            <p>Spare Parts Sales System</p>
                        </section>
                    </div>

                    <div className="invoice-title">
                        <h2>INVOICE</h2>
                        <strong>
                            {invoice.invoiceNumber}
                        </strong>
                    </div>
                </header>

                <section className="invoice-meta-grid">
                    <div>
                        <span>Invoice date</span>
                        <strong>
                            {formatDate(
                                invoice.generatedAt
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Order number</span>
                        <strong>
                            {invoice.orderNumber}
                        </strong>
                    </div>

                    <div>
                        <span>Order status</span>
                        <OrderStatusBadge
                            status={invoice.orderStatus}
                        />
                    </div>

                    <div>
                        <span>Payment status</span>
                        <OrderStatusBadge
                            status={
                                invoice.paymentStatus
                            }
                        />
                    </div>
                </section>

                <section className="invoice-customer">
                    <span>Bill to</span>
                    <h3>{invoice.customerName}</h3>
                    <p>{invoice.customerEmail}</p>
                </section>

                <div className="invoice-table-wrapper">
                    <table className="invoice-table">
                        <thead>
                        <tr>
                            <th>Part</th>
                            <th>Description</th>
                            <th>Unit price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                        </tr>
                        </thead>

                        <tbody>
                        {invoice.items?.map((item) => (
                            <tr key={item.orderItemId}>
                                <td>
                                    {item.partNumber}
                                </td>

                                <td>
                                    {item.productName}
                                </td>

                                <td>
                                    {formatCurrency(
                                        item.unitPrice
                                    )}
                                </td>

                                <td>{item.quantity}</td>

                                <td>
                                    {formatCurrency(
                                        item.subtotal
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <section className="invoice-totals">
                    <div>
                        <span>Subtotal</span>
                        <strong>
                            {formatCurrency(
                                invoice.subtotal
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Loyalty discount (
                            {invoice.discountPercentage}%)
                        </span>

                        <strong>
                            −{" "}
                            {formatCurrency(
                                invoice.discountAmount
                            )}
                        </strong>
                    </div>

                    {Number(invoice.taxAmount || 0) > 0 && (
                        <div>
                            <span>
                                Tax (
                                {invoice.taxRate ?? 0}%)
                            </span>

                            <strong>
                                +{" "}
                                {formatCurrency(
                                    invoice.taxAmount
                                )}
                            </strong>
                        </div>
                    )}

                    <div className="invoice-grand-total">
                        <span>Total amount</span>
                        <strong>
                            {formatCurrency(
                                invoice.totalAmount
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Paid amount</span>
                        <strong>
                            {formatCurrency(
                                invoice.paidAmount
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Balance</span>
                        <strong>
                            {formatCurrency(
                                invoice.remainingAmount
                            )}
                        </strong>
                    </div>
                </section>

                <footer className="invoice-footer">
                    <p>
                        Thank you for choosing SpareHub.
                    </p>

                    <span>
                        Generated by{" "}
                        {invoice.generatedByName}
                    </span>
                </footer>
            </article>
        </main>
    );
};

export default InvoicePage;