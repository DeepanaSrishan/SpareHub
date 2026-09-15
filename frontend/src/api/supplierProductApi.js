import api from "./api";

const SUPPLIER_URL = "/inventory/suppliers";
const PRODUCT_URL = "/inventory/spare-parts";

const extractData = (response) =>
    response?.data?.data ?? response?.data;

const extractList = (response) => {
    const data = extractData(response);

    return Array.isArray(data)
        ? data
        : data?.content ?? [];
};

export const getActiveSpareParts = async () => {
    const response = await api.get(PRODUCT_URL, {
        params: {
            status: "ACTIVE",
            size: 1000,
        },
    });

    return extractList(response);
};

export const getSupplierProducts = async (
    supplierId
) => {
    const response = await api.get(
        `${SUPPLIER_URL}/${supplierId}/products`
    );

    return extractList(response);
};

export const assignProductToSupplier = async (
    supplierId,
    request
) => {
    const response = await api.post(
        `${SUPPLIER_URL}/${supplierId}/products`,
        request
    );

    return extractData(response);
};

export const updateSupplierProduct = async (
    supplierId,
    assignmentId,
    request
) => {
    const response = await api.put(
        `${SUPPLIER_URL}/${supplierId}/products/${assignmentId}`,
        request
    );

    return extractData(response);
};

export const markPreferredSupplier = async (
    supplierId,
    assignmentId
) => {
    const response = await api.patch(
        `${SUPPLIER_URL}/${supplierId}/products/${assignmentId}/preferred`
    );

    return extractData(response);
};

export const removeSupplierProduct = async (
    supplierId,
    assignmentId
) => {
    await api.delete(
        `${SUPPLIER_URL}/${supplierId}/products/${assignmentId}`
    );
};