const getApiError = (
    error,
    fallbackMessage = "Something went wrong."
) => {
    const response = error?.response?.data;

    if (response?.validationErrors) {
        return Object.values(
            response.validationErrors
        ).join(", ");
    }

    return (
        response?.message ||
        response?.error ||
        error?.message ||
        fallbackMessage
    );
};

export { getApiError };
export default getApiError;