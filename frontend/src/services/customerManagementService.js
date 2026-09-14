import apiClient from "../api/apiClient";

const customerManagementService = {
    getCustomers: async ({
                             search = "",
                             page = 0,
                             size = 10,
                         } = {}) => {
        const response = await apiClient.get("/staff/customers", {
            params: {
                search,
                page,
                size,
            },
        });

        return response.data.data;
    },

    getCustomerById: async (customerId) => {
        const response = await apiClient.get(
            `/staff/customers/${customerId}`
        );

        return response.data.data;
    },

    getCustomerHistory: async (
        customerId,
        page = 0,
        size = 10
    ) => {
        const response = await apiClient.get(
            `/staff/customers/${customerId}/history`,
            {
                params: {
                    page,
                    size,
                },
            }
        );

        return response.data.data;
    },

    getInactiveCustomers: async ({
                                     inactiveDays = 90,
                                     page = 0,
                                     size = 10,
                                 } = {}) => {
        const response = await apiClient.get(
            "/staff/customers/inactive",
            {
                params: {
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
            `/staff/customers/${customerId}/loyalty-tier`,
            {
                loyaltyTier,
            }
        );

        return response.data.data;
    },
};

export default customerManagementService;