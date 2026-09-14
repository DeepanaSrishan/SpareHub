import api from "./api";

const orderService = {
    async placeOrder(customerNote = "") {
        const response = await api.post("/orders", {
            customerNote: customerNote.trim() || null,
        });

        return response.data.data;
    },

    async getMyOrders() {
        const response = await api.get("/orders/my");
        return response.data.data;
    },

    async getOrderById(orderId) {
        const response = await api.get(
            `/orders/${orderId}`
        );

        return response.data.data;
    },

    async getOrderByNumber(orderNumber) {
        const response = await api.get(
            `/orders/number/${encodeURIComponent(
                orderNumber
            )}`
        );

        return response.data.data;
    },

    async getPaymentStatus(orderId) {
        const response = await api.get(
            `/orders/${orderId}/payment-status`
        );

        return response.data.data;
    },

    async getPayments(orderId) {
        const response = await api.get(
            `/orders/${orderId}/payments`
        );

        return response.data.data;
    },

    async getStatusHistory(orderId) {
        const response = await api.get(
            `/orders/${orderId}/status-history`
        );

        return response.data.data;
    },

    async requestCancellation(orderId, reason) {
        const response = await api.post(
            `/orders/${orderId}/cancellation-request`,
            { reason }
        );

        return response.data.data;
    },

    async getInvoice(orderId) {
        const response = await api.get(
            `/orders/${orderId}/invoice`
        );

        return response.data.data;
    },

    async getRefund(orderId) {
        const response = await api.get(
            `/orders/${orderId}/refund`
        );

        return response.data.data;
    },
};

export default orderService;