import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import "../../styles/customer.css";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();
    }, [unreadOnly, page]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await notificationService.getNotifications(
                unreadOnly,
                page,
                10
            );

            /*
             * Spring Page response:
             * {
             *   content: [],
             *   totalPages: 1,
             *   number: 0
             * }
             *
             * Backend එක List එකක් පමණක් return කරනවා නම් ඒකත් support කරනවා.
             */
            if (Array.isArray(data)) {
                setNotifications(data);
                setTotalPages(1);
            } else {
                setNotifications(data?.content ?? []);
                setTotalPages(data?.totalPages ?? 0);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Notifications load කිරීම අසාර්ථකයි."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const data = await notificationService.getUnreadCount();

            const count =
                typeof data === "number"
                    ? data
                    : data?.unreadCount ?? data?.count ?? 0;

            setUnreadCount(count);
        } catch {
            setUnreadCount(0);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            setUnreadCount((previousCount) =>
                Math.max(previousCount - 1, 0)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Notification update කිරීම අසාර්ථකයි."
            );
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();

            setNotifications((previousNotifications) =>
                previousNotifications.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );

            setUnreadCount(0);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Notifications update කිරීම අසාර්ථකයි."
            );
        }
    };

    const handleFilterChange = (event) => {
        setUnreadOnly(event.target.checked);
        setPage(0);
    };

    return (
        <div className="customer-page">
            <div className="page-heading">
                <div>
                    <h1>Notifications</h1>
                    <p>
                        You have <strong>{unreadCount}</strong> unread
                        notification(s).
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                >
                    Mark All as Read
                </button>
            </div>

            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={handleFilterChange}
                />
                Show unread notifications only
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="page-message">Loading notifications...</div>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <h3>No notifications found</h3>
                    <p>Your account notifications will appear here.</p>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map((notification) => (
                        <article
                            key={notification.id}
                            className={`notification-card ${
                                notification.read ? "read" : "unread"
                            }`}
                        >
                            <div>
                                <div className="notification-title-row">
                                    <h3>{notification.title}</h3>

                                    {!notification.read && (
                                        <span className="unread-badge">New</span>
                                    )}
                                </div>

                                <p>{notification.message}</p>

                                <small>
                                    {notification.createdAt
                                        ? new Date(
                                            notification.createdAt
                                        ).toLocaleString()
                                        : ""}
                                </small>
                            </div>

                            {!notification.read && (
                                <button
                                    className="text-button"
                                    onClick={() =>
                                        handleMarkAsRead(notification.id)
                                    }
                                >
                                    Mark as Read
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="secondary-button"
                        disabled={page === 0}
                        onClick={() => setPage((current) => current - 1)}
                    >
                        Previous
                    </button>

                    <span>
            Page {page + 1} of {totalPages}
          </span>

                    <button
                        className="secondary-button"
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default NotificationsPage;