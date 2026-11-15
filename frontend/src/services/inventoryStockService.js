import apiClient from "../api/apiClient";

const inventoryStockService = {
    getProductById: async (productId) => {
        const response = await apiClient.get(
            `/inventory/spare-parts/${productId}`
        );

        return response.data.data;
    },

    adjustStock: async (
        productId,
        adjustment
    ) => {
        const response = await apiClient.post(
            `/inventory/spare-parts/${productId}/stock-adjustments`,
            adjustment
        );

        return response.data.data;
    },

    getProductTransactions: async (
        productId,
        page = 0,
        size = 10
    ) => {
        const response = await apiClient.get(
            `/inventory/spare-parts/${productId}/transactions`,
            {
                params: {
                    page,
                    size,
                },
            }
        );

        return response.data.data;
    },

    updateReorderLevel: async (
        productId,
        reorderLevel
    ) => {
        const response = await apiClient.patch(
            `/inventory/spare-parts/${productId}/reorder-level`,
            {
                reorderLevel,
            }
        );

        return response.data.data;
    },

    getLowStockProducts: async () => {
        const response = await apiClient.get(
            "/inventory/low-stock"
        );

        return response.data.data;
    },

    getLowStockDashboard: async () => {
        const response = await apiClient.get(
            "/inventory/low-stock/dashboard"
        );

        return response.data.data;
    },

    getLowStockAlerts: async ({
                                  status = "",
                                  page = 0,
                                  size = 10,
                              } = {}) => {
        const params = {
            page,
            size,
        };

        if (status) {
            params.status = status;
        }

        const response = await apiClient.get(
            "/inventory/low-stock-alerts",
            { params }
        );

        return response.data.data;
    },

    acknowledgeAlert: async (alertId) => {
        const response = await apiClient.patch(
            `/inventory/low-stock-alerts/${alertId}/acknowledge`
        );

        return response.data.data;
    },

    evaluateLowStock: async () => {
        const response = await apiClient.post(
            "/inventory/low-stock-alerts/evaluate"
        );

        return response.data;
    },
};

export default inventoryStockService;