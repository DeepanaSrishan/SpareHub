import api from "./api";

const BASE_URL = "/inventory/supplier-purchases";

const extractData = (response) =>
    response?.data?.data ?? response?.data;

const extractList = (response) => {
    const data = extractData(response);

    return Array.isArray(data)
        ? data
        : data?.content ?? [];
};

export const getSupplierPurchases = async (
    filters = {}
) => {
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined
        )
    );

    const response = await api.get(BASE_URL, {
        params: cleanFilters,
    });

    return extractList(response);
};

export const getSupplierPurchaseById = async (
    purchaseId
) => {
    const response = await api.get(
        `${BASE_URL}/${purchaseId}`
    );

    return extractData(response);
};

export const createSupplierPurchase = async (
    request
) => {
    const response = await api.post(
        BASE_URL,
        request
    );

    return extractData(response);
};

export const receiveSupplierPurchase = async (
    purchaseId,
    request
) => {
    const response = await api.patch(
        `${BASE_URL}/${purchaseId}/receive`,
        request
    );

    return extractData(response);
};

export const cancelSupplierPurchase = async (
    purchaseId,
    request
) => {
    const response = await api.patch(
        `${BASE_URL}/${purchaseId}/cancel`,
        request
    );

    return extractData(response);
};