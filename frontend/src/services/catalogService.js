import apiClient from "../api/apiClient";

const catalogService = {
    searchProducts: async ({
                               search = "",
                               categoryId = "",
                               brand = "",
                               minimumPrice = "",
                               maximumPrice = "",
                               available = "",
                               page = 0,
                               size = 12,
                               sortBy = "name",
                               direction = "asc",
                           } = {}) => {
        const params = {
            page,
            size,
            sortBy,
            direction,
        };

        if (search.trim()) {
            params.search = search.trim();
        }

        if (categoryId) {
            params.categoryId = categoryId;
        }

        if (brand) {
            params.brand = brand;
        }

        if (minimumPrice !== "") {
            params.minimumPrice = minimumPrice;
        }

        if (maximumPrice !== "") {
            params.maximumPrice = maximumPrice;
        }

        if (available !== "") {
            params.available = available;
        }

        const response = await apiClient.get(
            "/catalog/spare-parts",
            { params }
        );

        return response.data.data;
    },

    getProductById: async (productId) => {
        const response = await apiClient.get(
            `/catalog/spare-parts/${productId}`
        );

        return response.data.data;
    },

    getAvailability: async (productId) => {
        const response = await apiClient.get(
            `/catalog/spare-parts/${productId}/availability`
        );

        return response.data.data;
    },

    getCategories: async () => {
        const response = await apiClient.get(
            "/catalog/categories"
        );

        return response.data.data;
    },

    getBrands: async () => {
        const response = await apiClient.get(
            "/catalog/brands"
        );

        return response.data.data;
    },
};

export default catalogService;