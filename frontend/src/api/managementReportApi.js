import api from "./api";

const extractData = (response) =>
    response?.data?.data ?? response?.data;

export const getManagementDashboard = async (
    filters = {}
) => {
    const params = cleanParams(filters);

    const response = await api.get(
        "/manager/dashboard",
        { params }
    );

    return extractData(response);
};

export const generateManagementReport = async (
    filters
) => {
    const response = await api.post(
        "/manager/reports/generate",
        filters
    );

    return extractData(response);
};

export const exportManagementReport = async (
    filters
) => {
    const params = cleanParams(filters);

    const response = await api.get(
        "/manager/reports/export",
        {
            params,
            responseType: "blob",
        }
    );

    const disposition =
        response.headers["content-disposition"];

    let fileName = `${
        filters.reportType?.toLowerCase() || "management"
    }-report.csv`;

    const fileNameMatch = disposition?.match(
        /filename="?([^"]+)"?/
    );

    if (fileNameMatch?.[1]) {
        fileName = fileNameMatch[1];
    }

    const downloadUrl = window.URL.createObjectURL(
        new Blob([response.data], {
            type: "text/csv;charset=utf-8",
        })
    );

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
};

function cleanParams(object) {
    return Object.fromEntries(
        Object.entries(object).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined
        )
    );
}