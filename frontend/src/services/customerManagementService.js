import apiClient from "../api/apiClient";

const customerManagementService = {
    getCustomers: async ({
                             search = "",
                             page = 0,
                             size = 10,
                         } = {}) => {
        const response = await apiClient.get("/customers", {
            params: {
                search,
                keyword: search,
                page,
                size,
            },
        });

        return response.data.data;
    },

    getCustomerById: async (customerId) => {
        const response = await apiClient.get(
            `/customers/${customerId}`
        );

        return response.data.data;
    },

    getCustomerHistory: async (
        customerId,
        page = 0,
        size = 10
    ) => {
        const response = await apiClient.get(
            `/customers/${customerId}/transactions`,
            {
                params: {
                    page,
                    size,
                },
            }
        );

        return response.data.data;
    },

    getCustomerOrders: async (customerId) => {
        const response = await apiClient.get(
            `/customers/${customerId}/orders`
        );

        return response.data.data;
    },

    getInactiveCustomers: async ({
                                     inactiveDays = 90,
                                     page = 0,
                                     size = 10,
                                 } = {}) => {
        const response = await apiClient.get(
            "/customers/inactive",
            {
                params: {
                    days: inactiveDays,
                    inactiveDays,
                    page,
                    size,
                },
            }
        );

        return response.data.data;
    },

    updateLoyaltyTier: async (customerId, loyaltyTier) => {
        const response = await apiClient.patch(
            `/customers/${customerId}/loyalty-tier`,
            {
                loyaltyTier,
                reason: "Tier updated by sales staff",
            }
        );

        return response.data.data;
    },
};

export default customerManagementService;