import { useEffect, useState } from "react";
import {
    AlertTriangle,
    BellRing,
    CheckCheck,
    PackageCheck,
    RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import inventoryStockService from "../../services/inventoryStockService";
import "../../styles/inventoryOperations.css";

export default function LowStockAlertsPage() {
    const [dashboard, setDashboard] =
        useState(null);
    const [alerts, setAlerts] = useState([]);

    const [status, setStatus] =
        useState("OPEN");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] =
        useState(0);

    const [loading, setLoading] =
        useState(true);
    const [evaluating, setEvaluating] =
        useState(false);
    const [updatingId, setUpdatingId] =
        useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] =
        useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [status, page]);

    const loadDashboard = async () => {
        try {
            const data =
                await inventoryStockService
                    .getLowStockDashboard();

            setDashboard(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Low-stock dashboard load කිරීම අසාර්ථකයි."
            );
        }
    };

    const loadAlerts = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await inventoryStockService
                    .getLowStockAlerts({
                        status,
                        page,
                        size: 10,
                    });

            if (Array.isArray(data)) {
                setAlerts(data);
                setTotalPages(data.length ? 1 : 0);
            } else {
                setAlerts(data?.content ?? []);
                setTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Low-stock alerts load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        await Promise.all([
            loadDashboard(),
            loadAlerts(),
        ]);
    };

    const handleEvaluate = async () => {
        try {
            setEvaluating(true);
            setError("");
            setMessage("");

            await inventoryStockService
                .evaluateLowStock();

            await refreshData();

            setMessage(
                "සියලු products සඳහා low-stock evaluation එක complete."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Low-stock evaluation අසාර්ථකයි."
            );
        } finally {
            setEvaluating(false);
        }
    };

    const handleAcknowledge = async (
        alert
    ) => {
        try {
            setUpdatingId(alert.id);
            setError("");
            setMessage("");

            const updated =
                await inventoryStockService
                    .acknowledgeAlert(alert.id);

            setAlerts((current) =>
                current.map((item) =>
                    item.id === alert.id
                        ? { ...item, ...updated }
                        : item
                )
            );

            await loadDashboard();

            setMessage(
                `${alert.sparePartName} alert acknowledged.`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Alert acknowledge කිරීම අසාර්ථකයි."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (value) =>
        value
            ? new Date(value).toLocaleString()
            : "—";

    return (
        <main className="stock-page">
            <div className="stock-heading">
                <div>
                    <h1>Low-Stock Alerts</h1>
                    <p>
                        Monitor products that require
                        replenishment.
                    </p>
                </div>

                <button
                    type="button"
                    className="stock-primary-button"
                    onClick={handleEvaluate}
                    disabled={evaluating}
                >
                    <RefreshCw
                        size={17}
                        className={
                            evaluating ? "stock-spinning" : ""
                        }
                    />

                    {evaluating
                        ? "Evaluating..."
                        : "Evaluate All Products"}
                </button>
            </div>

            {error && (
                <div className="stock-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="stock-alert success">
                    {message}
                </div>
            )}

            <section className="stock-stat-grid">
                <article className="stock-stat-card warning">
                    <AlertTriangle size={22} />
                    <span>Low-Stock Products</span>
                    <strong>
                        {dashboard?.totalLowStockProducts ??
                            0}
                    </strong>
                </article>

                <article className="stock-stat-card danger">
                    <BellRing size={22} />
                    <span>Open Alerts</span>
                    <strong>
                        {dashboard?.openAlerts ?? 0}
                    </strong>
                </article>

                <article className="stock-stat-card">
                    <CheckCheck size={22} />
                    <span>Acknowledged</span>
                    <strong>
                        {dashboard?.acknowledgedAlerts ??
                            0}
                    </strong>
                </article>
            </section>

            <section className="stock-card">
                <div className="stock-alert-filters">
                    <h2>Alert History</h2>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">All Alerts</option>
                        <option value="OPEN">
                            Open Alerts
                        </option>
                        <option value="ACKNOWLEDGED">
                            Acknowledged
                        </option>
                        <option value="RESOLVED">
                            Resolved
                        </option>
                    </select>
                </div>

                {loading ? (
                    <div className="stock-page-message">
                        Loading alerts...
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="stock-empty">
                        <PackageCheck size={46} />
                        <h3>No alerts found</h3>
                        <p>
                            No inventory alerts match this
                            status.
                        </p>
                    </div>
                ) : (
                    <div className="stock-alert-list">
                        {alerts.map((alert) => (
                            <article
                                key={alert.id}
                                className={`stock-alert-card ${alert.status.toLowerCase()}`}
                            >
                                <div className="stock-alert-icon">
                                    <AlertTriangle size={22} />
                                </div>

                                <div className="stock-alert-content">
                                    <div className="stock-alert-title">
                                        <div>
                                            <h3>
                                                {alert.sparePartName}
                                            </h3>

                                            <span>
                        {alert.partNumber}
                      </span>
                                        </div>

                                        <span
                                            className={`stock-alert-status ${alert.status.toLowerCase()}`}
                                        >
                      {alert.status}
                    </span>
                                    </div>

                                    <p>{alert.message}</p>

                                    <div className="stock-alert-values">
                    <span>
                      Current stock:{" "}
                        <strong>
                        {alert.stockQuantity}
                      </strong>
                    </span>

                                        <span>
                      Reorder level:{" "}
                                            <strong>
                        {alert.reorderLevel}
                      </strong>
                    </span>

                                        <span>
                      Created:{" "}
                                            <strong>
                        {formatDate(
                            alert.createdAt
                        )}
                      </strong>
                    </span>
                                    </div>

                                    {alert.acknowledgedByEmail && (
                                        <small>
                                            Acknowledged by{" "}
                                            {alert.acknowledgedByEmail} at{" "}
                                            {formatDate(
                                                alert.acknowledgedAt
                                            )}
                                        </small>
                                    )}

                                    {alert.resolvedAt && (
                                        <small>
                                            Resolved at{" "}
                                            {formatDate(alert.resolvedAt)}
                                        </small>
                                    )}
                                </div>

                                <div className="stock-alert-actions">
                                    <Link
                                        to={`/inventory/products/${alert.sparePartId}/stock`}
                                        className="stock-secondary-link"
                                    >
                                        Manage Stock
                                    </Link>

                                    {alert.status === "OPEN" && (
                                        <button
                                            type="button"
                                            className="stock-primary-button"
                                            disabled={
                                                updatingId === alert.id
                                            }
                                            onClick={() =>
                                                handleAcknowledge(alert)
                                            }
                                        >
                                            <CheckCheck size={16} />

                                            {updatingId === alert.id
                                                ? "Saving..."
                                                : "Acknowledge"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="stock-pagination">
                        <button
                            disabled={page === 0}
                            onClick={() =>
                                setPage(
                                    (current) => current - 1
                                )
                            }
                        >
                            Previous
                        </button>

                        <span>
              Page {page + 1} of {totalPages}
            </span>

                        <button
                            disabled={
                                page + 1 >= totalPages
                            }
                            onClick={() =>
                                setPage(
                                    (current) => current + 1
                                )
                            }
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}