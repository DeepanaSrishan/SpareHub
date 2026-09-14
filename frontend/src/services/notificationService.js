import apiClient from "../api/apiClient";

const notificationService = {
    getNotifications: async (
        unreadOnly = false,
        page = 0,
        size = 10
    ) => {
        const response = await apiClient.get("/notifications", {
            params: {
                unreadOnly,
                page,
                size,
            },
        });

        return response.data.data;
    },

    getUnreadCount: async () => {
        const response = await apiClient.get(
            "/notifications/unread-count"
        );

        return response.data.data;
    },

    markAsRead: async (notificationId) => {
        const response = await apiClient.patch(
            `/notifications/${notificationId}/read`
        );

        return response.data.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.patch(
            "/notifications/read-all"
        );

        return response.data;
    },
};

export default notificationService;