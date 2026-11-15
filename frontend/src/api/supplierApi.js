import api from "./api";

const BASE_URL = "/suppliers";

const extractData = (response) => {
    return response?.data?.data ?? response?.data;
};

export const getSuppliers = async (search = "") => {
    const response = await api.get(BASE_URL, {
        params: search ? { search } : {},
    });

    const data = extractData(response);

    // Backend pagination භාවිත කරනවා නම් content return කරයි.
    return Array.isArray(data) ? data : data?.content ?? [];
};

export const getSupplierById = async (supplierId) => {
    const response = await api.get(`${BASE_URL}/${supplierId}`);
    return extractData(response);
};

export const createSupplier = async (supplierData) => {
    const response = await api.post(BASE_URL, supplierData);
    return extractData(response);
};

export const updateSupplier = async (
    supplierId,
    supplierData
) => {
    const response = await api.put(
        `${BASE_URL}/${supplierId}`,
        supplierData
    );

    return extractData(response);
};

export const deactivateSupplier = async (supplierId) => {
    const response = await api.patch(
        `${BASE_URL}/${supplierId}/deactivate`
    );

    return extractData(response);
};

export const activateSupplier = async (supplierId) => {
    const response = await api.patch(
        `${BASE_URL}/${supplierId}/activate`
    );

    return extractData(response);
};

export const suspendSupplier = async (supplierId, reason = "") => {
    const response = await api.patch(
        `${BASE_URL}/${supplierId}/suspend`,
        null,
        { params: reason ? { reason } : {} }
    );

    return extractData(response);
};

export const updateSupplierStatus = async (supplierId, status, reason = "") => {
    const response = await api.patch(
        `${BASE_URL}/${supplierId}/status`,
        null,
        { params: { status, ...(reason ? { reason } : {}) } }
    );

    return extractData(response);
};

export const getSupplierPerformance = async (supplierId) => {
    const response = await api.get(
        `/manager/suppliers/${supplierId}/performance`
    );

    return extractData(response);
};

export const getSupplierTransactions = async (supplierId) => {
    const response = await api.get(
        `/manager/suppliers/${supplierId}/transactions`
    );

    return extractData(response);
};