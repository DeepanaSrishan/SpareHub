import apiClient from "../api/apiClient";

const register = async (registrationData) => {
    const response = await apiClient.post(
        "/auth/register",
        registrationData
    );

    return response.data.data;
};

const login = async (credentials) => {
    const response = await apiClient.post(
        "/auth/login",
        credentials
    );

    return response.data.data;
};

const authService = {
    register,
    login,
};

export default authService;