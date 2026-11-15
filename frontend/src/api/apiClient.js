import axios from "axios";

const apiClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080/api",

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 15000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(
            "sparehub_access_token"
        );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,

    (error) => {
        if (
            error.response?.status === 401 &&
            !error.config?.url?.includes("/auth/login")
        ) {
            localStorage.removeItem(
                "sparehub_access_token"
            );

            localStorage.removeItem(
                "sparehub_user"
            );

            if (
                window.location.pathname !== "/login"
            ) {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;