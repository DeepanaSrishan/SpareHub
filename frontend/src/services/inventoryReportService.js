import apiClient from "../api/apiClient";

const inventoryReportService = {
    getSummary: async () => {
        const response = await apiClient.get(
            "/manager/reports/inventory/summary"
        );

        return response.data.data;
    },

    getStockReport: async ({
                               search = "",
                               status = "",
                               categoryId = "",
                               lowStock = "",
                               available = "",
                               page = 0,
                               size = 20,
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

        if (lowStock !== "") {
            params.lowStock = lowStock;
        }

        if (available !== "") {
            params.available = available;
        }

        const response = await apiClient.get(
            "/manager/reports/inventory/stock",
            { params }
        );

        return response.data.data;
    },

    getMovementSummary: async ({
                                   fromDate,
                                   toDate,
                               } = {}) => {
        const params = {};

        if (fromDate) {
            params.fromDate = fromDate;
        }

        if (toDate) {
            params.toDate = toDate;
        }

        const response = await apiClient.get(
            "/manager/reports/inventory/movements",
            { params }
        );

        return response.data.data;
    },

    getTransactions: async ({
                                sparePartId = "",
                                type = "",
                                fromDate = "",
                                toDate = "",
                                page = 0,
                                size = 20,
                            } = {}) => {
        const params = {
            page,
            size,
        };

        if (sparePartId) {
            params.sparePartId = sparePartId;
        }

        if (type) {
            params.type = type;
        }

        if (fromDate) {
            params.fromDate = fromDate;
        }

        if (toDate) {
            params.toDate = toDate;
        }

        const response = await apiClient.get(
            "/manager/reports/inventory/transactions",
            { params }
        );

        return response.data.data;
    },
};

export default inventoryReportService;