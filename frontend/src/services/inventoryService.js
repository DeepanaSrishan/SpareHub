import apiClient from "../api/apiClient";

const inventoryService = {
    // Category APIs
    getCategories: async ({
                              search = "",
                              active = "",
                              page = 0,
                              size = 100,
                          } = {}) => {
        const params = { page, size };

        if (search.trim()) {
            params.search = search.trim();
        }

        if (active !== "") {
            params.active = active;
        }

        const response = await apiClient.get(
            "/inventory/categories",
            { params }
        );

        return response.data.data;
    },

    getActiveCategories: async () => {
        const response = await apiClient.get(
            "/catalog/categories"
        );

        return response.data.data;
    },

    createCategory: async (category) => {
        const response = await apiClient.post(
            "/inventory/categories",
            category
        );

        return response.data.data;
    },

    updateCategory: async (
        categoryId,
        category
    ) => {
        const response = await apiClient.put(
            `/inventory/categories/${categoryId}`,
            category
        );

        return response.data.data;
    },

    updateCategoryStatus: async (
        categoryId,
        active
    ) => {
        const response = await apiClient.patch(
            `/inventory/categories/${categoryId}/status`,
            { active }
        );

        return response.data.data;
    },

    deleteCategory: async (categoryId) => {
        const response = await apiClient.delete(
            `/inventory/categories/${categoryId}`
        );

        return response.data;
    },

    // Spare-part APIs
    getProducts: async ({
                            search = "",
                            status = "",
                            categoryId = "",
                            page = 0,
                            size = 10,
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

        if (status) {
            params.status = status;
        }

        if (categoryId) {
            params.categoryId = categoryId;
        }

        const response = await apiClient.get(
            "/inventory/spare-parts",
            { params }
        );

        return response.data.data;
    },

    getProductById: async (productId) => {
        const response = await apiClient.get(
            `/inventory/spare-parts/${productId}`
        );

        return response.data.data;
    },

    createProduct: async (product) => {
        const response = await apiClient.post(
            "/inventory/spare-parts",
            product
        );

        return response.data.data;
    },

    updateProduct: async (
        productId,
        product
    ) => {
        const response = await apiClient.put(
            `/inventory/spare-parts/${productId}`,
            product
        );

        return response.data.data;
    },

    updateProductStatus: async (
        productId,
        status
    ) => {
        const response = await apiClient.patch(
            `/inventory/spare-parts/${productId}/status`,
            { status }
        );

        return response.data.data;
    },

    discontinueProduct: async (productId) => {
        const response = await apiClient.delete(
            `/inventory/spare-parts/${productId}`
        );

        return response.data.data;
    },
};

export default inventoryService;