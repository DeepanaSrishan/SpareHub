import api from "./api";

const extractData = (response) => {
    return response?.data?.data ?? response?.data;
};

export const getReorderRecommendations = async (includeAdequate = false) => {
    const response = await api.get("/inventory/reorder-recommendations", {
        params: { includeAdequate },
    });
    return extractData(response);
};

export const getRecommendationForPart = async (sparePartId) => {
    const response = await api.get(`/inventory/reorder-recommendations/${sparePartId}`);
    return extractData(response);
};
