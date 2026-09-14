import api from "./api";

const managerReportService = {
    async getSalesReport(startDate, endDate) {
        const response = await api.get(
            "/manager/reports/sales",
            {
                params: {
                    startDate,
                    endDate,
                },
            }
        );

        return response.data.data;
    },

    async getPaymentReport(startDate, endDate) {
        const response = await api.get(
            "/manager/reports/payments",
            {
                params: {
                    startDate,
                    endDate,
                },
            }
        );

        return response.data.data;
    },
};

export default managerReportService;