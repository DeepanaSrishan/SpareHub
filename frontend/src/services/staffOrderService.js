import api from "./api";

const staffOrderService = {
    async getOrders(status = "") {
        const config = status
            ? { params: { status } }
            : {};

        const response = await api.get(
            "/staff/orders",
            config
        );

        return response.data.data;
    },

    async getOrder(orderId) {
        const response = await api.get(
            `/staff/orders/${orderId}`
        );

        return response.data.data;
    },

    async verifyStock(orderId) {
        const response = await api.get(
            `/staff/orders/${orderId}/verify-stock`
        );

        return response.data.data;
    },

    async confirmOrder(orderId, staffNote = "") {
        const response = await api.post(
            `/staff/orders/${orderId}/confirm`,
            {
                staffNote: staffNote.trim() || null,
            }
        );

        return response.data.data;
    },

    async rejectOrder(orderId, reason) {
        const response = await api.post(
            `/staff/orders/${orderId}/reject`,
            { reason }
        );

        return response.data.data;
    },

    async updateStatus(
        orderId,
        status,
        staffNote = ""
    ) {
        const response = await api.put(
            `/staff/orders/${orderId}/status`,
            {
                status,
                staffNote: staffNote.trim() || null,
            }
        );

        return response.data.data;
    },

    async getStatusHistory(orderId) {
        const response = await api.get(
            `/staff/orders/${orderId}/status-history`
        );

        return response.data.data;
    },

    async generateInvoice(orderId) {
        const response = await api.post(
            `/staff/orders/${orderId}/invoice`
        );

        return response.data.data;
    },

    async getInvoice(orderId) {
        const response = await api.get(
            `/staff/orders/${orderId}/invoice`
        );

        return response.data.data;
    },

    async recordPayment(orderId, payment) {
        const response = await api.post(
            `/staff/orders/${orderId}/payments`,
            payment
        );

        return response.data.data;
    },

    async getPayments(orderId) {
        const response = await api.get(
            `/staff/orders/${orderId}/payments`
        );

        return response.data.data;
    },

    async approveCancellation(
        orderId,
        decisionNote = ""
    ) {
        const response = await api.post(
            `/staff/orders/${orderId}/cancellation/approve`,
            {
                decisionNote:
                    decisionNote.trim() || null,
            }
        );

        return response.data.data;
    },

    async rejectCancellation(orderId, decisionNote) {
        const response = await api.post(
            `/staff/orders/${orderId}/cancellation/reject`,
            { decisionNote }
        );

        return response.data.data;
    },

    async getRefund(orderId) {
        const response = await api.get(
            `/staff/orders/${orderId}/refund`
        );

        return response.data.data;
    },
};

export default staffOrderService;