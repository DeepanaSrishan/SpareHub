import apiClient from "../api/apiClient";

const loyaltyService = {
    getMyLoyalty: async () => {
        const response = await apiClient.get("/loyalty/me");
        return response.data.data;
    },
};

export default loyaltyService;