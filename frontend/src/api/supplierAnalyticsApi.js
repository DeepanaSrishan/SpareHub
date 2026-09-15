import api from "./api";

const extractData = (response) =>
    response?.data?.data ?? response?.data;

const extractList = (response) => {
    const data = extractData(response);

    return Array.isArray(data)
        ? data
        : data?.content ??
        data?.transactions ??
        data?.suppliers ??
        [];
};

export const getSupplierTransactions = async (
    supplierId,
    filters = {}
) => {
    const params = Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined
        )
    );

    const response = await api.get(
        `/manager/suppliers/${supplierId}/transactions`,
        { params }
    );

    return extractList(response);
};

export const getSupplierPerformance = async (
    supplierId,
    filters = {}
) => {
    const params = Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined
        )
    );

    const response = await api.get(
        `/manager/suppliers/${supplierId}/performance`,
        { params }
    );

    return extractData(response);
};

export const getSupplierPerformanceRanking = async (
    filters = {}
) => {
    const params = Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined
        )
    );

    const response = await api.get(
        "/manager/suppliers/performance",
        { params }
    );

    return extractList(response);
};