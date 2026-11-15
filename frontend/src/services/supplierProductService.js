import api from "./api";

const extractData = (response) =>
    response?.data?.data ?? response?.data;

const extractList = (response) => {
    const data = extractData(response);

    return Array.isArray(data) ? data : [];
};

export const getSupplierProducts = async (
    supplierId,
    activeOnly = false
) => {
    const response = await api.get(
        `/inventory/suppliers/${supplierId}/products`,
        {
            params: {
                activeOnly,
            },
        }
    );

    return extractList(response);
};

export const getSupplierProduct = async (
    supplierId,
    supplierProductId
) => {
    const response = await api.get(
        `/inventory/suppliers/${supplierId}/products/${supplierProductId}`
    );

    return extractData(response);
};

export const assignProductToSupplier = async (
    supplierId,
    request
) => {
    const response = await api.post(
        `/inventory/suppliers/${supplierId}/products`,
        request
    );

    return extractData(response);
};

export const updateSupplierProduct = async (
    supplierId,
    supplierProductId,
    request
) => {
    const response = await api.put(
        `/inventory/suppliers/${supplierId}/products/${supplierProductId}`,
        request
    );

    return extractData(response);
};

export const markPreferredSupplier = async (
    supplierId,
    supplierProductId
) => {
    const response = await api.patch(
        `/inventory/suppliers/${supplierId}/products/${supplierProductId}/preferred`
    );

    return extractData(response);
};

export const activateSupplierProduct = async (
    supplierId,
    supplierProductId
) => {
    const response = await api.patch(
        `/inventory/suppliers/${supplierId}/products/${supplierProductId}/activate`
    );

    return extractData(response);
};

export const deactivateSupplierProduct = async (
    supplierId,
    supplierProductId
) => {
    const response = await api.patch(
        `/inventory/suppliers/${supplierId}/products/${supplierProductId}/deactivate`
    );

    return extractData(response);
};

export const compareSupplierPrices = async (
    sparePartId
) => {
    const response = await api.get(
        `/inventory/suppliers/price-comparison/${sparePartId}`
    );

    return extractData(response);
};

const supplierProductService = {
    getSupplierProducts,
    getSupplierProduct,
    assignProductToSupplier,
    updateSupplierProduct,
    markPreferredSupplier,
    activateSupplierProduct,
    deactivateSupplierProduct,
    compareSupplierPrices,
};

export default supplierProductService;